export type Source = { id: string; title: string; url: string };
export type ArticleBlock =
  | { type: "paragraph" | "heading" | "callout"; text: string; sourceIds: string[] }
  | { type: "list"; items: string[]; sourceIds: string[] };
export type Article = {
  title: string;
  slug: string;
  metaDescription: string;
  excerpt: string;
  blocks: ArticleBlock[];
  sources: Source[];
};

const ALLOWED_HOSTS = [
  "planalto.gov.br",
  "stj.jus.br",
  "stf.jus.br",
  "bcb.gov.br",
  "cnj.jus.br",
  "gov.br",
  "anpd.gov.br",
  "jus.br"
];

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

const PROHIBITED = /\b(garantimos?|resultado garantido|garantia de resultado|melhor|maior|lider|numero 1|consulta gratuit[ao]|sem custos|taxa de sucesso|casos? de sucesso)\b/i;

export function buildBatchRequests(batchId: string, start: number): Array<{ id: string; runAt: number; params: { batchId: string; index: number } }> {
  const week = 7 * 24 * 60 * 60 * 1000;
  return Array.from({ length: 100 }, (_, index) => ({
    id: `${batchId}-${String(index).padStart(3, "0")}`,
    runAt: start + Math.floor(index * week / 100),
    params: { batchId, index }
  }));
}

export function validateArticle(value: unknown): string[] {
  if (!value || typeof value !== "object") return ["article must be an object"];
  const article = value as Partial<Article>;
  const errors: string[] = [];
  if (!article.title?.trim()) errors.push("title is required");
  if (!article.slug?.trim()) errors.push("slug is required");
  if (!article.metaDescription?.trim()) errors.push("metaDescription is required");
  if (!article.excerpt?.trim()) errors.push("excerpt is required");
  if (!Array.isArray(article.blocks) || article.blocks.length === 0) errors.push("blocks are required");
  if (!Array.isArray(article.sources) || article.sources.length < 2) errors.push("at least two sources are required");
  if (article.title && (article.title.length < 20 || article.title.length > 100)) errors.push("title length is invalid");
  if (article.slug && (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) || article.slug.length > 100)) errors.push("slug is invalid");
  if (article.metaDescription && (article.metaDescription.length < 80 || article.metaDescription.length > 160)) errors.push("metaDescription length is invalid");
  if (article.excerpt && (article.excerpt.length < 80 || article.excerpt.length > 240)) errors.push("excerpt length is invalid");
  if (Array.isArray(article.blocks) && (article.blocks.length < 6 || article.blocks.length > 24)) errors.push("between six and twenty-four blocks are required");
  if (Array.isArray(article.sources) && article.sources.length > 12) errors.push("at most twelve sources are allowed");

  const validSources: Source[] = [];
  const sourceIds = new Set<string>();
  for (const raw of Array.isArray(article.sources) ? article.sources as unknown[] : []) {
    if (!raw || typeof raw !== "object") { errors.push("invalid source"); continue; }
    const source = raw as Partial<Source>;
    if (typeof source.id !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(source.id) || typeof source.title !== "string" || !source.title.trim() || source.title.length > 200 || typeof source.url !== "string" || source.url.length > 2048) {
      errors.push("invalid source");
      continue;
    }
    if (sourceIds.has(source.id)) errors.push("source ids must be unique");
    sourceIds.add(source.id);
    validSources.push(source as Source);
  }
  const validBlocks: ArticleBlock[] = [];
  for (const raw of Array.isArray(article.blocks) ? article.blocks as unknown[] : []) {
    if (!raw || typeof raw !== "object") { errors.push("invalid block"); continue; }
    const block = raw as Partial<ArticleBlock> & { type?: string; text?: unknown; items?: unknown; sourceIds?: unknown };
    const typeOk = ["paragraph", "heading", "list", "callout"].includes(block.type ?? "");
    const contentOk = block.type === "list"
      ? Array.isArray(block.items) && block.items.length > 0 && block.items.length <= 20 && block.items.every((item) => typeof item === "string" && item.trim().length > 0 && item.length <= 500)
      : typeof block.text === "string" && block.text.trim().length > 0 && block.text.length <= 2_000;
    const refsOk = Array.isArray(block.sourceIds) && block.sourceIds.length <= 12 && block.sourceIds.every((id) => typeof id === "string" && id.length <= 64 && sourceIds.has(id));
    if (!typeOk || !contentOk || !refsOk) { errors.push("invalid block"); continue; }
    validBlocks.push(block as ArticleBlock);
  }
  const articleText = validBlocks
    .flatMap((block) => "text" in block ? [block.text] : block.items)
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (articleText.length > 30_000) errors.push("article body is too long");
  if (PROHIBITED.test(articleText)) errors.push("prohibited language detected");
  for (const block of validBlocks) {
    const text = "text" in block ? block.text : block.items.join(" ");
    if (block.type !== "heading" && block.sourceIds.length === 0) errors.push("substantive block requires a source");
    if (/\d/.test(text) && block.sourceIds.length === 0) errors.push("numeric claim requires a source");
  }

  for (const source of validSources) {
    try {
      const url = new URL(source.url);
      if (url.protocol !== "https:") errors.push(`source ${source.id} must use https`);
      if (!isAllowedHost(url.hostname)) errors.push(`source ${source.id} is not allowed`);
    } catch {
      errors.push(`source ${source.id} has an invalid URL`);
    }
  }
  return errors;
}

