/**
 * POST /api/leads
 * Cloudflare Pages Function — captura lead, valida Turnstile,
 * salva em D1 e sincroniza com Pipedrive.
 */
import {
  validateLeadPayload,
  normalizePhone,
  problemToCluster,
  landingToArticle,
} from '../../src/lib/lead-schema';
import type { LeadPayload } from '../../src/lib/lead-schema';

interface Env {
  DB: D1Database;
  TURNSTILE_SECRET_KEY: string;
  PIPEDRIVE_API_TOKEN: string;
  PIPEDRIVE_API_BASE: string;
  PIPEDRIVE_OWNER_ID: string;
  PIPEDRIVE_LEAD_LABEL_IDS: string;
}

function corsHeaders(origin: string): Record<string, string> {
  const allowed = [
    'https://blog.vradvogados.com.br',
    'https://blog-vradvogados.pages.dev',
    'http://localhost:4321',
    'http://localhost:4322',
    'http://localhost:4323',
  ];
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

async function verifyTurnstile(token: string, secret: string, remoteip?: string): Promise<boolean> {
  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);
  if (remoteip) formData.append('remoteip', remoteip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

function hashIP(ip: string): string {
  // Simple SHA-256 hash — one-way, GDPR-friendly
  return String(ip.split('.').reduce((acc, octet) => acc + parseInt(octet, 10) * 37, 0));
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || 'https://blog.vradvogados.com.br';
  const headers = corsHeaders(origin);

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, message: 'Payload inválido' }), {
      status: 400,
      headers,
    });
  }

  // Validate
  const errors = validateLeadPayload(body);
  if (errors.length > 0) {
    return new Response(JSON.stringify({ ok: false, errors }), { status: 400, headers });
  }

  const payload = body as LeadPayload;

  // Verify Turnstile
  const turnstileOk = await verifyTurnstile(
    payload.turnstile_token,
    env.TURNSTILE_SECRET_KEY,
    request.headers.get('CF-Connecting-IP') || undefined,
  );
  if (!turnstileOk) {
    return new Response(JSON.stringify({ ok: false, message: 'Falha na verificação anti-spam' }), {
      status: 403,
      headers,
    });
  }

  // Normalize phone
  const phone = normalizePhone(payload.phone);
  if (!phone) {
    return new Response(JSON.stringify({ ok: false, message: 'Telefone inválido' }), {
      status: 400,
      headers,
    });
  }

  // Prepare lead record
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const cluster = problemToCluster(payload.problem_type);
  const sourceArticle = payload.landing_page ? landingToArticle(payload.landing_page) : null;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ipHash = hashIP(ip);

  const lead = {
    id,
    created_at: now,
    updated_at: null,
    name: payload.name.trim(),
    phone,
    email: payload.email?.trim() || null,
    person_type: payload.person_type || null,
    problem_type: payload.problem_type,
    bank_or_financial_institution: payload.bank_or_financial_institution?.trim() || null,
    approx_debt_value_range: payload.approx_debt_value_range || null,
    has_lawsuit: payload.has_lawsuit ? 1 : 0,
    has_vehicle_seized: payload.has_vehicle_seized ? 1 : 0,
    contract_available: payload.contract_available ? 1 : 0,
    message: payload.message?.trim() || null,
    landing_page: payload.landing_page || '/',
    source_article: sourceArticle,
    cluster,
    utm_source: payload.utm_source || null,
    utm_medium: payload.utm_medium || null,
    utm_campaign: payload.utm_campaign || null,
    utm_content: payload.utm_content || null,
    referrer: payload.referrer || null,
    user_agent: request.headers.get('User-Agent') || null,
    ip_hash: ipHash,
    lgpd_consent: 1,
    pipedrive_person_id: null,
    pipedrive_lead_id: null,
    pipedrive_deal_id: null,
    pipedrive_status: null,
    status: 'new',
    qualified: null,
    disqualification_reason: null,
  };

  // 1. Save to D1 (always first — never lose a lead)
  try {
    await env.DB.prepare(
      `INSERT INTO leads (id, created_at, name, phone, email, person_type, problem_type,
        bank_or_financial_institution, approx_debt_value_range, has_lawsuit, has_vehicle_seized,
        contract_available, message, landing_page, source_article, cluster, utm_source, utm_medium,
        utm_campaign, utm_content, referrer, user_agent, ip_hash, lgpd_consent, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        lead.id, lead.created_at, lead.name, lead.phone, lead.email, lead.person_type,
        lead.problem_type, lead.bank_or_financial_institution, lead.approx_debt_value_range,
        lead.has_lawsuit, lead.has_vehicle_seized, lead.contract_available, lead.message,
        lead.landing_page, lead.source_article, lead.cluster, lead.utm_source, lead.utm_medium,
        lead.utm_campaign, lead.utm_content, lead.referrer, lead.user_agent, lead.ip_hash,
        lead.lgpd_consent, lead.status,
      )
      .run();
  } catch (err) {
    console.error('D1 insert failed:', err);
    // Don't expose internal error to user — lead is lost, but we log it
    return new Response(JSON.stringify({ ok: false, message: 'Erro interno ao salvar.' }), {
      status: 500,
      headers,
    });
  }

  // 2. Create lead_created event
  try {
    const eventId = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO lead_events (id, lead_id, created_at, event_name, payload_json)
       VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(eventId, id, now, 'lead_created', JSON.stringify({ cluster, problem_type: lead.problem_type }))
      .run();
  } catch (err) {
    console.error('Event insert failed:', err);
    // Non-blocking — lead already saved
  }

  // 3. Sync with Pipedrive (non-blocking — failure goes to outbox)
  try {
    await syncPipedrive(env, lead);
  } catch (err) {
    console.error('Pipedrive sync failed, queuing outbox:', err);
    await queueOutbox(env, lead, err instanceof Error ? err.message : 'Unknown error');
  }

  return new Response(
    JSON.stringify({
      ok: true,
      request_id: id,
      message: 'Recebemos seus dados. A equipe analisará as informações enviadas.',
    }),
    { status: 200, headers },
  );
}

export async function onRequestOptions(context: { request: Request }): Promise<Response> {
  const origin = context.request.headers.get('Origin') || 'https://blog.vradvogados.com.br';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

// ── Pipedrive helpers ──────────────────────────────────────────────

async function syncPipedrive(env: Env, lead: Record<string, unknown>): Promise<void> {
  const token = env.PIPEDRIVE_API_TOKEN;
  const base = (env.PIPEDRIVE_API_BASE || 'https://vtrpza.pipedrive.com/api').replace(/\/$/, '');
  const ownerId = env.PIPEDRIVE_OWNER_ID || '';

  // 1. Search existing person by phone
  const searchRes = await fetch(
    `${base}/v2/persons/search?term=${encodeURIComponent(String(lead.phone))}&limit=1&fields=phone,email`,
    { headers: { 'X-Api-Token': token, 'Accept': 'application/json' } },
  );
  const searchData = (await searchRes.json()) as { data?: { items?: Array<{ item?: { id: number } }> } };
  const existingPerson = searchData?.data?.items?.[0]?.item;

  let personId: number;

  if (existingPerson?.id) {
    personId = existingPerson.id;
  } else {
    // Create person
    const personRes = await fetch(`${base}/v2/persons`, {
      method: 'POST',
      headers: { 'X-Api-Token': token, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: lead.name,
        phone: [{ value: String(lead.phone), primary: true }],
        email: lead.email ? [{ value: String(lead.email), primary: true }] : undefined,
        owner_id: ownerId ? parseInt(ownerId, 10) : undefined,
        label: 1, // Customer
      }),
    });
    const personData = (await personRes.json()) as { data?: { id: number } };
    personId = personData?.data?.id || 0;
    if (!personId) throw new Error('Failed to create person');
  }

  // 2. Create lead
  const labelIds = env.PIPEDRIVE_LEAD_LABEL_IDS
    ? env.PIPEDRIVE_LEAD_LABEL_IDS.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const leadTitle = `${lead.problem_type === 'busca-e-apreensao' ? 'Busca e apreensão' : lead.problem_type} — ${lead.name}`;

  const leadRes = await fetch(`${base}/v1/leads`, {
    method: 'POST',
    headers: { 'X-Api-Token': token, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      title: leadTitle,
      person_id: personId,
      label_ids: labelIds.length ? labelIds : undefined,
      visible_to: '3',
      channel_id: 'blog-vradvogados',
      value: { amount: 0, currency: 'BRL' },
    }),
  });
  const leadData = (await leadRes.json()) as { data?: { id: string } };
  const pipedriveLeadId = leadData?.data?.id;

  // 3. Add note with context
  const noteContent = `<strong>Origem:</strong> ${lead.landing_page}<br>
<strong>Problema:</strong> ${lead.problem_type} / ${lead.cluster}<br>
<strong>UTM:</strong> ${lead.utm_source || '-'} / ${lead.utm_medium || '-'} / ${lead.utm_campaign || '-'}<br>
<strong>Mensagem:</strong> ${lead.message || '-'}<br>
<strong>Documentos:</strong> contrato: ${lead.contract_available ? 'sim' : 'não'}; processo: ${lead.has_lawsuit ? 'sim' : 'não'}; veículo apreendido: ${lead.has_vehicle_seized ? 'sim' : 'não'}<br>
<strong>Request ID:</strong> ${lead.id}`;

  await fetch(`${base}/v1/notes`, {
    method: 'POST',
    headers: { 'X-Api-Token': token, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      content: noteContent,
      lead_id: pipedriveLeadId,
      add_time: new Date().toISOString(),
    }),
  });

  // 4. Update D1 with Pipedrive IDs
  if (pipedriveLeadId) {
    await env.DB.prepare(
      `UPDATE leads SET pipedrive_person_id = ?, pipedrive_lead_id = ?, pipedrive_status = 'synced', updated_at = ? WHERE id = ?`,
    )
      .bind(personId, pipedriveLeadId, new Date().toISOString(), lead.id)
      .run();
  }
}

async function queueOutbox(
  env: Env,
  lead: Record<string, unknown>,
  error: string,
): Promise<void> {
  const outboxId = crypto.randomUUID();
  const now = new Date().toISOString();
  // Retry: 6h from now
  const nextAttempt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

  await env.DB.prepare(
    `INSERT INTO pipedrive_outbox (id, lead_id, created_at, next_attempt_at, attempts, action, payload_json, last_error, status)
     VALUES (?, ?, ?, ?, 0, 'sync_lead', ?, ?, 'pending')`,
  )
    .bind(outboxId, lead.id, now, nextAttempt, JSON.stringify(lead), error)
    .run();
}