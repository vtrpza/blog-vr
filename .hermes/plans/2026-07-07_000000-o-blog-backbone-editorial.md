# O Blog — Backbone Editorial do Lead Engine

> **Para Hermes:** Use este plano como roteiro-mestre. Cada fase é um slice independente. As fases 0 e 1 são bloqueadoras — sem elas, todo o resto é inútil.

**Goal:** Transformar `blog.vradvogados.com.br` de vitrine de placeholders em motor orgânico de aquisição com conteúdo jurídico informativo, anti-slop, factual, narrativo, SEO-otimizado, com imagens contextuais, CTAs e backlinks — tudo com revisão humana/OAB obrigatória antes de publicação.

**Tech Stack:** Astro 7 + MDX + Content Collections + Tailwind CSS 4 + Cloudflare Pages/D1

**Status:** 26 rotas placeholder geradas por `taxonomy.ts`, 1 MDX draft (`busca-e-apreensao-veiculo.mdx`, `noindex: true`), 0 artigos publicados.

---

## 1. Diagnóstico (auditado em 2026-07-07)

### O que funciona
- Stack sólida: Astro + MDX + Content Collections + Tailwind v4
- Content Collections com Zod schema completo (articles, hubs, glossary, briefs)
- Sistema de tracking: dataLayer, scroll events, IntersectionObserver, CTA tracking
- Componentes prontos: LeadCta, ClusterCard, Disclaimer, BaseLayout, SiteHeader
- SEO base: sitemap, robots.txt, canonical, JSON-LD (Organization, WebSite, BreadcrumbList, Article)
- Backend de leads: D1 + Turnstile + Pipedrive + outbox implementado
- Build passa: 38 pages, sitemap-index.xml

### O que está quebrado (bloqueadores)
1. **`[...slug].astro` NÃO renderiza MDX.** Gera páginas a partir de `ARTICLE_ROUTES` da taxonomy.ts com template placeholder fixo. O conteúdo MDX real nunca é injetado. Corrigir isso é pré-requisito para qualquer produção de conteúdo.
2. **Inconsistência de clusters:**
   - `taxonomy.ts`: `ClusterSlug = 'cobrancas-fraudes'`
   - `content.config.ts`: `cluster = z.enum(['busca-e-apreensao', ..., 'cobrancas-indevidas', 'fraudes-bancarias'])`
   - `lead-schema.ts`: `PROBLEM_TYPES` inclui `'cobrancas-fraudes'`
   - Esses nomes precisam ser unificados ANTES de criar artigos.
3. **Placeholders indexáveis.** 26 rotas geradas a partir de `ARTICLE_ROUTES` sem conteúdo real. Se o custom domain for conectado, o Google indexa casca vazia — dano reputacional imediato.
4. **Homepage com linguagem de risco OAB.** "destruir contratos", "entra a faca", "inimigo dos bancos", "Em 24h a gente te diz", "sem custo por análise inicial", estatísticas sem fonte. O Provimento 205/2021 exige sobriedade, vedação de promessa de resultado e de comparação/autoengrandecimento.
5. **Article schema incompleto.** `articleSchema()` em `seo.ts` não inclui `datePublished`, `dateModified`, `image`, `author` como `Person`.

### O que falta (gap conhecido)
- 20 artigos reais (900+ palavras, fontes, links internos) — documentado em `BUILD_TO_DEPLOY.md` Fase 6
- 5 hubs com FAQ e priorityArticles
- Glossário inicial (15-20 termos)
- Imagens contextuais por artigo
- Sistema editorial anti-slop
- Revisão OAB de todo conteúdo

---

## 2. Princípios editoriais

### Regras negativas (PROIBIDO nos textos)

**Slop lexical — banir na geração e na revisão:**
- "Neste artigo, você vai descobrir…" / "Descubra como…" / "Vamos explorar…"
- "É importante ressaltar que…" / "Vale destacar que…" / "Não podemos deixar de mencionar…"
- "No mundo atual…" / "No cenário jurídico contemporâneo…"
- "Complexo", "multifacetado", "crucial", "fundamental", "essencial" — esvaziados pelo uso
- "Solução definitiva", "garantido", "100% seguro"
- "Especialistas renomados", "profissionais altamente qualificados"
- Em-dashes (—) — máximo 2 por artigo
- Conclusão genérica "Em resumo…" — terminar com CTA ou pergunta provocativa