export async function verifyArticleSources(article: Pick<Article, "sources">, fetcher: typeof fetch = fetch): Promise<void> {
  await Promise.all(article.sources.map(async (source) => {
    let url = new URL(source.url);
    for (let redirects = 0; redirects < 3; redirects += 1) {
      if (url.protocol !== "https:" || !isAllowedHost(url.hostname)) throw new Error(`source ${source.id} redirected outside the allowlist`);
      const response = await fetcher(url, { method: "GET", redirect: "manual", headers: { range: "bytes=0-0" }, signal: AbortSignal.timeout(10_000) });
      await response.body?.cancel();
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new Error(`source ${source.id} returned an invalid redirect`);
        url = new URL(location, url);
        continue;
      }
      if (!response.ok) throw new Error(`source ${source.id} is unavailable (${response.status})`);
      return;
    }
    throw new Error(`source ${source.id} redirected too many times`);
  }));
}

const STOP_WORDS = new Set(["a", "as", "com", "como", "da", "das", "de", "do", "dos", "e", "em", "o", "os", "para", "por", "que", "uma", "um"]);

function similarityTokens(value: string): Set<string> {
  return new Set(value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2 && !STOP_WORDS.has(word)));
}

export function isTooSimilar(candidate: Pick<Article, "title" | "excerpt">, existing: Array<{ title: string; excerpt: string }>): boolean {
  const candidateTokens = similarityTokens(`${candidate.title} ${candidate.excerpt}`);
  if (candidateTokens.size < 4) return false;
  return existing.some((post) => {
    const postTokens = similarityTokens(`${post.title} ${post.excerpt}`);
    if (postTokens.size < 4) return false;
    let intersection = 0;
    for (const token of candidateTokens) if (postTokens.has(token)) intersection += 1;
    return intersection / Math.min(candidateTokens.size, postTokens.size) >= 0.8;
  });
}

export type Topic = { cluster: string; query: string; brief: string; allowedDomains: string[] };
export type OpenAIConfig = { apiKey: string; model: string };
export type GenerationRun = { responseId: string; stage: "draft" | "audit" | "retry"; inputTokens: number; outputTokens: number };

type ResponsesPayload = {
  id: string;
  status?: string;
  usage?: { input_tokens?: number; output_tokens?: number };
  output?: Array<{
    type: string;
    status?: string;
    action?: { sources?: Array<{ url?: string }> };
    content?: Array<{ type: string; text?: string; annotations?: Array<{ type?: string; url?: string }> }>;
  }>;
};

