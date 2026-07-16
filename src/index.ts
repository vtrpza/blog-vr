import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { buildBatchRequests, GenerationRejectedError, generateArticle, isTooSimilar, type Article, type GenerationRun } from "./content.ts";
import { contactRateLimitKey, contactSubmissionId, createPipedriveLead, createPipedriveQaActivity, parseContact, readUrlEncoded, verifyTurnstile, type PipedriveConfig } from "./pipedrive.ts";
import { renderArticle, renderAuthor, renderContact, renderHome, renderPage, renderSitemap, type PublishedPost } from "./site.ts";

type WorkflowParams = { batchId: string; index: number; runAt: number };

interface Env extends Cloudflare.Env {
  TURNSTILE_SECRET?: string;
  IDEMPOTENCY_SECRET?: string;
  OPENAI_API_KEY?: string;
  PIPEDRIVE_API_TOKEN?: string;
}

type PostRow = {
  topic_id: number;
  slug: string;
  title: string;
  meta_description: string;
  excerpt: string;
  content_json: string;
  sources_json: string;
  author_slug: string;
  published_at: string;
  updated_at: string;
};

type TopicRow = { id: number; cluster: string; query: string; brief: string; allowed_domains_json: string };

const STATIC_PAGES = new Set(["busca-e-apreensao", "revisao-de-contratos-bancarios", "dividas-bancarias-empresariais", "sobre", "politica-editorial", "politica-de-correcoes", "privacidade"]);
const PILLAR_CLUSTERS: Record<string, string> = {
  "busca-e-apreensao": "busca-e-apreensao",
  "revisao-de-contratos-bancarios": "revisao-de-contratos",
  "dividas-bancarias-empresariais": "dividas-empresariais"
};

function toPost(row: PostRow): PublishedPost {
  return {
    title: row.title,
    slug: row.slug,
    metaDescription: row.meta_description,
    excerpt: row.excerpt,
    blocks: JSON.parse(row.content_json) as Article["blocks"],
    sources: JSON.parse(row.sources_json) as Article["sources"],
    authorSlug: row.author_slug,
    publishedAt: row.published_at,
    updatedAt: row.updated_at
  };
}

function headers(contentType: string, cache = false): Headers {
  return new Headers({
    "content-type": contentType,
    "cache-control": cache ? "public, max-age=0, s-maxage=300" : "no-store",
    "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY"
  });
}

function html(body: string, status = 200, cache = true): Response {
  return new Response(body, { status, headers: headers("text/html; charset=utf-8", cache) });
}

async function publishedPosts(env: Env, limit?: number): Promise<PublishedPost[]> {
  const suffix = limit ? " LIMIT ?" : "";
  const statement = env.DB.prepare(`SELECT topic_id,slug,title,meta_description,excerpt,content_json,sources_json,author_slug,published_at,updated_at FROM posts WHERE status='published' ORDER BY published_at DESC${suffix}`);
  const result = limit ? await statement.bind(limit).all<PostRow>() : await statement.all<PostRow>();
  return result.results.map(toPost);
}

function pipedriveConfig(env: Env): PipedriveConfig {
  return {
    baseUrl: env.PIPEDRIVE_BASE_URL,
    token: env.PIPEDRIVE_API_TOKEN ?? "",
    ownerId: Number(env.PIPEDRIVE_OWNER_ID),
    labelId: env.PIPEDRIVE_BLOG_LABEL_ID,
    channel: Number(env.PIPEDRIVE_CHANNEL),
    channelId: env.PIPEDRIVE_CHANNEL_ID,
    activityType: env.PIPEDRIVE_ACTIVITY_TYPE,
    fields: {
      sourceUrl: env.PIPEDRIVE_FIELD_SOURCE_URL,
      cluster: env.PIPEDRIVE_FIELD_CLUSTER,
      cta: env.PIPEDRIVE_FIELD_CTA,
      utmCampaign: env.PIPEDRIVE_FIELD_UTM,
      consentAt: env.PIPEDRIVE_FIELD_CONSENT,
      submissionId: env.PIPEDRIVE_FIELD_SUBMISSION
    }
  };
}

