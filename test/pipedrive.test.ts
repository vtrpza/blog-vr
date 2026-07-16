import assert from "node:assert/strict";
import test from "node:test";
import { contactRateLimitKey, contactSubmissionId, createPipedriveLead, createPipedriveQaActivity, parseContact, readUrlEncoded, verifyTurnstile } from "../src/pipedrive.ts";

test("rejects a contact submission without privacy acknowledgement", () => {
  assert.throws(() => parseContact({
    name: "Maria",
    email: "maria@example.com",
    uf: "ES",
    subject: "busca-e-apreensao",
    consent: false
  }), /privacy acknowledgement/);
});

test("normalizes a valid contact submission", () => {
  assert.deepEqual(parseContact({
    name: "  Maria Silva  ",
    email: " MARIA@example.com ",
    phone: " +55 (27) 99999-0000 ",
    uf: "es",
    subject: "busca-e-apreensao",
    message: " Preciso de retorno. ",
    consent: true
  }), {
    name: "Maria Silva",
    email: "maria@example.com",
    phone: "+5527999990000",
    uf: "ES",
    subject: "busca-e-apreensao",
    message: "Preciso de retorno.",
    consent: true
  });
});

test("requires at least one valid return channel", () => {
  assert.throws(() => parseContact({
    name: "Maria Silva",
    email: "not-an-email",
    phone: "123",
    uf: "ES",
    subject: "busca-e-apreensao",
    consent: true
  }), /email or phone/);
});

test("derives rotating contact rate-limit keys without storing the raw IP", async () => {
  const first = await contactRateLimitKey("test-secret", "203.0.113.10", "2026-07-15T03:00:00.000Z");
  const same = await contactRateLimitKey("test-secret", "203.0.113.10", "2026-07-15T03:00:00.000Z");
  const nextHour = await contactRateLimitKey("test-secret", "203.0.113.10", "2026-07-15T04:00:00.000Z");
  assert.equal(first, same);
  assert.notEqual(first, nextHour);
  assert.doesNotMatch(first, /203\.0\.113\.10/);
});

test("derives an authenticated contact id without exposing predictable PII", async () => {
  const contact = parseContact({ name: "Maria", email: "maria@example.com", uf: "ES", subject: "outro", message: "Retorno", consent: true });
  const first = await contactSubmissionId("secret-a", contact, "2026-07-15");
  assert.equal(first, await contactSubmissionId("secret-a", contact, "2026-07-15"));
  assert.notEqual(first, await contactSubmissionId("secret-b", contact, "2026-07-15"));
  assert.doesNotMatch(first, /maria|retorno/i);
});

test("bounds urlencoded bodies even without Content-Length", async () => {
  const small = await readUrlEncoded(new Request("https://example.test", { method: "POST", body: "name=Maria" }), 32);
  assert.equal(small.get("name"), "Maria");
  await assert.rejects(readUrlEncoded(new Request("https://example.test", { method: "POST", body: `message=${"a".repeat(64)}` }), 32), /body too large/);
});

test("creates one Pipedrive lead for an existing person and schedules follow-up", async () => {
  const requests: Array<{ url: string; method: string; body?: Record<string, unknown> }> = [];
  const fakeFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const body = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : undefined;
    requests.push({ url, method: init?.method ?? "GET", body });
    if (url.includes("/persons/search")) return Response.json({ success: true, data: { items: [{ item: { id: 42 } }] } });
    if (url.includes("/leads/search")) return Response.json({ success: true, data: { items: [] } });
    if (url.endsWith("/api/v1/leads")) return Response.json({ success: true, data: { id: "lead-7" } });
    if (url.endsWith("/api/v2/activities")) return Response.json({ success: true, data: { id: 9 } });
    throw new Error(`unexpected request ${url}`);
  }) as typeof fetch;
  const contact = parseContact({ name: "Maria Silva", email: "maria@example.com", phone: "", uf: "ES", subject: "busca-e-apreensao", message: "Retorno", consent: true });
  const result = await createPipedriveLead(contact, {
    submissionId: "sub-123",
    sourceUrl: "https://blog.vradvogados.com.br/artigos/mora/",
    cluster: "busca-e-apreensao",
    cta: "formulario",
    utmCampaign: "organico",
    consentAt: "2026-07-14T12:00:00Z"
  }, {
    baseUrl: "https://company.pipedrive.com",
    token: "test-token",
    ownerId: 5,
    labelId: "blog",
    channel: 12,
    channelId: "organic-search",
    activityType: "task",
    fields: { sourceUrl: "f_source", cluster: "f_cluster", cta: "f_cta", utmCampaign: "f_utm", consentAt: "f_consent", submissionId: "f_submission" }
  }, fakeFetch, new Date("2026-07-17T12:00:00Z"));
  assert.deepEqual(result, { personId: 42, leadId: "lead-7", activityId: 9, duplicate: false });
  assert.match(requests[0]?.url ?? "", /\/api\/v2\/leads\/search/);
  assert.equal(requests.filter((request) => request.url.endsWith("/api/v1/leads")).length, 1);
  assert.equal(requests.find((request) => request.url.endsWith("/api/v1/leads"))?.body?.channel, 12);
  assert.equal(requests.at(-1)?.body?.due_date, "2026-07-20");
});

