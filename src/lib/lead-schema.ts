/**
 * Lead schema — shared types and validation for blog-vradvogados.
 * Used by the Cloudflare Pages Function (functions/api/leads.ts)
 * and testable in isolation.
 */

export const PROBLEM_TYPES = [
  'busca-e-apreensao',
  'juros-abusivos',
  'dividas-pj',
  'superendividamento',
  'cobrancas-fraudes',
  'outros',
] as const;
export type ProblemType = (typeof PROBLEM_TYPES)[number];

export const DEBT_VALUE_RANGES = [
  'ate-5k',
  '5k-20k',
  '20k-50k',
  '50k-100k',
  'acima-100k',
  'nao-sei',
] as const;
export type DebtValueRange = (typeof DEBT_VALUE_RANGES)[number];

export interface LeadPayload {
  name: string;
  phone: string;
  email?: string;
  person_type?: 'PF' | 'PJ';
  problem_type: string;
  bank_or_financial_institution?: string;
  has_lawsuit?: boolean;
  has_vehicle_seized?: boolean;
  contract_available?: boolean;
  approx_debt_value_range?: string;
  message?: string;
  lgpd_consent: boolean;
  turnstile_token: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  landing_page?: string;
  referrer?: string;
}

export interface LeadRecord {
  id: string;
  created_at: string;
  updated_at: string | null;
  name: string;
  phone: string;
  email: string | null;
  person_type: string | null;
  problem_type: string;
  bank_or_financial_institution: string | null;
  approx_debt_value_range: string | null;
  has_lawsuit: number;
  has_vehicle_seized: number;
  contract_available: number;
  message: string | null;
  landing_page: string;
  source_article: string | null;
  cluster: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  lgpd_consent: number;
  pipedrive_person_id: number | null;
  pipedrive_lead_id: string | null;
  pipedrive_deal_id: number | null;
  pipedrive_status: string | null;
  status: string;
  qualified: number | null;
  disqualification_reason: string | null;
}

export interface LeadResponse {
  ok: boolean;
  request_id: string;
  message: string;
}

export interface HealthResponse {
  ok: boolean;
  version: string;
  d1: 'ok' | 'error';
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

/** Normalize Brazilian phone to E.164 (+55...) */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) return null;
  if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`;
  return `+55${digits}`;
}

/** Validate lead payload, returning errors array (empty = valid) */
export function validateLeadPayload(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return [{ field: 'body', message: 'Payload must be a JSON object' }];
  }

  const p = body as Record<string, unknown>;

  // Required strings
  if (!p.name || typeof p.name !== 'string' || p.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Nome é obrigatório' });
  }

  if (!p.phone || typeof p.phone !== 'string') {
    errors.push({ field: 'phone', message: 'Telefone é obrigatório' });
  } else if (!normalizePhone(p.phone)) {
    errors.push({ field: 'phone', message: 'Telefone inválido' });
  }

  if (!p.problem_type || typeof p.problem_type !== 'string') {
    errors.push({ field: 'problem_type', message: 'Tipo de problema é obrigatório' });
  } else if (!PROBLEM_TYPES.includes(p.problem_type as ProblemType)) {
    errors.push({ field: 'problem_type', message: `Tipo inválido. Opções: ${PROBLEM_TYPES.join(', ')}` });
  }

  // LGPD consent
  if (p.lgpd_consent !== true) {
    errors.push({ field: 'lgpd_consent', message: 'Consentimento LGPD é obrigatório' });
  }

  // Turnstile
  if (!p.turnstile_token || typeof p.turnstile_token !== 'string') {
    errors.push({ field: 'turnstile_token', message: 'Token Turnstile é obrigatório' });
  }

  // Optional validations
  if (p.email && typeof p.email !== 'string') {
    errors.push({ field: 'email', message: 'Email inválido' });
  }

  if (p.person_type && !['PF', 'PJ'].includes(p.person_type as string)) {
    errors.push({ field: 'person_type', message: 'Deve ser PF ou PJ' });
  }

  if (p.approx_debt_value_range && !(DEBT_VALUE_RANGES as readonly string[]).includes(p.approx_debt_value_range as string)) {
    errors.push({ field: 'approx_debt_value_range', message: 'Faixa de valor inválida' });
  }

  if (p.message && typeof p.message === 'string' && p.message.length > 2000) {
    errors.push({ field: 'message', message: 'Mensagem muito longa (máx 2000 caracteres)' });
  }

  return errors;
}

/** Extract cluster from problem_type (maps to taxonomy clusters) */
export function problemToCluster(problemType: string): string {
  switch (problemType) {
    case 'busca-e-apreensao':
      return 'busca-e-apreensao';
    case 'juros-abusivos':
      return 'juros-abusivos';
    case 'dividas-pj':
      return 'dividas-pj';
    case 'superendividamento':
      return 'superendividamento';
    case 'cobrancas-fraudes':
      return 'cobrancas-fraudes';
    default:
      return 'outros';
  }
}

/** Extract a source article slug from landing page path */
export function landingToArticle(landingPage: string): string | null {
  try {
    const path = landingPage.startsWith('http')
      ? new URL(landingPage).pathname
      : landingPage;
    const cleaned = path.replace(/^\/+|\/+$/g, '');
    if (!cleaned || cleaned === 'diagnostico-inicial' || cleaned === '') return null;
    return cleaned;
  } catch {
    return null;
  }
}