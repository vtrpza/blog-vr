import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const wrangler = fileURLToPath(new URL("../node_modules/.bin/wrangler", import.meta.url));
const cwd = fileURLToPath(new URL("..", import.meta.url));
const migrate = spawnSync(wrangler, ["d1", "migrations", "apply", "DB", "--local"], { cwd, stdio: "inherit" });
if (migrate.status !== 0) process.exit(migrate.status ?? 1);
const increment = "UPDATE batches SET published_count=published_count+1 WHERE id='self-check-cap' AND published_count<target_count;";
const rateIncrement = "INSERT INTO contact_rate_limits(key,window_start,count,updated_at) VALUES('self-check-rate',datetime('now'),1,datetime('now')) ON CONFLICT(key) DO UPDATE SET count=count+1;";
const capSql = `INSERT OR REPLACE INTO batches(id,target_count,attempt_limit,published_count,status,created_at,updated_at) VALUES('self-check-cap',90,100,0,'running',datetime('now'),datetime('now'));${increment.repeat(91)}SELECT published_count FROM batches WHERE id='self-check-cap';DELETE FROM batches WHERE id='self-check-cap';${rateIncrement.repeat(6)}SELECT count FROM contact_rate_limits WHERE key='self-check-rate';DELETE FROM contact_rate_limits WHERE key='self-check-rate';INSERT OR REPLACE INTO lead_receipts(idempotency_hash,pipedrive_lead_id,status,created_at,updated_at) VALUES('self-check-claim',NULL,'pending','2026-07-15T03:00:00Z','2026-07-15T03:00:00Z');INSERT INTO lead_receipts(idempotency_hash,pipedrive_lead_id,status,created_at,updated_at) VALUES('self-check-claim',NULL,'pending','2026-07-15T03:01:00Z','2026-07-15T03:01:00Z') ON CONFLICT(idempotency_hash) DO UPDATE SET updated_at=excluded.updated_at WHERE lead_receipts.status='pending' AND lead_receipts.updated_at<'2026-07-15T02:56:00Z';SELECT COUNT(*) claims FROM lead_receipts WHERE idempotency_hash='self-check-claim';DELETE FROM lead_receipts WHERE idempotency_hash='self-check-claim';`;
const cap = spawnSync(wrangler, ["d1", "execute", "DB", "--local", "--command", capSql], { cwd, encoding: "utf8" });
if (cap.status !== 0 || !cap.stdout.includes('"published_count": 90') || !cap.stdout.includes('"count": 6') || !cap.stdout.includes('"claims": 1')) throw new Error(`D1 invariant check failed\n${cap.stdout}\n${cap.stderr}`);
const qaClaimSql = "INSERT OR REPLACE INTO batches(id,target_count,attempt_limit,published_count,status,created_at,updated_at) VALUES('self-check-qa',1,1,0,'running',datetime('now'),datetime('now'));INSERT OR IGNORE INTO qa_activity_claims(batch_id,status,created_at,updated_at) VALUES('self-check-qa','pending',datetime('now'),datetime('now'));INSERT OR IGNORE INTO qa_activity_claims(batch_id,status,created_at,updated_at) VALUES('self-check-qa','pending',datetime('now'),datetime('now'));SELECT COUNT(*) qa_claims FROM qa_activity_claims WHERE batch_id='self-check-qa';DELETE FROM qa_activity_claims WHERE batch_id='self-check-qa';DELETE FROM batches WHERE id='self-check-qa';";
const qaClaim = spawnSync(wrangler, ["d1", "execute", "DB", "--local", "--command", qaClaimSql], { cwd, encoding: "utf8" });
if (qaClaim.status !== 0 || !qaClaim.stdout.includes('"qa_claims": 1')) throw new Error(`QA claim check failed\n${qaClaim.stdout}\n${qaClaim.stderr}`);
const workflowSetupSql = "DELETE FROM topics WHERE id IN (900003,900004);DELETE FROM batch_launches WHERE batch_id='self-check-workflow';DELETE FROM batches WHERE id='self-check-workflow';INSERT INTO batches(id,target_count,attempt_limit,published_count,status,created_at,updated_at) VALUES('self-check-workflow',1,2,0,'running',datetime('now'),datetime('now'));INSERT OR IGNORE INTO batch_launches(batch_id,status,created_at,updated_at) VALUES('self-check-workflow','launching',datetime('now'),datetime('now'));INSERT OR IGNORE INTO batch_launches(batch_id,status,created_at,updated_at) VALUES('self-check-workflow','launching',datetime('now'),datetime('now'));INSERT INTO topics(id,intent_key,cluster,query,brief,allowed_domains_json,priority,status,created_at,updated_at) VALUES(900003,'self-check-reserve-1','busca-e-apreensao','q','b','[]',10000,'pending',datetime('now'),datetime('now')),(900004,'self-check-reserve-2','busca-e-apreensao','q','b','[]',9999,'pending',datetime('now'),datetime('now'));";
const workflowSetup = spawnSync(wrangler, ["d1", "execute", "DB", "--local", "--command", workflowSetupSql], { cwd, encoding: "utf8" });
const reserveSql = "UPDATE topics SET status='running',batch_id='self-check-workflow',workflow_id='self-check-workflow-1',updated_at=datetime('now') WHERE id=COALESCE((SELECT id FROM topics WHERE workflow_id='self-check-workflow-1' LIMIT 1),(SELECT id FROM topics WHERE status IN ('held','pending') ORDER BY CASE status WHEN 'held' THEN 0 ELSE 1 END,priority DESC,id LIMIT 1)) AND (workflow_id='self-check-workflow-1' OR status IN ('held','pending'));";
const reserveFirst = spawnSync(wrangler, ["d1", "execute", "DB", "--local", "--command", reserveSql], { cwd, encoding: "utf8" });
const reserveRetry = spawnSync(wrangler, ["d1", "execute", "DB", "--local", "--command", reserveSql], { cwd, encoding: "utf8" });
const workflowCheck = spawnSync(wrangler, ["d1", "execute", "DB", "--local", "--command", "SELECT (SELECT COUNT(*) FROM topics WHERE workflow_id='self-check-workflow-1') workflow_topics,(SELECT COUNT(*) FROM batch_launches WHERE batch_id='self-check-workflow') launch_claims;DELETE FROM topics WHERE id IN (900003,900004);DELETE FROM batch_launches WHERE batch_id='self-check-workflow';DELETE FROM batches WHERE id='self-check-workflow';"], { cwd, encoding: "utf8" });
if ([workflowSetup, reserveFirst, reserveRetry, workflowCheck].some((result) => result.status !== 0) || !workflowCheck.stdout.includes('"workflow_topics": 1') || !workflowCheck.stdout.includes('"launch_claims": 1')) throw new Error(`workflow idempotency check failed\n${workflowCheck.stdout}\n${workflowCheck.stderr}`);
const publishSetup = "DELETE FROM posts WHERE id IN ('self-check-post-1','self-check-post-2');DELETE FROM topics WHERE id IN (900001,900002);DELETE FROM batches WHERE id='self-check-publish';INSERT INTO batches(id,target_count,attempt_limit,published_count,status,created_at,updated_at) VALUES('self-check-publish',1,2,0,'running',datetime('now'),datetime('now'));INSERT INTO topics(id,intent_key,cluster,query,brief,allowed_domains_json,status,batch_id,workflow_id,created_at,updated_at) VALUES(900001,'self-check-intent-1','busca-e-apreensao','q','b','[]','running','self-check-publish','self-check-wf-1',datetime('now'),datetime('now')),(900002,'self-check-intent-2','busca-e-apreensao','q','b','[]','running','self-check-publish','self-check-wf-2',datetime('now'),datetime('now'));INSERT INTO posts(id,slug,topic_id,title,meta_description,excerpt,content_json,sources_json,status,workflow_id,batch_id,updated_at) VALUES('self-check-post-1','self-check-post-1',900001,'t','m','e','[]','[]','draft','self-check-wf-1','self-check-publish',datetime('now')),('self-check-post-2','self-check-post-2',900002,'t','m','e','[]','[]','draft','self-check-wf-2','self-check-publish',datetime('now'));UPDATE posts SET status='published',updated_at=datetime('now') WHERE id='self-check-post-1';SELECT published_count FROM batches WHERE id='self-check-publish';";
const firstPublish = spawnSync(wrangler, ["d1", "execute", "DB", "--local", "--command", publishSetup], { cwd, encoding: "utf8" });
if (firstPublish.status !== 0 || !firstPublish.stdout.includes('"published_count": 1')) throw new Error(`atomic publication setup failed\n${firstPublish.stdout}\n${firstPublish.stderr}`);
const overflowPublish = spawnSync(wrangler, ["d1", "execute", "DB", "--local", "--command", "UPDATE posts SET status='published',updated_at=datetime('now') WHERE id='self-check-post-2';"], { cwd, encoding: "utf8" });
if (overflowPublish.status === 0 || !`${overflowPublish.stdout}${overflowPublish.stderr}`.includes("weekly target reached")) throw new Error("weekly publication trigger did not reject overflow");
const publishCleanup = spawnSync(wrangler, ["d1", "execute", "DB", "--local", "--command", "SELECT published_count,(SELECT status FROM posts WHERE id='self-check-post-2') overflow_status FROM batches WHERE id='self-check-publish';DELETE FROM posts WHERE id IN ('self-check-post-1','self-check-post-2');DELETE FROM topics WHERE id IN (900001,900002);DELETE FROM batches WHERE id='self-check-publish';"], { cwd, encoding: "utf8" });
if (publishCleanup.status !== 0 || !publishCleanup.stdout.includes('"published_count": 1') || !publishCleanup.stdout.includes('"overflow_status": "draft"')) throw new Error(`atomic publication rollback failed\n${publishCleanup.stdout}\n${publishCleanup.stderr}`);

