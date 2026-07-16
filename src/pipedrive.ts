export type Contact = {
  name: string;
  email: string;
  phone: string;
  uf: string;
  subject: string;
  message: string;
  consent: true;
};

export type LeadContext = {
  submissionId: string;
  sourceUrl: string;
  cluster: string;
  cta: string;
  utmCampaign: string;
  consentAt: string;
};

async function hmacHex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function contactSubmissionId(secret: string, contact: Contact, day: string): Promise<string> {
  return hmacHex(secret, `${contact.email}|${contact.phone}|${contact.subject}|${contact.message}|${day}`);
}

export async function contactRateLimitKey(secret: string, ip: string, windowStart: string): Promise<string> {
  return hmacHex(secret, `${windowStart}|${ip}`);
}

export async function readUrlEncoded(request: Request, limit: number): Promise<URLSearchParams> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > limit) throw new RangeError("body too large");
  const reader = request.body?.getReader();
  if (!reader) return new URLSearchParams();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new RangeError("body too large");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return new URLSearchParams(new TextDecoder().decode(body));
}

export type PipedriveConfig = {
  baseUrl: string;
  token: string;
  ownerId: number;
  labelId: string;
  channel?: number;
  channelId?: string;
  activityType: string;
  fields: {
    sourceUrl: string;
    cluster: string;
    cta: string;
    utmCampaign: string;
    consentAt: string;
    submissionId: string;
  };
};

export function parseContact(value: unknown): Contact {
  if (!value || typeof value !== "object" || (value as { consent?: unknown }).consent !== true) {
    throw new Error("privacy acknowledgement is required");
  }
  const input = value as Record<string, unknown>;
  const phoneRaw = String(input.phone ?? "").trim();
  const phoneDigits = phoneRaw.replace(/\D/g, "");
  const email = String(input.email ?? "").trim().toLowerCase();
  const name = String(input.name ?? "").trim();
  const uf = String(input.uf ?? "").trim().toUpperCase();
  const subject = String(input.subject ?? "").trim();
  const message = String(input.message ?? "").trim();
  const validEmail = email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validPhone = phoneDigits.length >= 10 && phoneDigits.length <= 15;
  if (name.length < 2 || name.length > 100) throw new Error("a valid name is required");
  if (!/^[A-Z]{2}$/.test(uf)) throw new Error("a valid UF is required");
  if (!["busca-e-apreensao", "revisao-de-contrato", "divida-empresarial", "outro"].includes(subject)) throw new Error("a valid subject is required");
  if (message.length > 2000) throw new Error("message is too long");
  if (!validEmail && !validPhone) throw new Error("a valid email or phone is required");
  return {
    name,
    email: validEmail ? email : "",
    phone: validPhone ? `${phoneRaw.startsWith("+") ? "+" : ""}${phoneDigits}` : "",
    uf,
    subject,
    message,
    consent: true
  };
}

type ApiEnvelope<T> = { success: boolean; data: T };

function nextBusinessDate(now: Date): string {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + 1);
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export async function verifyTurnstile(token: string, remoteIp: string, secret: string, hostname: string, fetcher: typeof fetch = fetch): Promise<boolean> {
  if (!token || !secret) return false;
  const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip: remoteIp }),
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
  return result.success === true && result.hostname === hostname && result.action === "contact";
}

