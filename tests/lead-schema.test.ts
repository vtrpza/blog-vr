import { describe, it, expect } from 'vitest';
import {
  validateLeadPayload,
  normalizePhone,
  problemToCluster,
  landingToArticle,
  PROBLEM_TYPES,
} from '../src/lib/lead-schema';

describe('normalizePhone', () => {
  it('formats 11-digit Brazilian numbers', () => {
    expect(normalizePhone('11999999999')).toBe('+5511999999999');
    expect(normalizePhone('21988888888')).toBe('+5521988888888');
  });

  it('formats 10-digit Brazilian numbers', () => {
    expect(normalizePhone('1133334444')).toBe('+551133334444');
  });

  it('handles already-formatted numbers', () => {
    expect(normalizePhone('+5511999999999')).toBe('+5511999999999');
  });

  it('handles numbers with formatting characters', () => {
    expect(normalizePhone('(11) 99999-9999')).toBe('+5511999999999');
  });

  it('returns null for invalid numbers', () => {
    expect(normalizePhone('123')).toBeNull();
    expect(normalizePhone('abc')).toBeNull();
    expect(normalizePhone('')).toBeNull();
  });
});

describe('validateLeadPayload', () => {
  const validPayload = {
    name: 'João Silva',
    phone: '11999999999',
    problem_type: 'busca-e-apreensao',
    lgpd_consent: true,
    turnstile_token: 'valid-token',
  };

  it('accepts valid payload', () => {
    expect(validateLeadPayload(validPayload)).toHaveLength(0);
  });

  it('rejects null/empty body', () => {
    const errors = validateLeadPayload(null);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].field).toBe('body');
  });

  it('requires name', () => {
    const errors = validateLeadPayload({ ...validPayload, name: '' });
    expect(errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('requires phone', () => {
    const errors = validateLeadPayload({ ...validPayload, phone: '' });
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('rejects invalid phone', () => {
    const errors = validateLeadPayload({ ...validPayload, phone: 'abc' });
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('requires problem_type', () => {
    const errors = validateLeadPayload({ ...validPayload, problem_type: '' });
    expect(errors.some((e) => e.field === 'problem_type')).toBe(true);
  });

  it('rejects invalid problem_type', () => {
    const errors = validateLeadPayload({ ...validPayload, problem_type: 'pix-cop' });
    expect(errors.some((e) => e.field === 'problem_type')).toBe(true);
  });

  it('accepts all valid problem types', () => {
    for (const pt of PROBLEM_TYPES) {
      const errors = validateLeadPayload({ ...validPayload, problem_type: pt });
      expect(errors.filter((e) => e.field === 'problem_type')).toHaveLength(0);
    }
  });

  it('rejects without LGPD consent', () => {
    const errors = validateLeadPayload({ ...validPayload, lgpd_consent: false });
    expect(errors.some((e) => e.field === 'lgpd_consent')).toBe(true);
    const errors2 = validateLeadPayload({ ...validPayload, lgpd_consent: undefined });
    expect(errors2.some((e) => e.field === 'lgpd_consent')).toBe(true);
  });

  it('requires Turnstile token', () => {
    const errors = validateLeadPayload({ ...validPayload, turnstile_token: '' });
    expect(errors.some((e) => e.field === 'turnstile_token')).toBe(true);
  });

  it('rejects invalid person_type', () => {
    const errors = validateLeadPayload({ ...validPayload, person_type: 'MEI' });
    expect(errors.some((e) => e.field === 'person_type')).toBe(true);
  });

  it('accepts PF and PJ person_type', () => {
    expect(validateLeadPayload({ ...validPayload, person_type: 'PF' })).toHaveLength(0);
    expect(validateLeadPayload({ ...validPayload, person_type: 'PJ' })).toHaveLength(0);
  });

  it('rejects invalid debt range', () => {
    const errors = validateLeadPayload({ ...validPayload, approx_debt_value_range: 'caro-pra-cacete' });
    expect(errors.some((e) => e.field === 'approx_debt_value_range')).toBe(true);
  });

  it('rejects overly long message', () => {
    const errors = validateLeadPayload({ ...validPayload, message: 'a'.repeat(2001) });
    expect(errors.some((e) => e.field === 'message')).toBe(true);
  });

  it('accepts optional email', () => {
    expect(validateLeadPayload({ ...validPayload, email: 'joao@email.com' })).toHaveLength(0);
  });
});

describe('problemToCluster', () => {
  it('maps known problems to clusters', () => {
    expect(problemToCluster('busca-e-apreensao')).toBe('busca-e-apreensao');
    expect(problemToCluster('juros-abusivos')).toBe('juros-abusivos');
    expect(problemToCluster('dividas-pj')).toBe('dividas-pj');
  });

  it('falls back to outros for unknowns', () => {
    expect(problemToCluster('pix-errado')).toBe('outros');
  });
});

describe('landingToArticle', () => {
  it('extracts slug from clean path', () => {
    expect(landingToArticle('/oficial-de-justica-busca-e-apreensao-o-que-fazer/')).toBe(
      'oficial-de-justica-busca-e-apreensao-o-que-fazer',
    );
  });

  it('extracts slug from full URL', () => {
    expect(
      landingToArticle('https://blog.vradvogados.com.br/busca-e-apreensao-veiculo/'),
    ).toBe('busca-e-apreensao-veiculo');
  });

  it('returns null for home page', () => {
    expect(landingToArticle('/')).toBeNull();
  });

  it('returns null for diagnóstico page', () => {
    expect(landingToArticle('/diagnostico-inicial/')).toBeNull();
  });
});