async function allowContact(env: Env, ip: string): Promise<boolean> {
  if (!ip || !env.TURNSTILE_SECRET) return false;
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / 3_600_000) * 3_600_000).toISOString();
  const key = await contactRateLimitKey(env.TURNSTILE_SECRET, ip, windowStart);
  const row = await env.DB.prepare("INSERT INTO contact_rate_limits(key,window_start,count,updated_at) VALUES(?,?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1,updated_at=excluded.updated_at RETURNING count")
    .bind(key, windowStart, new Date(now).toISOString()).first<{ count: number }>();
  await env.DB.prepare("DELETE FROM contact_rate_limits WHERE window_start<?").bind(new Date(now - 172_800_000).toISOString()).run();
  return Boolean(row && row.count <= 5);
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (!env.TURNSTILE_SECRET || !env.IDEMPOTENCY_SECRET || !env.PIPEDRIVE_API_TOKEN || Number(env.PIPEDRIVE_OWNER_ID) <= 0) {
    return html("<h1>Integração ainda não configurada</h1><p>Tente novamente após a ativação do ambiente.</p>", 503, false);
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("application/x-www-form-urlencoded")) return html("<h1>Formato inválido</h1>", 415, false);
  let form: URLSearchParams;
  try { form = await readUrlEncoded(request, 16_384); }
  catch (error) { return html("<h1>Envio inválido</h1>", error instanceof RangeError ? 413 : 400, false); }
  if (String(form.get("website") ?? "")) return new Response(null, { status: 204 });
  let turnstile = false;
  try {
    turnstile = await verifyTurnstile(String(form.get("cf-turnstile-response") ?? ""), request.headers.get("CF-Connecting-IP") ?? "", env.TURNSTILE_SECRET, env.EXPECTED_HOSTNAME);
  } catch {
    return html("<h1>Validação temporariamente indisponível</h1><p>Tente novamente em alguns minutos.</p>", 503, false);
  }
  if (!turnstile) return html("<h1>Não foi possível validar o envio</h1><p>Atualize a página e tente novamente.</p>", 400, false);

  let contact;
  try {
    contact = parseContact({
      name: form.get("name"), email: form.get("email"), phone: form.get("phone"), uf: form.get("uf"),
      subject: form.get("subject"), message: form.get("message"), consent: form.get("consent") === "true"
    });
  } catch {
    return html("<h1>Revise os dados</h1><p>Informe nome, UF e ao menos um canal válido para retorno.</p>", 400, false);
  }
  if (!await allowContact(env, request.headers.get("CF-Connecting-IP") ?? "")) {
    return html("<h1>Limite temporário atingido</h1><p>Aguarde antes de enviar uma nova solicitação.</p>", 429, false);
  }

  let sourceUrl = String(form.get("sourceUrl") ?? env.SITE_URL);
  try {
    const source = new URL(sourceUrl);
    if (source.origin !== new URL(env.SITE_URL).origin) sourceUrl = env.SITE_URL;
  } catch { sourceUrl = env.SITE_URL; }
  const source = new URL(sourceUrl);
  const cluster = contact.subject === "revisao-de-contrato" ? "revisao-de-contratos" : contact.subject === "divida-empresarial" ? "dividas-empresariais" : contact.subject;
  const consentAt = new Date().toISOString();
  const submissionId = await contactSubmissionId(env.IDEMPOTENCY_SECRET, contact, consentAt.slice(0, 10));
  await env.DB.prepare("DELETE FROM lead_receipts WHERE updated_at<?").bind(new Date(Date.parse(consentAt) - 604_800_000).toISOString()).run();
  const claim = await env.DB.prepare("INSERT INTO lead_receipts(idempotency_hash,pipedrive_lead_id,status,created_at,updated_at) VALUES(?,NULL,'pending',?,?) ON CONFLICT(idempotency_hash) DO UPDATE SET updated_at=excluded.updated_at WHERE lead_receipts.status='pending' AND lead_receipts.updated_at<? RETURNING status")
    .bind(submissionId, consentAt, consentAt, new Date(Date.parse(consentAt) - 300_000).toISOString()).first<{ status: string }>();
  if (!claim) {
    const receipt = await env.DB.prepare("SELECT status FROM lead_receipts WHERE idempotency_hash=?").bind(submissionId).first<{ status: string }>();
    if (receipt?.status === "completed") return Response.redirect(`${env.SITE_URL}/contato/?enviado=1`, 303);
    return html("<h1>Solicitação em processamento</h1><p>Aguarde alguns instantes antes de tentar novamente.</p>", 202, false);
  }
  try {
    const result = await createPipedriveLead(contact, {
      submissionId, sourceUrl, cluster, cta: "formulario", utmCampaign: source.searchParams.get("utm_campaign") ?? "", consentAt
    }, pipedriveConfig(env));
    await env.DB.prepare("UPDATE lead_receipts SET pipedrive_lead_id=?,status='completed',updated_at=? WHERE idempotency_hash=? AND status='pending' AND updated_at=?")
      .bind(result.leadId, new Date().toISOString(), submissionId, consentAt).run();
  } catch (error) {
    await env.DB.prepare("DELETE FROM lead_receipts WHERE idempotency_hash=? AND status='pending' AND updated_at=?").bind(submissionId, consentAt).run();
    console.error("contact integration failed", error instanceof Error ? error.name : "unknown");
    return html("<h1>Não foi possível concluir o envio</h1><p>Nenhum sucesso foi confirmado. Tente novamente em alguns minutos.</p>", 503, false);
  }
  return Response.redirect(`${env.SITE_URL}/contato/?enviado=1`, 303);
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "POST" && url.pathname === "/api/contact") return handleContact(request, env);
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD, POST" } });

  if (!url.pathname.endsWith("/") && !url.pathname.includes(".") && url.pathname !== "/health") return Response.redirect(`${url.origin}${url.pathname}/${url.search}`, 308);
  if (url.pathname === "/styles.css" || url.pathname === "/favicon.svg") return env.ASSETS.fetch(request);
  if (url.pathname === "/health") {
    await env.DB.prepare("SELECT 1").first();
    return Response.json({ status: "ok" }, { headers: { "cache-control": "no-store" } });
  }
  if (url.pathname === "/robots.txt") return new Response(env.ENVIRONMENT === "production" ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${env.SITE_URL}/sitemap.xml\n` : "User-agent: *\nDisallow: /\n", { headers: headers("text/plain; charset=utf-8", true) });
  if (url.pathname === "/sitemap.xml") return new Response(renderSitemap(await publishedPosts(env), env.SITE_URL), { headers: headers("application/xml; charset=utf-8", true) });
  if (url.pathname === "/") return html(renderHome(await publishedPosts(env, 9), env.SITE_URL));
  if (url.pathname === "/autores/equipe-editorial/") return html(renderAuthor(env.SITE_URL));
  if (url.pathname === "/contato/") {
    const sourceUrl = new URL("/contato/", env.SITE_URL);
    for (const key of ["origem", "utm_campaign"]) {
      const value = url.searchParams.get(key);
      if (value && /^[a-zA-Z0-9_-]{1,100}$/.test(value)) sourceUrl.searchParams.set(key, value);
    }
    return html(renderContact(env.SITE_URL, env.TURNSTILE_SITE_KEY, url.searchParams.get("enviado") === "1", sourceUrl.toString()), 200, false);
  }

  const article = url.pathname.match(/^\/artigos\/([a-z0-9-]+)\/$/);
  if (article) {
    const row = await env.DB.prepare("SELECT topic_id,slug,title,meta_description,excerpt,content_json,sources_json,author_slug,published_at,updated_at FROM posts WHERE slug=? AND status='published'").bind(article[1]).first<PostRow>();
    if (!row) return html("<h1>Artigo não encontrado</h1>", 404, false);
    const related = await env.DB.prepare(`SELECT p.topic_id,p.slug,p.title,p.meta_description,p.excerpt,p.content_json,p.sources_json,p.author_slug,p.published_at,p.updated_at FROM posts p JOIN topics t ON t.id=p.topic_id WHERE p.status='published' AND p.topic_id<>? AND t.cluster=(SELECT cluster FROM topics WHERE id=?) ORDER BY p.published_at DESC LIMIT 3`).bind(row.topic_id, row.topic_id).all<PostRow>();
    return html(renderArticle(toPost(row), env.SITE_URL, related.results.map(toPost)));
  }
  const slug = url.pathname.slice(1, -1);
  if (STATIC_PAGES.has(slug)) {
    const cluster = PILLAR_CLUSTERS[slug];
    if (!cluster) return html(renderPage(slug, env.SITE_URL));
    const result = await env.DB.prepare(`SELECT p.topic_id,p.slug,p.title,p.meta_description,p.excerpt,p.content_json,p.sources_json,p.author_slug,p.published_at,p.updated_at FROM posts p JOIN topics t ON t.id=p.topic_id WHERE p.status='published' AND t.cluster=? ORDER BY p.published_at DESC LIMIT 12`).bind(cluster).all<PostRow>();
    return html(renderPage(slug, env.SITE_URL, result.results.map(toPost)));
  }
  const asset = await env.ASSETS.fetch(request);
  return asset.status === 404 ? html("<h1>Página não encontrada</h1><p><a href=\"/\">Voltar ao início</a></p>", 404, false) : asset;
}

async function startBatch(controller: ScheduledController, env: Env): Promise<void> {
  const batchId = new Date(controller.scheduledTime).toISOString().slice(0, 10);
  if (env.PIPEDRIVE_API_TOKEN && Number(env.PIPEDRIVE_QA_OWNER_ID) > 0) {
    const pending = await env.DB.prepare("SELECT id,published_count,target_count,status FROM batches WHERE id<? AND pipedrive_qa_activity_id IS NULL AND (SELECT COUNT(DISTINCT workflow_id) FROM editorial_events WHERE batch_id=batches.id)>=attempt_limit ORDER BY id LIMIT 4").bind(batchId).all<{ id: string; published_count: number; target_count: number; status: string }>();
    for (const batch of pending.results) {
      const claimedAt = new Date().toISOString();
      const claim = await env.DB.prepare("INSERT OR IGNORE INTO qa_activity_claims(batch_id,status,created_at,updated_at) VALUES(?,'pending',?,?)").bind(batch.id, claimedAt, claimedAt).run();
      if (!claim.meta.changes) continue;
      try {
        const counts = await env.DB.prepare("SELECT SUM(status='rejected') rejected,SUM(status='held') held FROM topics WHERE batch_id=?").bind(batch.id).first<{ rejected: number; held: number }>();
        const sample = await env.DB.prepare("SELECT slug FROM posts WHERE batch_id=? AND status='published' ORDER BY slug LIMIT 10").bind(batch.id).all<{ slug: string }>();
        const activityId = await createPipedriveQaActivity({
          batchId: batch.id,
          published: batch.published_count,
          rejected: counts?.rejected ?? 0,
          held: counts?.held ?? 0,
          shortfall: batch.published_count < batch.target_count,
          sampleUrls: sample.results.map((post) => `${env.SITE_URL}/artigos/${post.slug}/`)
        }, {
          baseUrl: env.PIPEDRIVE_BASE_URL,
          token: env.PIPEDRIVE_API_TOKEN,
          ownerId: Number(env.PIPEDRIVE_QA_OWNER_ID),
          activityType: env.PIPEDRIVE_ACTIVITY_TYPE
        });
        const completedAt = new Date().toISOString();
        await env.DB.batch([
          env.DB.prepare("UPDATE qa_activity_claims SET status='completed',activity_id=?,updated_at=? WHERE batch_id=? AND status='pending'").bind(activityId, completedAt, batch.id),
          env.DB.prepare("UPDATE batches SET pipedrive_qa_activity_id=?,status=?,updated_at=? WHERE id=?").bind(activityId, batch.published_count >= batch.target_count ? "completed" : "shortfall", completedAt, batch.id)
        ]);
      } catch (error) {
        // ponytail: ambiguous remote results stay blocked; manual reconciliation is safer than a duplicate Activity.
        await env.DB.prepare("UPDATE qa_activity_claims SET status='uncertain',updated_at=? WHERE batch_id=? AND status='pending'").bind(new Date().toISOString(), batch.id).run();
        console.error("weekly QA activity failed", error instanceof Error ? error.name : "unknown");
      }
    }
  }
  const now = new Date(controller.scheduledTime).toISOString();
  const [inserted] = await env.DB.batch([
    env.DB.prepare("INSERT OR IGNORE INTO batches(id,target_count,attempt_limit,published_count,status,created_at,updated_at) VALUES(?,90,100,0,'running',?,?)").bind(batchId, now, now),
    env.DB.prepare("INSERT OR IGNORE INTO batch_launches(batch_id,status,created_at,updated_at) VALUES(?,'launching',?,?)").bind(batchId, now, now)
  ]);
  if (!inserted.meta.changes) return;
  const jobs = buildBatchRequests(batchId, controller.scheduledTime);
  try {
    await env.CONTENT_WORKFLOW.createBatch(jobs.map((job) => ({ id: job.id, params: { ...job.params, runAt: job.runAt } })));
    await env.DB.prepare("UPDATE batch_launches SET status='confirmed',updated_at=? WHERE batch_id=? AND status='launching'").bind(new Date().toISOString(), batchId).run();
  } catch (error) {
    await env.DB.prepare("UPDATE batch_launches SET status='uncertain',updated_at=? WHERE batch_id=? AND status='launching'").bind(new Date().toISOString(), batchId).run();
    throw error;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const cacheable = env.ENVIRONMENT === "production" && request.method === "GET" && !url.search && !["/contato/", "/health"].includes(url.pathname);
    const edgeCache = (caches as CacheStorage & { default: Cache }).default;
    if (cacheable) {
      const cached = await edgeCache.match(request);
      if (cached) return cached;
    }
    let response = await route(request, env);
    if (env.ENVIRONMENT !== "production") {
      response = new Response(response.body, response);
      response.headers.set("x-robots-tag", "noindex, nofollow");
    }
    if (cacheable && response.ok && response.headers.get("cache-control")?.startsWith("public")) ctx.waitUntil(edgeCache.put(request, response.clone()));
    return response;
  },
  scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): void {
    if (String(env.EDITORIAL_ENABLED) !== "true") return;
    ctx.waitUntil(startBatch(controller, env));
  }
} satisfies ExportedHandler<Env>;

export class ContentWorkflow extends WorkflowEntrypoint<Env, WorkflowParams> {
  async run(event: Readonly<WorkflowEvent<WorkflowParams>>, step: WorkflowStep): Promise<{ status: string; postId?: string }> {
    const { batchId, runAt } = event.payload;
    if (runAt > Date.now()) await step.sleepUntil("scheduled publication slot", runAt);
    const now = new Date().toISOString();
    const topic = await step.do("reserve topic", async () => this.env.DB.prepare(`
      UPDATE topics SET status='running',batch_id=?,workflow_id=?,updated_at=?
      WHERE id=COALESCE(
        (SELECT id FROM topics WHERE workflow_id=? LIMIT 1),
        (SELECT id FROM topics WHERE status IN ('held','pending') ORDER BY CASE status WHEN 'held' THEN 0 ELSE 1 END,priority DESC,id LIMIT 1)
      )
      AND (workflow_id=? OR status IN ('held','pending'))
      RETURNING id,cluster,query,brief,allowed_domains_json
    `).bind(batchId, event.instanceId, now, event.instanceId, event.instanceId).first<TopicRow>());
    if (!topic) {
      await step.do("mark shortfall", async () => {
        const timestamp = new Date().toISOString();
        await this.env.DB.batch([
          this.env.DB.prepare("UPDATE batches SET status='shortfall',updated_at=? WHERE id=? AND status='running'").bind(timestamp, batchId),
          this.env.DB.prepare("INSERT OR IGNORE INTO editorial_events(topic_id,batch_id,workflow_id,event,detail,created_at) VALUES(NULL,?,?,'shortfall','no_topic_available',?)").bind(batchId, event.instanceId, timestamp)
        ]);
        return true;
      });
      return { status: "shortfall" };
    }

    let generated: { article: Article; runs: GenerationRun[] };
    try {
      generated = await step.do("generate and audit", { retries: { limit: 3, delay: "10 seconds", backoff: "exponential" }, timeout: "10 minutes" }, async () => {
        if (!this.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
        return generateArticle(
          { cluster: topic.cluster, query: topic.query, brief: topic.brief, allowedDomains: JSON.parse(topic.allowed_domains_json) as string[] },
          { apiKey: this.env.OPENAI_API_KEY, model: this.env.OPENAI_MODEL },
          fetch,
          async (run) => {
            await this.env.DB.prepare("INSERT OR IGNORE INTO generation_runs(post_id,topic_id,batch_id,workflow_id,openai_response_id,stage,model,input_tokens,output_tokens,status,created_at) VALUES(NULL,?,?,?,?,?,?,?,?,?,?)")
              .bind(topic.id, batchId, event.instanceId, run.responseId, run.stage, this.env.OPENAI_MODEL, run.inputTokens, run.outputTokens, "received", new Date().toISOString()).run();
          }
        );
      });
    } catch (error) {
      const editorialRejection = error instanceof GenerationRejectedError || (error instanceof Error && (error.name === "GenerationRejectedError" || error.message.startsWith("editorial_rejection:")));
      await step.do(editorialRejection ? "reject failed generation" : "hold failed generation", async () => {
        const timestamp = new Date().toISOString();
        await this.env.DB.batch([
          this.env.DB.prepare("UPDATE topics SET status=?,updated_at=? WHERE id=?").bind(editorialRejection ? "rejected" : "held", timestamp, topic.id),
          this.env.DB.prepare("UPDATE generation_runs SET status=?,error_code=? WHERE workflow_id=?").bind(editorialRejection ? "rejected" : "failed", error instanceof Error ? error.name : "unknown", event.instanceId),
          this.env.DB.prepare(`INSERT OR IGNORE INTO editorial_events(topic_id,batch_id,workflow_id,event,detail,created_at) VALUES(?,?,?,?,?,?)`).bind(topic.id, batchId, event.instanceId, editorialRejection ? "generation_rejected" : "held", editorialRejection ? "quality_gate" : "generation_failure", timestamp)
        ]);
        return true;
      });
      console.error(editorialRejection ? "content generation rejected" : "content generation held", error instanceof Error ? error.name : "unknown");
      return { status: editorialRejection ? "rejected" : "held" };
    }

    const existing = await step.do("check cannibalization", async () => {
      const result = await this.env.DB.prepare("SELECT title,excerpt FROM posts WHERE status IN ('draft','published')").all<{ title: string; excerpt: string }>();
      return result.results;
    });
    if (isTooSimilar(generated.article, existing)) {
      await step.do("reject near duplicate", async () => {
        const timestamp = new Date().toISOString();
        await this.env.DB.batch([
          this.env.DB.prepare("UPDATE topics SET status='rejected',updated_at=? WHERE id=?").bind(timestamp, topic.id),
          this.env.DB.prepare("UPDATE generation_runs SET status='rejected',error_code='near_duplicate' WHERE workflow_id=?").bind(event.instanceId),
          this.env.DB.prepare("INSERT OR IGNORE INTO editorial_events(topic_id,batch_id,workflow_id,event,detail,created_at) VALUES(?,?,?,'near_duplicate','similarity_threshold',?)").bind(topic.id, batchId, event.instanceId, timestamp)
        ]);
        return true;
      });
      return { status: "rejected" };
    }

    const postId = `post-${topic.id}`;
    try {
      await step.do("store validated draft", async () => {
        const ownPost = await this.env.DB.prepare("SELECT id FROM posts WHERE workflow_id=?").bind(event.instanceId).first<{ id: string }>();
        if (ownPost) return true;
        const timestamp = new Date().toISOString();
        await this.env.DB.batch([
          this.env.DB.prepare(`INSERT INTO posts(id,slug,topic_id,title,meta_description,excerpt,content_json,sources_json,author_slug,status,workflow_id,batch_id,updated_at)
            VALUES(?,?,?,?,?,?,?,?,'equipe-editorial','draft',?,?,?)`).bind(postId, generated.article.slug, topic.id, generated.article.title, generated.article.metaDescription, generated.article.excerpt, JSON.stringify(generated.article.blocks), JSON.stringify(generated.article.sources), event.instanceId, batchId, timestamp),
          this.env.DB.prepare("UPDATE generation_runs SET post_id=?,status='ok' WHERE workflow_id=?").bind(postId, event.instanceId)
        ]);
        return true;
      });
    } catch {
      await step.do("reject duplicate draft", async () => {
        const timestamp = new Date().toISOString();
        await this.env.DB.batch([
          this.env.DB.prepare("UPDATE topics SET status='rejected',updated_at=? WHERE id=?").bind(timestamp, topic.id),
          this.env.DB.prepare("UPDATE generation_runs SET status='rejected',error_code='draft_conflict' WHERE workflow_id=?").bind(event.instanceId),
          this.env.DB.prepare("INSERT OR IGNORE INTO editorial_events(topic_id,batch_id,workflow_id,event,detail,created_at) VALUES(?,?,?,'draft_conflict','unique_constraint',?)").bind(topic.id, batchId, event.instanceId, timestamp)
        ]);
        return true;
      });
      return { status: "rejected" };
    }

    try {
      await step.do("publish and claim slot", async () => {
        const timestamp = new Date().toISOString();
        await this.env.DB.batch([
          this.env.DB.prepare("UPDATE posts SET status='published',published_at=?,updated_at=? WHERE id=?").bind(timestamp, timestamp, postId),
          this.env.DB.prepare("UPDATE topics SET status='published',updated_at=? WHERE id=?").bind(timestamp, topic.id),
          this.env.DB.prepare("INSERT OR IGNORE INTO editorial_events(topic_id,batch_id,workflow_id,event,detail,created_at) VALUES(?,?,?,'published','quality_gates_passed',?)").bind(topic.id, batchId, event.instanceId, timestamp)
        ]);
        return true;
      });
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("weekly target reached")) throw error;
      // ponytail: discard the overflow draft; reuse it when >10 held drafts/week makes OpenAI cost material.
      await step.do("hold overflow", async () => {
        const timestamp = new Date().toISOString();
        await this.env.DB.batch([
          this.env.DB.prepare("UPDATE generation_runs SET post_id=NULL,status='held',error_code='weekly_target_reached' WHERE post_id=?").bind(postId),
          this.env.DB.prepare("DELETE FROM posts WHERE id=?").bind(postId),
          this.env.DB.prepare("UPDATE topics SET status='held',updated_at=? WHERE id=?").bind(timestamp, topic.id),
          this.env.DB.prepare("INSERT OR IGNORE INTO editorial_events(topic_id,batch_id,workflow_id,event,detail,created_at) VALUES(?,?,?,'held','weekly_target_reached',?)").bind(topic.id, batchId, event.instanceId, timestamp)
        ]);
        return true;
      });
      return { status: "held" };
    }

    await step.do("invalidate published caches", async () => {
      const edgeCache = (caches as CacheStorage & { default: Cache }).default;
      await Promise.all([
        edgeCache.delete(new Request(`${this.env.SITE_URL}/`)),
        edgeCache.delete(new Request(`${this.env.SITE_URL}/sitemap.xml`)),
        edgeCache.delete(new Request(`${this.env.SITE_URL}/${topic.cluster === "revisao-de-contratos" ? "revisao-de-contratos-bancarios" : topic.cluster === "dividas-empresariais" ? "dividas-bancarias-empresariais" : "busca-e-apreensao"}/`)),
        edgeCache.delete(new Request(`${this.env.SITE_URL}/artigos/${generated.article.slug}/`))
      ]);
      return true;
    });
    return { status: "published", postId };
  }
}