**Slop estrutural:**
- Parágrafos de mesma extensão (variar 2-7 linhas)
- Listas de "5 motivos para…" ou "7 dicas de…"
- Voz passiva excessiva ("pode ser observado que…")
- Tom professoral ("é necessário compreender que…")

**Risco jurídico/OAB — banir permanentemente:**
- Promessa de resultado ("vamos recuperar seu veículo", "reduzimos sua dívida em X%")
- Menção a valores de honorários, desconto ou gratuidade
- Comparação com outros advogados ou escritórios
- Uso de casos concretos com resultado
- Expressões persuasivas de autoengrandecimento
- Incitação direta a litígio ("processe seu banco agora")

### Regras positivas (OBRIGATÓRIO nos textos)

**Abertura:**
- Começar pela dor real do leitor: "O oficial de justiça bateu na porta às 6h da manhã. E agora?"
- Resposta curta nos primeiros 2 parágrafos — isso é featured snippet bait para Google

**Narrativa:**
- Voz ativa, segunda pessoa ("você"), tom de conversa
- Frases curtas (4-8 palavras) intercaladas com explicações mais longas (15-25 palavras) — ritmo
- Cena concreta, pergunta real, documento real
- Exemplo anônimo: "Um cliente recebia cobrança de R$ 47 mil de um empréstimo que nunca contratou"

**Factualidade:**
- Citação de fonte com link: "O art. 3º do Decreto-Lei 911/69 estabelece que…"
- Termo técnico explicado na primeira menção + link para verbete do glossário
- Frases condicionais: "depende do contrato, da fase do processo, dos comprovantes"
- Dados do BACEN, Planalto, STJ, CNJ — sempre linkados

**CTA:**
- Contextual e informativo, nunca "compre agora"
- 3 posições: after intro, mid-content (após seção-chave), final
- Mapeamento por intent: `urgent` → WhatsApp, `informational` → diagnóstico, `checklist` → checklist, `commercial-investigation` → formulário

**Disclaimer:**
- Embebido naturalmente no texto, não só no `<Disclaimer />` do final
- Ex: "Cada caso depende dos documentos, valores e fase da cobrança — esta análise é o que um advogado especializado faz ao examinar seu contrato"

---

## 3. Pipeline editorial (por artigo)

```
1. BRIEF  →  2. RESEARCH  →  3. DRAFT IA  →  4. HUMANIZAÇÃO  →  5. FACT-CHECK  →  6. REVISÃO OAB  →  7. IMAGENS  →  8. SEO TÉCNICO  →  9. PUBLICAÇÃO  →  10. MONITORAMENTO
```

### 3.1 Brief (`src/content/briefs/<slug>.json`)
- Preencher campos: `theme`, `searchIntent`, `userPain`, `mainQuestion`, `shortAnswer`, `keywords`, `internalLinks`, `recommendedCta`, `requiredDocuments`, `officialSources`, `oabRisk`, `conversionHypothesis`
- Template já existe em `content.config.ts`

### 3.2 Research
- Fontes primárias obrigatórias: planalto.gov.br (leis), bcb.gov.br (taxas), STJ/CNJ (jurisprudência), consumidor.gov.br
- Extrair: número da lei, artigo, parágrafo, vigência
- Anotar taxa BACEN atual para a modalidade (ex: aquisição de veículos PF)

### 3.3 Draft IA
- Prompt inclui: brief completo + regras anti-slop + fontes extraídas + exemplos de tom
- Output: MDX com frontmatter completo + corpo do texto
- `status: draft`, `noindex: true`

### 3.4 Humanização (passagem anti-slop)
- Checklist de 15 itens (Anexo A abaixo)
- Reescrever trechos que disparam slop detection
- Verificar variação de parágrafo, ritmo, voz ativa

