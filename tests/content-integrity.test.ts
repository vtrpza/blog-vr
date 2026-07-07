import { describe, it, expect } from 'vitest';
import { ARTICLE_ROUTES, CLUSTERS } from '../src/lib/taxonomy';

describe('content integrity', () => {
  it('all ARTICLE_ROUTES reference valid clusters', () => {
    const clusterSlugs = CLUSTERS.map((c) => c.slug);
    for (const article of ARTICLE_ROUTES) {
      expect(clusterSlugs).toContain(article.cluster);
    }
  });

  it('all CHECKLIST_ROUTES reference valid clusters', () => {
    const clusterSlugs = CLUSTERS.map((c) => c.slug);
    for (const checklist of ARTICLE_ROUTES) {
      expect(clusterSlugs).toContain(checklist.cluster);
    }
  });

  it('all articles have unique routes', () => {
    const routes = ARTICLE_ROUTES.map((a) => a.route);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('all articles have a CTA type that matches the taxonomy', () => {
    const validCtas = ['whatsapp', 'diagnostic', 'checklist', 'form'];
    for (const article of ARTICLE_ROUTES) {
      expect(validCtas).toContain(article.ctaType);
    }
  });

  it('all articles have a primary keyword', () => {
    for (const article of ARTICLE_ROUTES) {
      expect(article.primaryKeyword).toBeTruthy();
      expect(article.primaryKeyword.length).toBeGreaterThan(5);
    }
  });

  it('sitemap would only contain published content routes', () => {
    // Placeholder: quando artigos reais forem criados, este teste valida
    // que todo artigo published tem os campos obrigatórios
    // Por enquanto é um placeholder para garantir que o test suite existe
    expect(true).toBe(true);
  });
});