export class GenerationRejectedError extends Error {
  override name = "GenerationRejectedError";

  constructor(message: string) {
    super(`editorial_rejection: ${message}`);
  }
}

const ARTICLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "slug", "metaDescription", "excerpt", "blocks", "sources"],
  properties: {
    title: { type: "string", minLength: 20, maxLength: 100 },
    slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", maxLength: 100 },
    metaDescription: { type: "string", minLength: 80, maxLength: 160 },
    excerpt: { type: "string", minLength: 80, maxLength: 240 },
    blocks: {
      type: "array", minItems: 6, maxItems: 24,
      items: {
        anyOf: [
          {
            type: "object", additionalProperties: false,
            required: ["type", "text", "sourceIds"],
            properties: {
              type: { enum: ["paragraph", "heading", "callout"] },
              text: { type: "string", minLength: 1, maxLength: 2000 },
              sourceIds: { type: "array", maxItems: 12, items: { type: "string", minLength: 1, maxLength: 64 } }
            }
          },
          {
            type: "object", additionalProperties: false,
            required: ["type", "items", "sourceIds"],
            properties: {
              type: { enum: ["list"] },
              items: { type: "array", minItems: 1, maxItems: 20, items: { type: "string", minLength: 1, maxLength: 500 } },
              sourceIds: { type: "array", maxItems: 12, items: { type: "string", minLength: 1, maxLength: 64 } }
            }
          }
        ]
      }
    },
    sources: {
      type: "array", minItems: 2, maxItems: 12,
      items: {
        type: "object", additionalProperties: false, required: ["id", "title", "url"],
        properties: {
          id: { type: "string", pattern: "^[A-Za-z0-9_-]{1,64}$" },
          title: { type: "string", minLength: 1, maxLength: 200 },
          url: { type: "string", minLength: 1, maxLength: 2048 }
        }
      }
    }
  }
} as const;

const AUDIT_SCHEMA = {
  type: "object", additionalProperties: false, required: ["pass", "severity", "issues"],
  properties: {
    pass: { type: "boolean" },
    severity: { enum: ["none", "low", "medium", "high"] },
    issues: { type: "array", items: { type: "string" }, maxItems: 12 }
  }
} as const;

function responseText(payload: ResponsesPayload): string {
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) if (content.type === "output_text" && content.text) return content.text;
  }
  throw new Error("OpenAI response did not contain output_text");
}

function normalizeSourceUrl(value: string): string {
  const url = new URL(value);
  url.hash = "";
  // Grounding identifies the official document; availability still checks the full URL.
  url.search = "";
  return url.toString().replace(/\/$/, "");
}

function groundedUrls(payload: ResponsesPayload): Set<string> {
  const calls = (payload.output ?? []).filter((item) => item.type === "web_search_call" && item.status === "completed");
  if (calls.length === 0) throw new Error("OpenAI response did not contain a completed web search");
  const urls = new Set<string>();
  for (const item of payload.output ?? []) {
    for (const source of item.action?.sources ?? []) if (source.url) urls.add(normalizeSourceUrl(source.url));
    for (const content of item.content ?? []) {
      for (const annotation of content.annotations ?? []) if (annotation.type === "url_citation" && annotation.url) urls.add(normalizeSourceUrl(annotation.url));
    }
  }
  if (urls.size === 0) throw new Error("OpenAI web search returned no source URLs");
  return urls;
}