### 3.5 Fact-check
- Cada claim jurídica tem fonte linkada em `sources[]`
- Taxas e prazos conferidos contra fonte oficial
- Nenhuma afirmação absoluta sem condicional

### 3.6 Revisão OAB
- `oabRisk: low` → pode publicar sem `reviewedBy` (conteúdo puramente informativo)
- `oabRisk: medium` → requer `reviewedBy` preenchido
- `oabRisk: high` → NÃO publica sem revisão humana + `reviewedBy`
- Verificar: sem promessa, sem comparação, sem captação, linguagem sóbria

### 3.7 Imagens
- 1 hero image por artigo (1200×630px, WebP)
- 1-2 imagens inline contextuais (diagrama, fluxo, checklist visual)
- Gerar com IA ou usar Unsplash editorial — sem logo de banco, sem pessoa identificável
- Alt text descritivo contextual, não genérico

### 3.8 SEO técnico
- Frontmatter: `seoTitle` (com hook, ≤60 chars), `metaDescription` (≤170 chars, com hook)
- `publishedAt` = data real, `updatedAt` quando revisado
- `canonical` se houver syndication
- `relatedArticles` populado
- `secondaryKeywords` populado

### 3.9 Publicação
- Mudar `status: draft` → `status: review` → `status: published`
- Mudar `noindex: true` → `noindex: false`
- Rodar `npm run check && npm run build && npm test`
- Smoke test na rota

### 3.10 Monitoramento
- Search Console: inspecionar URL, solicitar indexação
- GA4: verificar `article_view`, `scroll_75`, `cta_click`
- Revisitar trimestralmente: taxas, leis, prazos atualizados

---

## 4. Arquitetura de conteúdo

### Hubs (5)
| Hub | Rota | Intenção principal | Artigos |
|---|---|---|---|
| Busca e apreensão | `/busca-e-apreensao/` | urgent | 6 |
| Juros abusivos | `/juros-abusivos/` | commercial-investigation | 6 |
| Dívidas PJ | `/dividas-pj/` | commercial-investigation | 6 |
| Superendividamento | `/superendividamento/` | informational | 4 |
| Cobranças indevidas | `/cobrancas-indevidas/` | urgent | 5 |

### Calendário editorial (ordem de produção)

**Fase A — Busca e apreensão (cluster mais maduro, brief pronto)**
1. `busca-e-apreensao-veiculo` (urgent, whatsapp)
2. `quantas-parcelas-atrasadas-busca-e-apreensao` (informational, checklist)
3. `oficial-de-justica-busca-e-apreensao-o-que-fazer` (urgent, whatsapp)
4. `como-recuperar-veiculo-apreendido` (urgent, whatsapp)
5. `entrega-amigavel-quita-divida` (commercial-investigation, diagnostic)
6. `veiculo-de-trabalho-pode-ser-apreendido` (informational, diagnostic)

**Fase B — Juros abusivos (alta intenção comercial)**
7. `juros-abusivos-financiamento-veiculo` (commercial-investigation, diagnostic)
8. `taxa-media-bacen-como-comparar` (comparison, checklist)
9. `seguro-prestamista-e-obrigatorio` (informational, diagnostic)
10. `tarifas-bancarias-financiamento` (informational, checklist)
11. `acao-revisional-quando-vale-a-pena` (commercial-investigation, diagnostic)
12. `parcelas-do-financiamento-nao-baixam` (informational, diagnostic)

**Fase C — Dívidas PJ (ticket alto)**
13. `execucao-bancaria-empresa-o-que-fazer` (urgent, form)
14. `capital-de-giro-juros-abusivos` (commercial-investigation, form)
15. `bloqueio-judicial-conta-pj` (urgent, form)
16. `avalista-divida-empresa-riscos` (informational, diagnostic)
17. `renegociacao-divida-pj-com-banco` (commercial-investigation, form)
18. `ccb-bancaria-empresa-cuidados` (informational, diagnostic)

**Fase D — Superendividamento (top of funnel)**
19. `lei-do-superendividamento-como-funciona` (informational, diagnostic)
20. `quais-dividas-entram-no-superendividamento` (informational, diagnostic)
21. `minimo-existencial-dividas` (informational, diagnostic)
22. `banco-e-obrigado-a-renegociar-divida` (commercial-investigation, diagnostic)