test("does not create a second lead for the same submission id", async () => {
  let calls = 0;
  const fakeFetch = (async (input: RequestInfo | URL) => {
    calls += 1;
    if (String(input).includes("/leads/search")) return Response.json({ success: true, data: { items: [{ item: { id: "lead-existing", person: { id: 42 } } }] } });
    if (String(input).includes("/activities?")) return Response.json({ success: true, data: [{ id: 17 }] });
    throw new Error(`unexpected request ${input}`);
  }) as typeof fetch;
  const contact = parseContact({ name: "Maria", email: "maria@example.com", uf: "ES", subject: "outro", consent: true });
  const result = await createPipedriveLead(contact, {
    submissionId: "sub-123", sourceUrl: "https://blog.vradvogados.com.br/", cluster: "outro", cta: "formulario", utmCampaign: "", consentAt: "2026-07-14T12:00:00Z"
  }, {
    baseUrl: "https://company.pipedrive.com", token: "test-token", ownerId: 5, labelId: "blog", activityType: "task",
    fields: { sourceUrl: "a", cluster: "b", cta: "c", utmCampaign: "d", consentAt: "e", submissionId: "f" }
  }, fakeFetch);
  assert.deepEqual(result, { personId: 42, leadId: "lead-existing", activityId: 17, duplicate: true });
  assert.equal(calls, 2);
});

test("repairs a partially created lead by adding its missing follow-up activity", async () => {
  let calls = 0;
  const fakeFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls += 1;
    const url = String(input);
    if (url.includes("/leads/search")) return Response.json({ success: true, data: { items: [{ item: { id: "lead-partial", person: { id: 42 } } }] } });
    if (url.includes("/activities?") && !init?.method) return Response.json({ success: true, data: [] });
    if (url.endsWith("/api/v2/activities") && init?.method === "POST") return Response.json({ success: true, data: { id: 18 } });
    throw new Error(`unexpected request ${url}`);
  }) as typeof fetch;
  const contact = parseContact({ name: "Maria", email: "maria@example.com", uf: "ES", subject: "outro", consent: true });
  const result = await createPipedriveLead(contact, {
    submissionId: "sub-partial", sourceUrl: "https://blog.vradvogados.com.br/", cluster: "outro", cta: "formulario", utmCampaign: "", consentAt: "2026-07-14T12:00:00Z"
  }, {
    baseUrl: "https://company.pipedrive.com", token: "test-token", ownerId: 5, labelId: "blog", activityType: "task",
    fields: { sourceUrl: "a", cluster: "b", cta: "c", utmCampaign: "d", consentAt: "e", submissionId: "f" }
  }, fakeFetch);
  assert.deepEqual(result, { personId: 42, leadId: "lead-partial", activityId: 18, duplicate: true });
  assert.equal(calls, 3);
});

test("accepts Turnstile only for the configured hostname and contact action", async () => {
  const fakeFetch = (async () => Response.json({ success: true, hostname: "blog.vradvogados.com.br", action: "contact" })) as typeof fetch;
  assert.equal(await verifyTurnstile("token", "203.0.113.7", "secret", "blog.vradvogados.com.br", fakeFetch), true);
  const wrongActionFetch = (async () => Response.json({ success: true, hostname: "blog.vradvogados.com.br", action: "login" })) as typeof fetch;
  assert.equal(await verifyTurnstile("token", "203.0.113.7", "secret", "blog.vradvogados.com.br", wrongActionFetch), false);
});

test("creates one weekly QA activity with batch counts and sampled URLs", async () => {
  let body: Record<string, unknown> = {};
  const fakeFetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (!init?.method) return Response.json({ success: true, data: [] });
    body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return Response.json({ success: true, data: { id: 81 } });
  }) as typeof fetch;
  const id = await createPipedriveQaActivity({
    batchId: "2026-07-13", published: 90, rejected: 7, held: 3, shortfall: false,
    sampleUrls: ["https://blog.vradvogados.com.br/artigos/exemplo/"]
  }, { baseUrl: "https://company.pipedrive.com", token: "token", ownerId: 6, activityType: "task" }, fakeFetch);
  assert.equal(id, 81);
  assert.match(String(body.note), /Publicados: 90/);
  assert.match(String(body.note), /\/artigos\/exemplo\//);
});

test("reuses an existing weekly QA activity after a partial retry", async () => {
  let calls = 0;
  const fakeFetch = (async () => {
    calls += 1;
    return Response.json({ success: true, data: [{ id: 82, subject: "QA semanal do blog — 2026-07-13" }] });
  }) as typeof fetch;
  const id = await createPipedriveQaActivity({
    batchId: "2026-07-13", published: 90, rejected: 7, held: 3, shortfall: false, sampleUrls: []
  }, { baseUrl: "https://company.pipedrive.com", token: "token", ownerId: 6, activityType: "task" }, fakeFetch);
  assert.equal(id, 82);
  assert.equal(calls, 1);
});