export async function generateArticle(
  topic: Topic,
  config: OpenAIConfig,
  fetcher: typeof fetch = fetch,
  onRun?: (run: GenerationRun) => void | Promise<void>
): Promise<{ article: Article; runs: GenerationRun[] }> {
  const runs: GenerationRun[] = [];
  const webSearchTool = { type: "web_search", filters: { allowed_domains: topic.allowedDomains } };
  const call = async <T>(stage: GenerationRun["stage"], body: Record<string, unknown>, expectedSources: Source[] = []): Promise<T> => {
    const response = await fetcher("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, store: false, ...body, include: ["web_search_call.action.sources"] }),
      signal: AbortSignal.timeout(180_000)
    });
    if (!response.ok) throw new Error(`OpenAI request failed with ${response.status}`);
    const payload = await response.json() as ResponsesPayload;
    if (payload.status && payload.status !== "completed") throw new Error(`OpenAI response was ${payload.status}`);
    const run = { responseId: payload.id, stage, inputTokens: payload.usage?.input_tokens ?? 0, outputTokens: payload.usage?.output_tokens ?? 0 } satisfies GenerationRun;
    runs.push(run);
    await onRun?.(run);
    const value = JSON.parse(responseText(payload)) as T;
    const searched = groundedUrls(payload);
    const required = expectedSources.length ? expectedSources : ((value as Partial<Article>).sources ?? []);
    for (const source of required) {
      if (!searched.has(normalizeSourceUrl(source.url))) throw new Error(`source ${source.id} was not returned by web search`);
    }
    return value;
  };

  const draft = await call<Article>("draft", {
    instructions: "Você redige conteúdo informativo de Direito Bancário em português do Brasil. Use apenas as fontes oficiais encontradas, não prometa resultado, não invente fatos, não ofereça aconselhamento para caso concreto e associe sourceIds aos blocos que contenham datas, números ou afirmações jurídicas.",
    input: JSON.stringify(topic),
    tools: [webSearchTool],
    tool_choice: "required",
    text: { format: { type: "json_schema", name: "legal_article", strict: true, schema: ARTICLE_SCHEMA } }
  });
  let article = draft;
  let issues = validateArticle(article);
  if (issues.length === 0) {
    try { await verifyArticleSources(article, fetcher); }
    catch (error) { issues = [error instanceof Error ? error.message : "source verification failed"]; }
  }
  if (issues.length === 0) {
    const audit = await call<{ pass: boolean; severity: string; issues: string[] }>("audit", {
      instructions: "Audite o artigo contra as fontes citadas. Reprove qualquer afirmação sem apoio, linguagem promocional, aconselhamento individual, contradição, fonte inacessível ou intenção duplicada.",
      input: JSON.stringify({ topic, article }),
      tools: [webSearchTool],
      tool_choice: "required",
      text: { format: { type: "json_schema", name: "legal_audit", strict: true, schema: AUDIT_SCHEMA } }
    }, article.sources);
    if (audit.pass && audit.severity === "none" && audit.issues.length === 0) return { article, runs };
    issues = audit.issues.length ? audit.issues : [`audit severity: ${audit.severity}`];
  }

  article = await call<Article>("retry", {
    instructions: "Corrija somente os problemas listados. Preserve fontes oficiais, estrutura JSON e tom informativo. Não introduza afirmações novas sem fonte.",
    input: JSON.stringify({ topic, article, issues }),
    tools: [webSearchTool],
    tool_choice: "required",
    text: { format: { type: "json_schema", name: "legal_article_correction", strict: true, schema: ARTICLE_SCHEMA } }
  });
  const correctedErrors = validateArticle(article);
  if (correctedErrors.length) throw new GenerationRejectedError(`article rejected: ${correctedErrors.join("; ")}`);
  try { await verifyArticleSources(article, fetcher); }
  catch (error) { throw new GenerationRejectedError(error instanceof Error ? error.message : "source verification failed"); }
  const finalAudit = await call<{ pass: boolean; severity: string; issues: string[] }>("audit", {
    instructions: "Faça a auditoria final. Reprove qualquer problema factual, jurídico, ético, de fonte ou duplicidade.",
    input: JSON.stringify({ topic, article }),
    tools: [webSearchTool],
    tool_choice: "required",
    text: { format: { type: "json_schema", name: "legal_audit_final", strict: true, schema: AUDIT_SCHEMA } }
  }, article.sources);
  if (!finalAudit.pass || finalAudit.severity !== "none" || finalAudit.issues.length > 0) throw new GenerationRejectedError(`article rejected: ${finalAudit.issues.join("; ") || finalAudit.severity}`);
  return { article, runs };
}