**Fase E — Cobranças indevidas e fraudes**
23. `nome-negativado-indevidamente-o-que-fazer` (urgent, diagnostic)
24. `cobranca-indevida-banco-como-resolver` (urgent, diagnostic)
25. `emprestimo-nao-contratado` (urgent, diagnostic)
26. `golpe-pix-responsabilidade-do-banco` (commercial-investigation, diagnostic)

---

## 5. Template de artigo (estrutura MDX)

```mdx
---
slug: busca-e-apreensao-veiculo
status: published
title: "Busca e apreensão de veículo: o que fazer antes que o oficial bata na porta"
seoTitle: "Busca e Apreensão de Veículo: Seus Direitos em 2026"
metaDescription: "Recebeu notificação de busca e apreensão? Veja os documentos que precisa separar, prazos legais e como agir antes de falar com o banco."
cluster: busca-e-apreensao
intent: urgent
author: "VR Advogados"
reviewedBy: "Dr. Valdecir Rabelo Filho — OAB/ES 26.575"
publishedAt: 2026-08-01
updatedAt: 2026-08-01
heroImage: "/assets/images/articles/busca-e-apreensao-veiculo/hero.webp"
imageAlt: "Contrato de financiamento sobre uma mesa com calculadora e documentos — análise de cláusulas de busca e apreensão"
summary: "Guia prático para quem recebeu notificação de busca e apreensão: documentos, prazos do Decreto-Lei 911/69 e o que fazer antes de entregar o veículo."
primaryKeyword: "busca e apreensão veículo"
secondaryKeywords:
  - "busca e apreensão o que fazer"
  - "notificação busca e apreensão"
  - "Decreto-Lei 911/69"
relatedArticles:
  - quantas-parcelas-atrasadas-busca-e-apreensao
  - oficial-de-justica-busca-e-apreensao-o-que-fazer
  - como-recuperar-veiculo-apreendido
ctaType: whatsapp
requiredDocuments:
  - "Contrato de financiamento (com número e data)"
  - "Comprovantes de pagamento das parcelas"
  - "Notificação extrajudicial ou citação judicial recebida"
  - "CRLV do veículo"
sources:
  - label: "Decreto-Lei 911/69"
    url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del0911.htm"
  - label: "Código de Processo Civil"
    url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm"
  - label: "Taxa Média BACEN — Aquisição de Veículos PF"
    url: "https://www.bcb.gov.br/estatisticas/reporttxjuros?codigoSegmento=1&codigoModalidade=401101"
oabRisk: low
noindex: false
---

## Resposta curta

Separe o contrato, os comprovantes de pagamento e a notificação que você recebeu. 
O banco só pode tomar o veículo depois de um processo judicial — e você tem direito a se defender. 
Mas o relógio corre: depois de citado, o prazo para pagar o débito e evitar a apreensão é de **5 dias** 
(art. 3º, §2º do Decreto-Lei 911/69).

## Quando isso acontece na prática

Você financiou um carro em 48 parcelas. Pagou 30. A renda caiu, as parcelas atrasaram. 
O banco não quer renegociar — quer o carro de volta. 

Aí chega a notificação. Ou pior: o oficial de justiça no seu endereço.

A verdade que ninguém te conta: o banco **prefere** que você entregue o carro na primeira pressão. 
Por quê? Porque o veículo apreendido vai a leilão, o valor apurado abate (parcialmente) a dívida — 
e você **ainda pode sair devendo** a diferença.

## O que a lei diz

O Decreto-Lei 911/69 regula a alienação fiduciária — o mecanismo que permite ao banco 
retomar o veículo em caso de inadimplência. Os pontos críticos:

1. **Mora comprovada**: o banco precisa te notificar extrajudicialmente (cartório) de que você está em débito
2. **Prazo de 5 dias**: após a citação judicial, você tem 5 dias para pagar o débito e encerrar o processo (art. 3º, §2º)
3. **Purgação da mora**: se você pagar o valor integral do débito nesses 5 dias, o processo é extinto e o carro fica com você
4. **Venda do veículo**: se não houver pagamento, o banco pode vender o veículo em leilão público ou particular
5. **Saldo residual**: se o valor do leilão não cobrir toda a dívida, você ainda deve a diferença

## Documentos que você precisa separar agora

- Contrato de financiamento (localize número, data, valor financiado, taxa de juros, CET)
- Comprovantes de todas as parcelas pagas (extrato bancário ou borderô)
- Notificação extrajudicial que recebeu (cartório, carta, e-mail)
- CRLV do veículo
- Cópia da citação ou mandado judicial, se já foi citado

## Erros comuns

1. **Ignorar a notificação.** Achar que "depois eu resolvo" — o prazo de 5 dias é fatal
2. **Entregar o carro sem orientação.** Se não houver defesa técnica, o leilão acontece e você ainda fica devendo
3. **Acreditar em promessa de acordo milagroso.** "Pague 30% e quite" quase sempre é cilada — o contrato de confissão de dívida te faz reconhecer valores que podem ser abusivos
4. **Não guardar comprovantes.** Sem prova de pagamento, você perde o argumento de que já pagou parte significativa

## Quando procurar análise individual

Se você recebeu notificação, tem contrato em mãos e quer entender:
- Se as parcelas cobradas incluem juros acima da taxa média BACEN
- Se o valor do débito está correto ou tem encargos indevidos
- Se o prazo de 5 dias ainda está correndo
- Se há defesa possível (ex: veículo é instrumento de trabalho)

…então o próximo passo é organizar os documentos acima e solicitar uma análise.

> ⚠️ **Importante:** Cada caso depende dos documentos, valores, fase do processo e contrato específico. 
> Este guia é informativo — a análise individual é o que permite traçar uma estratégia real.

## Artigos relacionados

- [Quantas parcelas atrasadas podem levar à busca e apreensão?](/quantas-parcelas-atrasadas-busca-e-apreensao/)
- [Oficial de justiça bateu na porta: o que fazer](/oficial-de-justica-busca-e-apreensao-o-que-fazer/)
- [Como recuperar veículo apreendido: documentos e prazos](/como-recuperar-veiculo-apreendido/)

## Fontes oficiais

- [Decreto-Lei 911/69 — Alienação Fiduciária](https://www.planalto.gov.br/ccivil_03/decreto-lei/del0911.htm)
- [Código de Processo Civil — Lei 13.105/2015](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm)
- [Taxa Média BACEN — Aquisição de Veículos PF](https://www.bcb.gov.br/estatisticas/reporttxjuros?codigoSegmento=1&codigoModalidade=401101)

---
*Conteúdo revisado por Dr. Valdecir Rabelo Filho — OAB/ES 26.575. Publicado em agosto de 2026.*
```

