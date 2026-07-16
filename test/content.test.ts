import assert from "node:assert/strict";
import test from "node:test";
import { buildBatchRequests, generateArticle, isTooSimilar, validateArticle, verifyArticleSources } from "../src/content.ts";

const goodArticle = {
  title: "Como comparar a taxa do contrato com a taxa média do Bacen",
  slug: "comparar-taxa-contrato-taxa-media-bacen",
  metaDescription: "Entenda como comparar taxas contratuais com referências oficiais, sem concluir automaticamente que existe abusividade.",
  excerpt: "Uma comparação responsável exige modalidade, data da contratação, custo efetivo total e leitura completa dos documentos.",
  blocks: [
    { type: "paragraph", text: "A comparação depende da modalidade e da data da contratação.", sourceIds: ["s1"] },
    { type: "heading", text: "O que conferir", sourceIds: [] },
    { type: "list", items: ["Taxa mensal", "Taxa anual", "CET"], sourceIds: ["s1"] },
    { type: "paragraph", text: "A taxa média é uma referência, não uma conclusão automática.", sourceIds: ["s1", "s2"] },
    { type: "heading", text: "Limites da comparação", sourceIds: [] },
    { type: "callout", text: "A análise individual depende do contrato completo.", sourceIds: ["s2"] }
  ],
  sources: [
    { id: "s1", title: "Taxas de juros", url: "https://www.bcb.gov.br/estatisticas/txjuros" },
    { id: "s2", title: "Súmula 382", url: "https://www.stj.jus.br/docs_internet/revista/eletronica/stj-revista-sumulas-2013_35_capSumula382.pdf" }
  ]
};

const testOpenAiConfig = { apiKey: ["test", "value"].join("-"), model: "test-model" };

test("accepts a structured article backed by allowed official sources", () => {
  assert.deepEqual(validateArticle(goodArticle), []);
});

test("enforces the structured-output size limits after parsing", () => {
  const article = structuredClone(goodArticle);
  article.blocks.pop();
  assert.ok(validateArticle(article).includes("between six and twenty-four blocks are required"));
  const oversized = structuredClone(goodArticle);
  oversized.blocks[0] = { type: "paragraph", text: "a".repeat(2_001), sourceIds: ["s1"] };
  assert.ok(validateArticle(oversized).includes("invalid block"));
});

test("rejects promotional claims prohibited by the editorial policy", () => {
  const article = structuredClone(goodArticle);
  article.blocks[0] = { type: "paragraph", text: "Garantimos o melhor resultado com consulta gratuita.", sourceIds: ["s1"] };
  assert.match(validateArticle(article).join("\n"), /prohibited language/);
});

test("rejects numeric claims without a source reference", () => {
  const article = structuredClone(goodArticle);
  article.blocks[0] = { type: "paragraph", text: "O prazo é de 5 dias.", sourceIds: [] };
  assert.match(validateArticle(article).join("\n"), /numeric claim requires a source/);
});

test("rejects malformed model blocks without throwing", () => {
  const article = { ...structuredClone(goodArticle), blocks: [{ type: "paragraph", text: "Sem referências" }] };
  assert.match(validateArticle(article).join("\n"), /invalid block/);
});

test("rejects malformed or duplicated sources without throwing", () => {
  const malformed = { ...structuredClone(goodArticle), sources: [null, goodArticle.sources[0]] };
  assert.doesNotThrow(() => validateArticle(malformed));
  assert.ok(validateArticle(malformed).some((error) => error.includes("invalid source")));
  const duplicated = structuredClone(goodArticle);
  duplicated.sources[1] = { ...duplicated.sources[0] };
  assert.ok(validateArticle(duplicated).includes("source ids must be unique"));
});

test("allows legal references to guarantees but requires citations on substantive blocks", () => {
  const article = structuredClone(goodArticle);
  article.blocks[0] = { type: "paragraph", text: "A garantia fiduciária integra o contrato.", sourceIds: ["s1"] };
  assert.deepEqual(validateArticle(article), []);
  article.blocks[0].sourceIds = [];
  assert.ok(validateArticle(article).includes("substantive block requires a source"));
});

test("detects semantic near-duplicates before storing a draft", () => {
  assert.equal(isTooSimilar(goodArticle, [{ title: "Como comparar a taxa do contrato com a taxa média do Bacen", excerpt: "Comparação responsável considera modalidade, data e custo efetivo total." }]), true);
  assert.equal(isTooSimilar(goodArticle, [{ title: "Como funciona a busca e apreensão", excerpt: "Notificação e mora no financiamento de veículos." }]), false);
});