const server = spawn(wrangler, ["dev", "--local", "--port", "8791"], { cwd, stdio: ["ignore", "pipe", "pipe"] });
let logs = "";
server.stdout.on("data", (chunk) => { logs += chunk; });
server.stderr.on("data", (chunk) => { logs += chunk; });
const stop = () => { if (!server.killed) server.kill("SIGTERM"); };
process.once("SIGINT", () => { stop(); process.exit(130); });

try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { ready = (await fetch("http://127.0.0.1:8791/health")).ok; }
    catch { /* server is still starting */ }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error(`Worker did not become ready\n${logs}`);

  const expected = new Map([
    ["/", 200], ["/busca-e-apreensao/", 200], ["/revisao-de-contratos-bancarios/", 200],
    ["/dividas-bancarias-empresariais/", 200], ["/autores/equipe-editorial/", 200],
    ["/politica-editorial/", 200], ["/privacidade/", 200], ["/contato/", 200],
    ["/sitemap.xml", 200], ["/robots.txt", 200], ["/og-default.webp", 200], ["/nao-existe/", 404]
  ]);
  for (const [path, status] of expected) {
    const response = await fetch(`http://127.0.0.1:8791${path}`);
    if (response.status !== status) throw new Error(`${path}: expected ${status}, got ${response.status}`);
  }
  const homeResponse = await fetch("http://127.0.0.1:8791/");
  if (homeResponse.headers.get("x-robots-tag") !== "noindex, nofollow") throw new Error("local/staging noindex header missing");
  const home = await homeResponse.text();
  if (!home.includes('rel="canonical"') || !home.includes('property="og:image"')) throw new Error("home SEO tags missing");
  const schema = home.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];
  if (!schema) throw new Error("home schema missing");
  JSON.parse(schema);
  const sitemap = await (await fetch("http://127.0.0.1:8791/sitemap.xml")).text();
  if (/draft|held|rejected/.test(sitemap)) throw new Error("non-public status leaked into sitemap");
  for (const loc of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const path = new URL(loc[1]).pathname;
    if (!(await fetch(`http://127.0.0.1:8791${path}`)).ok) throw new Error(`sitemap URL failed: ${path}`);
  }
  if (!(await (await fetch("http://127.0.0.1:8791/robots.txt")).text()).includes("Disallow: /")) throw new Error("local/staging robots guard missing");
  const contact = await fetch("http://127.0.0.1:8791/api/contact", { method: "POST" });
  if (contact.status !== 503) throw new Error(`unconfigured contact must fail closed, got ${contact.status}`);
  console.log(JSON.stringify({ ok: true, routes: expected.size, weeklyCap: 90, contactRateLimit: 5, contact: "fail-closed" }));
} finally {
  stop();
}