---

## 6. Plano de execução (fases)

### 🔴 Fase 0 — Travar indexação de placeholders (bloqueador crítico)

**Problema:** 26 rotas geradas a partir de `ARTICLE_ROUTES` com template placeholder. Se o custom domain for conectado ou o Google rastrear, indexa casca vazia.

**Ações:**
1. Adicionar `<meta name="robots" content="noindex">` condicional no `BaseLayout.astro` — quando `pageType === 'article'` e não há conteúdo MDX real associado
2. Excluir rotas sem MDX `status: published` do sitemap
3. Verificar `robots.txt` — garantir que não há `Disallow` que impeça rastreamento de `/artigos/`
4. Smoke test: `curl -I https://blog-vr.pages.dev/busca-e-apreensao-veiculo/ | grep -i x-robots-tag`

**Arquivos:** `src/layouts/BaseLayout.astro`, `src/pages/robots.txt.ts`, `src/pages/[...slug].astro`

---

### 🔴 Fase 1 — Corrigir arquitetura de conteúdo (bloqueador crítico)

**Problema:** `[...slug].astro` não carrega MDX da content collection. Gera páginas a partir de `getStaticPaths()` baseado em `ARTICLE_ROUTES` com template fixo.

**Ações:**

#### 1.1 Unificar nomes de clusters
- Padronizar em `taxonomy.ts`, `content.config.ts` e `lead-schema.ts` para:
  - `busca-e-apreensao`
  - `juros-abusivos`
  - `dividas-pj`
  - `superendividamento`
  - `cobrancas-indevidas`