test("builds one idempotent weekly batch of one hundred staggered attempts", () => {
  const start = Date.parse("2026-07-13T12:00:00Z");
  const jobs = buildBatchRequests("2026-29", start);
  assert.equal(jobs.length, 100);
  assert.equal(new Set(jobs.map((job) => job.id)).size, 100);
  assert.equal(jobs[0]?.id, "2026-29-000");
  assert.equal(jobs[99]?.id, "2026-29-099");
  assert.ok(jobs.every((job) => job.runAt >= start && job.runAt < start + 7 * 24 * 60 * 60 * 1000));
});

test("generates and audits a structured article through the Responses API", async () => {
  const bodies: Record<string, unknown>[] = [];
  const recordedRuns: string[] = [];
  const outputs = [goodArticle, { pass: true, severity: "none", issues: [] }];
  const fakeFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input) !== "https://api.openai.com/v1/responses") return new Response(null, { status: 200 });
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    const output = outputs.shift();
    return Response.json({
      id: `resp-${bodies.length}`,
      status: "completed",
      usage: { input_tokens: 100, output_tokens: 50 },
      output: [
        { type: "web_search_call", status: "completed", action: { sources: goodArticle.sources.map((source) => ({ url: source.url })) } },
        { type: "message", content: [{ type: "output_text", text: JSON.stringify(output) }] }
      ]
    });
  }) as typeof fetch;
  const result = await generateArticle({
    cluster: "revisao-de-contratos",
    query: "como comparar taxa contratual",
    brief: "Explicar critérios sem concluir por abusividade.",
    allowedDomains: ["bcb.gov.br", "stj.jus.br"]
  }, testOpenAiConfig, fakeFetch, (run) => { recordedRuns.push(run.responseId); });
  assert.equal(result.article.slug, goodArticle.slug);
  assert.equal(result.runs.length, 2);
  assert.equal(bodies.length, 2);
  assert.deepEqual(recordedRuns, ["resp-1", "resp-2"]);
  assert.match(JSON.stringify(bodies[0]), /web_search/);
  assert.match(JSON.stringify(bodies[0]), /bcb\.gov\.br/);
  assert.match(JSON.stringify(bodies[1]), /web_search/);
  assert.equal(bodies.every((body) => body.tool_choice === "required"), true);
  assert.equal(bodies.every((body) => JSON.stringify(body.include).includes("web_search_call.action.sources")), true);
});

test("matches grounded sources after removing tracking parameters", async () => {
  const tracked = {
    ...goodArticle,
    sources: goodArticle.sources.map((source, index) => index === 0 ? { ...source, url: `${source.url}?class_id=3740&s=gestao&utm_source=openai` } : source)
  };
  const outputs = [tracked, { pass: true, severity: "none", issues: [] }];
  const fakeFetch = (async (input: RequestInfo | URL) => {
    if (String(input) !== "https://api.openai.com/v1/responses") return new Response(null, { status: 200 });
    return Response.json({
      id: `resp-tracked-${outputs.length}`,
      status: "completed",
      output: [
        { type: "web_search_call", status: "completed", action: { sources: goodArticle.sources.map((source) => ({ url: source.url })) } },
        { type: "message", content: [{ type: "output_text", text: JSON.stringify(outputs.shift()) }] }
      ]
    });
  }) as typeof fetch;
  const result = await generateArticle({
    cluster: "revisao-de-contratos", query: "taxa", brief: "brief", allowedDomains: ["bcb.gov.br", "stj.jus.br"]
  }, testOpenAiConfig, fakeFetch);
  assert.equal(result.article.slug, tracked.slug);
});

test("rejects a model response without completed grounded web search", async () => {
  const fakeFetch = (async () => Response.json({
    id: "resp-ungrounded",
    status: "completed",
    output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(goodArticle) }] }]
  })) as typeof fetch;
  await assert.rejects(generateArticle({
    cluster: "revisao-de-contratos", query: "taxa", brief: "brief", allowedDomains: ["bcb.gov.br", "stj.jus.br"]
  }, testOpenAiConfig, fakeFetch), /completed web search/);
});

test("rejects unavailable or off-allowlist source redirects", async () => {
  await assert.rejects(verifyArticleSources(goodArticle, (async () => new Response(null, { status: 404 })) as typeof fetch), /unavailable/);
  await assert.rejects(verifyArticleSources(goodArticle, (async () => new Response(null, { status: 302, headers: { location: "https://example.com/" } })) as typeof fetch), /outside the allowlist/);
});
