import assert from "node:assert/strict";
import test from "node:test";
import { renderArticle, renderAuthor, renderContact, renderHome, renderPage, renderSitemap } from "../src/site.ts";

const post = {
  title: "Contrato <script>alert(1)</script>",
  slug: "contrato-seguro",
  metaDescription: "Descrição segura",
  excerpt: "Resumo",
  blocks: [{ type: "paragraph" as const, text: "Texto <img src=x onerror=alert(1)>", sourceIds: ["s1"] }],
  sources: [{ id: "s1", title: "Fonte", url: "https://www.bcb.gov.br/estatisticas/txjuros" }],
  authorSlug: "equipe-editorial",
  publishedAt: "2026-07-14T12:00:00Z",
  updatedAt: "2026-07-14T12:00:00Z"
};

test("renders an article as escaped server-side HTML", () => {
  const html = renderArticle(post, "https://blog.vradvogados.com.br");
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /Contrato &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /Texto &lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /rel="canonical" href="https:\/\/blog\.vradvogados\.com\.br\/artigos\/contrato-seguro\/"/);
});

test("renders the home with three legal pillars and recent articles", () => {
  const html = renderHome([post], "https://blog.vradvogados.com.br");
  assert.match(html, /Direito bancário com clareza e fontes verificáveis/);
  assert.match(html, /Busca e apreensão/);
  assert.match(html, /Revisão de contratos/);
  assert.match(html, /Dívidas bancárias empresariais/);
  assert.match(html, /\/artigos\/contrato-seguro\//);
  assert.match(html, /Falar com a equipe/);
});

test("renders an XML sitemap with static and published article URLs", () => {
  const xml = renderSitemap([post], "https://blog.vradvogados.com.br");
  assert.match(xml, /<urlset/);
  assert.match(xml, /https:\/\/blog\.vradvogados\.com\.br\/busca-e-apreensao\//);
  assert.match(xml, /https:\/\/blog\.vradvogados\.com\.br\/artigos\/contrato-seguro\//);
  assert.match(xml, /2026-07-14/);
});

test("renders a minimal lead form protected by Turnstile and a honeypot", () => {
  const html = renderContact("https://blog.vradvogados.com.br", "site-key");
  assert.match(html, /action="\/api\/contact"/);
  assert.match(html, /name="website"/);
  assert.match(html, /data-sitekey="site-key"/);
  assert.match(html, /name="consent"/);
  assert.match(html, /name="subject"/);
});

test("renders a pillar page with a sober contextual conversion path", () => {
  const html = renderPage("busca-e-apreensao", "https://blog.vradvogados.com.br", [post]);
  assert.match(html, /<h1>Busca e apreensão de veículos<\/h1>/);
  assert.match(html, /Constituição da mora/);
  assert.match(html, /Fontes oficiais/);
  assert.match(html, /Atualizado em/);
  assert.match(html, /\/artigos\/contrato-seguro\//);
  assert.ok((html.match(/<section>/g) ?? []).length >= 8);
  assert.match(html, /Falar com a equipe/);
  assert.doesNotMatch(html, /garantia de resultado/i);
});

test("keeps all three SEO pillars substantial and source-backed", () => {
  for (const slug of ["busca-e-apreensao", "revisao-de-contratos-bancarios", "dividas-bancarias-empresariais"]) {
    const html = renderPage(slug, "https://blog.vradvogados.com.br");
    assert.ok((html.match(/<section>/g) ?? []).length >= 8, `${slug} is too thin`);
    assert.match(html, /Fontes oficiais/);
    assert.match(html, /dateModified/);
  }
});

test("renders the automated editorial author without attributing a human review", () => {
  const html = renderAuthor("https://blog.vradvogados.com.br");
  assert.match(html, /Equipe Editorial VR Advogados/);
  assert.match(html, /automação/);
  assert.doesNotMatch(html, /OAB\s*\d/i);
});