- Atualizar `PROBLEM_TYPES` em `lead-schema.ts`
- Rodar `npm test` — esperado: todos passam

#### 1.2 Fazer `[...slug].astro` renderizar MDX real
- Importar `getCollection('articles')` do `astro:content`
- No `getStaticPaths()`, fazer match entre `article.slug` (taxonomy) e `entry.data.slug` (collection)
- Passar o MDX `entry` como prop
- Renderizar `<Content />` do MDX onde hoje está o template placeholder
- Manter fallback: se não houver MDX, mostrar "Este artigo ainda não foi publicado" sem indexação
- Só gerar rota se `entry.data.status === 'published'`

#### 1.3 Implementar `noindex` condicional real
- No `BaseLayout.astro`: se o artigo MDX tem `noindex: true` OU `status !== 'published'`, injetar `<meta name="robots" content="noindex, nofollow">`

#### 1.4 Sitemap só com conteúdo publicado
- `@astrojs/sitemap` com `filter`: excluir páginas com `noindex` ou `status !== 'published'`

#### 1.5 Adicionar `datePublished`, `dateModified`, `image` ao `articleSchema()`
- `src/lib/seo.ts`: completar `articleSchema()` com todos os campos do schema.org `BlogPosting`

#### 1.6 Criar teste de integridade de conteúdo
- `tests/content-integrity.test.ts`: verifica que todo artigo `published` tem `sources[]`, `reviewedBy`, `heroImage`, `imageAlt`

**Arquivos:** `src/pages/[...slug].astro`, `src/lib/seo.ts`, `src/lib/taxonomy.ts`, `src/content.config.ts`, `src/lib/lead-schema.ts`, `src/layouts/BaseLayout.astro`, `astro.config.mjs`, `tests/content-integrity.test.ts`

**Verificação:** `npm test && npm run check && npm run build` — 0 erros, sitemap só contém páginas publicadas, `/busca-e-apreensao-veiculo/` renderiza conteúdo MDX real (ou mostra placeholder adequado se ainda draft)

---

### 🟡 Fase 2 — Criar SOP editorial anti-slop

**Ações:**
1. Criar `docs/EDITORIAL_GUIDELINES.md` com todas as regras da seção 2 (negativas + positivas)
2. Criar `docs/ANTI_SLOP_CHECKLIST.md` — checklist de 15 itens para revisão humana (Anexo A abaixo)
3. Criar `docs/PROMPT_TEMPLATE.md` — template de prompt para geração de draft IA (inclui brief JSON + regras anti-slop + fontes)
4. Salvar como skill: `content-pipeline` — workflow completo de criação de artigo

**Arquivos:** `docs/EDITORIAL_GUIDELINES.md`, `docs/ANTI_SLOP_CHECKLIST.md`, `docs/PROMPT_TEMPLATE.md`

---

### 🟡 Fase 3 — Cluster busca-e-apreensao (6 artigos)

**Pré-requisito:** Fases 0 e 1 concluídas.

Para cada artigo, seguir pipeline (seção 3):
1. Completar `briefs/<slug>.json`
2. Research fontes oficiais
3. Gerar draft MDX com prompt anti-slop
4. Humanização (checklist 15 itens)
5. Fact-check
6. Revisão OAB (cluster `low` risk — pode publicar com `reviewedBy`)
7. Gerar hero image (1200×630px WebP)
8. SEO técnico (frontmatter completo)
9. Publicar: `status: published`, `noindex: false`
10. `npm run check && npm run build && npm test`

---

### 🟡 Fase 4 — Cluster juros-abusivos (6 artigos)
### 🟡 Fase 5 — Cluster dívidas PJ (6 artigos)
### 🟢 Fase 6 — Cluster superendividamento (4 artigos)
### 🟢 Fase 7 — Cluster cobranças indevidas (5 artigos)

(Mesmo pipeline da Fase 3)

---

### 🔵 Fase 8 — Conteúdo complementar