export async function createPipedriveLead(
  contact: Contact,
  context: LeadContext,
  config: PipedriveConfig,
  fetcher: typeof fetch = fetch,
  now = new Date()
): Promise<{ personId: number; leadId: string; activityId: number; duplicate: boolean }> {
  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const response = await fetcher(`${config.baseUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      signal: init.signal ?? AbortSignal.timeout(30_000),
      headers: { "content-type": "application/json", "x-api-token": config.token, ...init.headers }
    });
    if (!response.ok) throw new Error(`Pipedrive request failed with ${response.status}`);
    const envelope = await response.json() as ApiEnvelope<T>;
    if (!envelope.success) throw new Error("Pipedrive rejected the request");
    return envelope.data;
  };

  const addFollowUp = (leadId: string) => request<{ id: number }>("/api/v2/activities", {
    method: "POST",
    body: JSON.stringify({
      subject: `[Blog] Retorno: ${contact.name}`,
      type: config.activityType,
      owner_id: config.ownerId,
      lead_id: leadId,
      due_date: nextBusinessDate(now),
      note: `Assunto: ${contact.subject}\nUF: ${contact.uf}\nMensagem: ${contact.message || "Não informada"}`
    })
  });

  const leadSearch = await request<{ items?: Array<{ item: { id: string; person?: { id: number }; person_id?: number } }> }>(`/api/v2/leads/search?${new URLSearchParams({ term: context.submissionId, fields: "custom_fields", exact_match: "true" })}`);
  const existingLead = leadSearch.items?.[0]?.item;
  if (existingLead) {
    const activities = await request<Array<{ id: number }>>(`/api/v2/activities?${new URLSearchParams({ lead_id: existingLead.id, done: "false", limit: "1" })}`);
    const activity = activities[0] ?? await addFollowUp(existingLead.id);
    return { personId: existingLead.person?.id ?? existingLead.person_id ?? 0, leadId: existingLead.id, activityId: activity.id, duplicate: true };
  }

  const term = contact.email || contact.phone;
  const personSearch = await request<{ items?: Array<{ item: { id: number } }> }>(`/api/v2/persons/search?${new URLSearchParams({ term, fields: contact.email ? "email" : "phone", exact_match: "true" })}`);
  let personId = personSearch.items?.[0]?.item.id;
  if (!personId) {
    const person = await request<{ id: number }>("/api/v2/persons", {
      method: "POST",
      body: JSON.stringify({
        name: contact.name,
        owner_id: config.ownerId,
        emails: contact.email ? [{ value: contact.email, primary: true, label: "work" }] : [],
        phones: contact.phone ? [{ value: contact.phone, primary: true, label: "mobile" }] : []
      })
    });
    personId = person.id;
  }

  const lead = await request<{ id: string }>("/api/v1/leads", {
    method: "POST",
    body: JSON.stringify({
      title: `[Blog][${context.cluster}] ${contact.name}`,
      person_id: personId,
      owner_id: config.ownerId,
      label_ids: config.labelId ? [config.labelId] : [],
      origin_id: "vr-blog",
      channel: config.channel || undefined,
      channel_id: config.channelId || undefined,
      [config.fields.sourceUrl]: context.sourceUrl,
      [config.fields.cluster]: context.cluster,
      [config.fields.cta]: context.cta,
      [config.fields.utmCampaign]: context.utmCampaign,
      [config.fields.consentAt]: context.consentAt,
      [config.fields.submissionId]: context.submissionId
    })
  });
  const activity = await addFollowUp(lead.id);
  return { personId, leadId: lead.id, activityId: activity.id, duplicate: false };
}

export async function createPipedriveQaActivity(
  summary: { batchId: string; published: number; rejected: number; held: number; shortfall: boolean; sampleUrls: string[] },
  config: { baseUrl: string; token: string; ownerId: number; activityType: string },
  fetcher: typeof fetch = fetch,
  now = new Date()
): Promise<number> {
  const subject = `QA semanal do blog — ${summary.batchId}`;
  const query = new URLSearchParams({ owner_id: String(config.ownerId), limit: "100", sort_by: "add_time", sort_direction: "desc" });
  const existingResponse = await fetcher(`${config.baseUrl.replace(/\/$/, "")}/api/v2/activities?${query}`, { headers: { "x-api-token": config.token }, signal: AbortSignal.timeout(30_000) });
  if (!existingResponse.ok) throw new Error(`Pipedrive QA lookup failed with ${existingResponse.status}`);
  const existing = await existingResponse.json() as ApiEnvelope<Array<{ id: number; subject: string }>>;
  const activity = existing.data?.find((item) => item.subject === subject);
  if (activity) return activity.id;
  const note = [
    `Lote: ${summary.batchId}`,
    `Publicados: ${summary.published}`,
    `Rejeitados: ${summary.rejected}`,
    `Held: ${summary.held}`,
    `Shortfall: ${summary.shortfall ? "sim" : "não"}`,
    "",
    "Amostra:",
    ...summary.sampleUrls
  ].join("\n");
  const response = await fetcher(`${config.baseUrl.replace(/\/$/, "")}/api/v2/activities`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-token": config.token },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      subject,
      type: config.activityType,
      owner_id: config.ownerId,
      due_date: nextBusinessDate(now),
      note
    })
  });
  if (!response.ok) throw new Error(`Pipedrive QA request failed with ${response.status}`);
  const envelope = await response.json() as ApiEnvelope<{ id: number }>;
  if (!envelope.success) throw new Error("Pipedrive rejected the QA activity");
  return envelope.data.id;
}