**Ações:**
1. Completar 5 hubs com FAQ real + priorityArticles populados
2. Criar glossário inicial (15-20 termos): alienação fiduciária, CET, purgação da mora, taxa média BACEN, mínimo existencial, CCB, avalista, etc.
3. Completar `briefs/` para todos os artigos publicados

**Arquivos:** `src/content/hubs/*.json`, `src/content/glossary/*.json`, `src/content/briefs/*.json`

---

### 🔵 Fase 9 — Imagens e componentes visuais

**Ações:**
1. Criar `src/components/ArticleImage.astro` — wrapper do Astro `<Image />` com alt, caption, lazy loading, srcset responsivo
2. Criar `src/components/RelatedArticles.astro` — "Leia também" no final do artigo (usa `relatedArticles[]` do frontmatter)
3. Criar `src/components/SourceList.astro` — "Fontes oficiais" com ícone de link externo
4. Criar `src/components/ReviewBadge.astro` — selo "Revisado por Dr. X — OAB/XX 00000"
5. Gerar hero images para todos os artigos (1200×630px, WebP, em `public/assets/images/articles/<slug>/hero.webp`)
6. Gerar 1-2 imagens inline por artigo (fluxogramas, diagramas, checklists visuais)

---

### ⚪ Fase 10 — Tracking e melhoria contínua (pós-publicação)

**Ações:**
1. Conectar Search Console, enviar sitemap
2. Validar `article_view`, `scroll_75`, `cta_click` no GA4 DebugView
3. Configurar GTM + GA4 + Clarity (scripts no BaseLayout)
4. Lighthouse CI: garantir score > 90
5. Revisão trimestral: taxas BACEN, leis, prazos atualizados

---

## 7. Backlinks (estratégia)

### O que NÃO fazer
- Comprar backlinks (PBN, Fiverr, "packs de guest post")
- Troca de links recíproca em massa
- Comentários em blogs com link
- Diretórios de baixa qualidade

### Estratégia white-hat (fase pós-conteúdo)
1. **Links internos**: já implementados — `relatedArticles[]`, links intra-cluster, breadcrumbs
2. **Citações externas**: já implementadas — `sources[]` no frontmatter linkando para planalto.gov.br, bcb.gov.br, STJ
3. **Guest posts éticos**: artigos para sites jurídicos parceiros (Migalhas, JusBrasil, Conjur) com link natural de volta
4. **Materiais ricos**: e-books/calculadoras de juros que sites referenciam organicamente
5. **Imprensa local**: cases de estudo (anonimizados) que jornais locais cobrem
6. **Dados próprios**: publicar análises baseadas nos dados do escritório (ex: "Taxa média de juros em financiamento de veículos nos últimos 12 meses — análise de 500 contratos")

---

## 8. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Placeholder indexado pelo Google | Domínio queimado antes de lançar | Fase 0: noindex condicional, sitemap filtrado |
| Conteúdo IA cru sem revisão | Penalização Google (scaled content abuse) | IA só gera draft; humano revisa, fact-check, OAB |
| Linguagem agressiva na home | Denúncia OAB, multa, suspensão | Atenuar claims, adicionar fontes, revisar com `oabRisk: high` |
| Promessa jurídica em artigo | Processo ético-disciplinar | Checklist anti-slop inclui regras OAB; `reviewedBy` obrigatório |
| Inconsistência de clusters | Build quebra, testes falham | Fase 1.1: unificar enum antes de qualquer artigo |
| Taxa BACEN desatualizada | Desinformação, perda de credibilidade | Revisão trimestral; `updatedAt` visível |
| Falta de imagem em artigo | OG share sem preview, UX pobre | `content-integrity.test.ts` bloqueia build se falta hero image |
| MDX não renderiza | Conteúdo escrito mas invisível | Fase 1.2: corrigir `[...slug].astro` antes de produzir |

---

## 9. Verificação final (gate de qualidade)

Todo artigo publicado deve passar:

```text
[ ] status === 'published'
[ ] noindex === false
[ ] reviewedBy preenchido (se oabRisk !== 'low')
[ ] sources[] tem pelo menos 2 fontes oficiais linkadas
[ ] heroImage + imageAlt preenchidos
[ ] primaryKeyword aparece no H1 e no primeiro parágrafo
[ ] secondaryKeywords.length >= 2
[ ] relatedArticles.length >= 2
[ ] metaDescription.length <= 170
[ ] seoTitle.length <= 60
[ ] Nenhum termo slop detectado (rodar checklist Anexo A)
[ ] Nenhuma promessa jurídica
[ ] Nenhum claim sem fonte
[ ] CTA contextual renderizado (3 posições)
[ ] data-track-cta atributos presentes
[ ] BreadcrumbList schema presente
[ ] Article schema com datePublished, author, image
[ ] npm run build passa
[ ] npm test passa (content-integrity incluso)
[ ] Rota retorna 200 com conteúdo não-placeholder
```

---

## 10. Comandos de rotina

```bash
# Desenvolvimento
npm run dev

# Validação pré-commit
npm test && npm run check && npm run build

# Smoke local
curl -s -o /dev/null -w "%{http_code}" "http://localhost:4322/busca-e-apreensao-veiculo/"

# Verificar indexação (produção)
curl -I "https://blog.vradvogados.com.br/busca-e-apreensao-veiculo/" | grep -i robots
```

---

## Anexo A — Checklist anti-slop (15 itens para revisão humana)

Após gerar o draft IA, verificar:

1. [ ] Primeiro parágrafo contém cena concreta ou pergunta real do leitor (não definição de dicionário)
2. [ ] Resposta curta aparece nos primeiros 2 parágrafos
3. [ ] Zero ocorrências de: "Neste artigo", "Vamos explorar", "Descubra como", "É importante ressaltar", "Vale destacar"
4. [ ] Zero ocorrências de: "No mundo atual", "No cenário jurídico contemporâneo", "complexo", "multifacetado", "crucial"
5. [ ] Máximo 2 em-dashes (—) no artigo inteiro
6. [ ] Parágrafos com extensão variada (2-7 linhas, sem padrão repetitivo)
7. [ ] Pelo menos 3 frases curtas (≤8 palavras) intercaladas com frases longas (≥15 palavras)
8. [ ] Voz ativa predomina (>80% dos verbos)
9. [ ] Todo termo técnico é explicado na primeira menção
10. [ ] Toda afirmação jurídica tem fonte linkada (ou é conhecimento público/óbvio)
11. [ ] Nenhuma promessa de resultado ("vamos reduzir", "você vai conseguir")
12. [ ] Nenhuma comparação com outros advogados/escritórios
13. [ ] CTA usa linguagem informativa, não persuasiva ("Solicitar análise" não "Contrate agora")
14. [ ] Tom geral: conversa entre colegas, não aula de professor
15. [ ] Leitura em voz alta soa natural (faça o teste)

---

## Anexo B — Template de prompt para geração de draft IA

```
Você é um redator jurídico especializado em Direito Bancário brasileiro. 
Escreva um artigo informativo para o blog da VR Advogados.

REGRAS ABSOLUTAS:
- Proibido: "Neste artigo", "Vamos explorar", "Descubra", "É importante ressaltar", "Vale destacar"
- Proibido: "complexo", "multifacetado", "crucial", "fundamental"
- Proibido: promessa de resultado ("vamos reduzir", "garantido", "solução definitiva")
- Proibido: voz passiva, tom professoral, parágrafos uniformes
- Máximo 2 travessões (—) no texto todo
- Obrigatório: abrir com cena concreta/dor real
- Obrigatório: resposta curta nos primeiros 2 parágrafos
- Obrigatório: toda afirmação jurídica com fonte oficial linkada
- Obrigatório: CTA informativo, nunca persuasivo
- Tom: conversa entre colegas, segunda pessoa ("você"), voz ativa

BRIEF DO ARTIGO:
{brief_json_aqui}

FONTES OFICIAIS:
{fontes_extraidas}

OUTPUT: MDX completo com frontmatter (preencher todos os campos).
```

---
*Plano criado em 2026-07-07. Próximo passo: Fase 0 — travar indexação de placeholders.*
