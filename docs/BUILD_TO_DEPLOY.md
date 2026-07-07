# Mapa de construção e deploy — blog.vradvogados.com.br

> Documento operacional para reconstruir o projeto do zero, entender o que já foi feito e levar o MVP até produção na Cloudflare.

## 1. Objetivo do projeto

Construir `blog.vradvogados.com.br` como **motor orgânico de aquisição de leads** para a VR Advogados.

Não é blog institucional. É um funil editorial por intenção:

1. captura buscas orgânicas de alta intenção;
2. entrega resposta informativa rápida;
3. conduz para hub, artigo, checklist ou diagnóstico;
4. converte via WhatsApp/formulário;
5. salva lead antes de qualquer chamada externa;
6. sincroniza com Pipedrive;
7. mede lead por cluster, CTA e origem.

Métrica principal:

```text
lead_rate = qualified_leads / eligible_sessions
```

Tráfego sem lead qualificado é vaidade com CDN.

---

## 2. Stack definida

```text
Frontend: Astro + TypeScript + MDX
Estilo: Tailwind CSS v4 via @tailwindcss/vite
Conteúdo: Astro Content Collections + MDX/JSON em Git
Hospedagem: Cloudflare Pages
API: Cloudflare Pages Functions / Workers
Banco: Cloudflare D1
Anti-spam: Cloudflare Turnstile
CRM: Pipedrive API
Tracking: GA4/GTM + dataLayer + Microsoft Clarity
SEO: sitemap, robots, canonical, JSON-LD, Search Console
QA: Vitest + astro check + build + preview + curl smoke tests
```

### Decisões negativas do MVP

Não usar no MVP:

- WordPress frontend;
- Supabase/Postgres;
- Zapier/Make;
- SERP API paga;
- WhatsApp Business API paga;
- publicação automática por IA;
- promessa jurídica agressiva.

A arquitetura correta aqui é enxuta: Cloudflare + Pipedrive + OpenAI, espremidos até sangrar custo fixo zero.

---

## 3. Status atual — já feito

### 3.1 Fundação técnica criada

Arquivos principais:

```text
package.json
package-lock.json
tsconfig.json
vitest.config.ts
astro.config.mjs
wrangler.toml
.gitignore
README.md
```

Scripts disponíveis:

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Dependências:

```text
astro v7.0.6
@astrojs/check
@astrojs/mdx
@astrojs/sitemap
@tailwindcss/vite v4.3.2
tailwindcss v4.3.2
@cloudflare/workers-types
typescript
vitest v4.1.10
```

### 3.2 Content Collections configuradas

Arquivo: `src/content.config.ts`

Collections: `articles`, `hubs`, `glossary`, `briefs`

Conteúdo inicial de validação:

```text
src/content/articles/busca-e-apreensao-veiculo.mdx
src/content/hubs/busca-e-apreensao.json
src/content/glossary/alienacao-fiduciaria.json
src/content/briefs/busca-e-apreensao-veiculo.json
```

### 3.3 Taxonomia e contrato do lead engine

Arquivo: `src/lib/taxonomy.ts`

Criado: 5 hubs, 26 artigos, 3 checklists, CTAs por cluster, eventos de tracking, helpers.

Hubs: `/busca-e-apreensao/`, `/juros-abusivos/`, `/dividas-pj/`, `/superendividamento/`, `/cobrancas-indevidas/`

Checklists: `/checklist-busca-e-apreensao/`, `/checklist-juros-abusivos/`, `/checklist-divida-pj/`

### 3.4 Testes

```text
tests/taxonomy.test.ts    — 3 tests (hubs, rotas, copy proibida, tracking)
tests/lead-schema.test.ts — 26 tests (validação, phone, clusters, landing)
```

Resultado: **29 tests passed** (2 files)

### 3.5 Layout, componentes e páginas

```text
src/layouts/BaseLayout.astro       — importa global.css (Tailwind)
src/components/SiteHeader.astro
src/components/LeadCta.astro
src/components/ClusterCard.astro
src/components/Disclaimer.astro
src/lib/seo.ts
src/lib/lead-schema.ts             — tipos, validação, normalizePhone
src/styles/global.css              — @import "tailwindcss" + custom properties
src/pages/index.astro
src/pages/[...slug].astro
src/pages/diagnostico-inicial.astro
src/pages/sobre-o-blog.astro
src/pages/privacidade.astro
src/pages/robots.txt.ts
```

Implementado: homepage por dor, hubs da taxonomia, artigos placeholder, checklists, diagnóstico inicial, disclaimer OAB, JSON-LD, canonical, OpenGraph/Twitter, dataLayer, eventos de tracking (cta_view, cta_click, whatsapp_click, scroll, internal_link_click).

### 3.6 Segurança

```text
public/_headers   — X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP
public/_redirects — /diagnostico → /diagnostico-inicial/
```

### 3.7 Build verificado

```text
npm test      -> 29 tests passed (2 files)
npm run check -> 0 errors, 0 warnings, 0 hints (22 files)
npm run build -> 38 pages, sitemap-index.xml
```

### 3.8 Versionamento — ✅ concluído

```text
Repo:    https://github.com/vtrpza/blog-vr
Branch:  main
Remote:  origin → github.com/vtrpza/blog-vr.git
Status:  limpa, tracking origin/main
```

### 3.9 Backend de captura de leads — ✅ concluído

Arquivos criados:

```text
wrangler.toml                     — config Cloudflare Pages + D1 binding
migrations/0001_initial.sql       — schema D1 (leads, lead_events, pipedrive_outbox)
functions/api/leads.ts            — POST /api/leads (Turnstile → D1 → Pipedrive → outbox)
functions/api/health.ts           — GET /api/health (verifica D1)
src/lib/lead-schema.ts            — tipos, validateLeadPayload, normalizePhone, problemToCluster
tests/lead-schema.test.ts         — 26 testes de validação
```

Fluxo do endpoint: valida payload → verifica Turnstile server-side → normaliza telefone → INSERT no D1 → cria lead_events → sincroniza Pipedrive (search person → create/update → create lead → add note) → se falhar, queue outbox.

Regras implementadas: 1–10 (todas as do spec).

### 3.10 Deploy Cloudflare Pages — ✅ concluído

```text
Projeto:      blog-vr (id: 114e932a-f52d-4af5-8a52-1b9a5ef36569)
URL:          https://blog-vr.pages.dev/
D1 Database:  blog-vr-db (id: 1a7f1f05-6ce2-436d-ae41-5fe10f8ab8a5, region: ENAM)
D1 Binding:   DB → blog-vr-db (production + preview)
Functions:    ativo (uses_functions: true)
Build:        manual via wrangler pages deploy (não Git-connected)
```

Secrets configurados:

```text
PIPEDRIVE_API_TOKEN    ✅ (secret)
PIPEDRIVE_API_BASE     ✅ https://vtrpza.pipedrive.com/api
TURNSTILE_SECRET_KEY   ⚠️ placeholder (TODO-REPLACE-ME)
WEBHOOK_SHARED_SECRET  ⚠️ placeholder (TODO-REPLACE-ME)
PIPEDRIVE_OWNER_ID     ⚠️ vazio
PIPEDRIVE_LEAD_LABEL_IDS ⚠️ vazio
```

Health check: `GET /api/health` → `{"ok":true,"version":"0.1.0","d1":"ok","timestamp":"..."}`

### 3.11 CSS fix

Tailwind não carregava porque `BaseLayout.astro` não importava `../styles/global.css`. Corrigido — 1 linha adicionada no frontmatter. CSS gerado: 21.8 KB, link injetado no `<head>`.

---

## 4. Como reconstruir do zero localmente

### 4.1 Pré-requisitos

Ambiente usado durante a construção:

```text
Node.js v22.23.1
npm 10.9.8
```

Recomendado:

```bash
node --version
npm --version
```

### 4.2 Criar diretório do projeto

```bash
mkdir -p ~/blog-vr
cd ~/blog-vr
```

### 4.3 Criar `package.json`

Criar `package.json` com:

```json
{
  "name": "blog-vradvogados-lead-engine",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@astrojs/check": "latest",
    "@astrojs/mdx": "latest",
    "@astrojs/sitemap": "latest",
    "@tailwindcss/vite": "latest",
    "astro": "latest",
    "tailwindcss": "latest",
    "typescript": "latest"
  },
  "devDependencies": {
    "vitest": "latest"
  }
}
```

Instalar:

```bash
npm install
```

### 4.4 Criar configs base

Arquivos obrigatórios:

```text
tsconfig.json
vitest.config.ts
astro.config.mjs
.gitignore
```

Configuração Astro esperada:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://blog.vradvogados.com.br',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### 4.5 Criar estrutura de diretórios

```bash
mkdir -p src/{components,content/articles,content/hubs,content/glossary,content/briefs,layouts,lib,pages,styles}
mkdir -p public tests docs
```

### 4.6 Criar Content Collections

Criar:

```text
src/content.config.ts
```

Collections mínimas:

```text
articles
hubs
glossary
briefs
```

Regra: todo conteúdo precisa validar schema antes de build. Se o conteúdo não passa schema, ele não entra no funil. Simples e brutal.

### 4.7 Criar taxonomia com TDD

1. Criar teste primeiro:

```text
tests/taxonomy.test.ts
```

2. Rodar e ver falhar:

```bash
npm test
```

Falha esperada inicial:

```text
Cannot find module '../src/lib/taxonomy'
```

3. Criar implementação:

```text
src/lib/taxonomy.ts
```

4. Rodar novamente:

```bash
npm test
```

Critério de aceite:

```text
3 tests passed
```

### 4.8 Criar páginas estáticas

Criar:

```text
src/layouts/BaseLayout.astro
src/pages/index.astro
src/pages/[...slug].astro
src/pages/diagnostico-inicial.astro
src/pages/sobre-o-blog.astro
src/pages/privacidade.astro
src/pages/robots.txt.ts
```

Critérios:

- homepage leva a qualquer hub em 1 clique;
- CTA principal aparece acima da dobra;
- hubs listam artigos do cluster;
- artigo tem resposta curta, documentos, erros comuns, próximo passo e disclaimer;
- checklist funciona sem login;
- diagnóstico não dá parecer jurídico automático;
- nenhuma copy promete resultado.

### 4.9 Criar segurança estática

Criar:

```text
public/_headers
public/_redirects
```

Ajustar CSP sempre que adicionar GTM, GA4, Clarity, Turnstile ou endpoints externos. CSP quebrada silenciosamente é uma armadilha chata pra caralho.

### 4.10 Validar localmente

Rodar:

```bash
npm test
npm run check
npm run build
```

Preview:

```bash
npm run preview -- --host 127.0.0.1 --port 4321
```

Smoke test local:

```bash
for path in / /busca-e-apreensao/ /busca-e-apreensao-veiculo/ /checklist-busca-e-apreensao/ /diagnostico-inicial/ /robots.txt /sitemap-index.xml; do
  code=$(curl -s -o /tmp/blogvr-body -w '%{http_code}' "http://127.0.0.1:4321$path")
  bytes=$(wc -c < /tmp/blogvr-body)
  printf '%s %s %s bytes\n' "$code" "$path" "$bytes"
done
```

Critério:

```text
200 para todas as rotas críticas
```

---

## 5. Status das fases

### ✅ Fase 0 — Setup e baseline (concluída)
- Astro + TypeScript + Tailwind + Content Collections
- Headers, redirects, sitemap, robots
- `npm test`, `npm run check`, `npm run build` passando

### ✅ Fase 1 — Versionamento e repositório (concluída)
- Git init, commit inicial, branch `main`
- GitHub: `https://github.com/vtrpza/blog-vr`
- Push configurado

### ✅ Fase 2 — Lead capture backend (concluída)
- `wrangler.toml` com D1 binding
- Migration D1 aplicada (remote): 3 tabelas, 12 queries
- `POST /api/leads` — Turnstile → D1 → Pipedrive → outbox
- `GET /api/health` — `{"ok":true,"d1":"ok"}`
- `src/lib/lead-schema.ts` — 26 testes
- Secrets: PIPEDRIVE_API_TOKEN configurado

### 🔶 Fase 3 — Pipedrive (parcial — código pronto, falta testar com CRM real)
- Código de sync no `functions/api/leads.ts`: search person, create/update, create lead, add note
- **Falta:** preencher `PIPEDRIVE_OWNER_ID` e `PIPEDRIVE_LEAD_LABEL_IDS` no dashboard
- **Falta:** testar fluxo completo com lead real e verificar Leads Inbox

### ⬜ Fase 4 — Retry/outbox e cron (pendente)
- Outbox já criado na migration e no endpoint
- **Falta:** `functions/_scheduled.ts` para cron de retry a cada 6h
- **Falta:** `functions/api/admin/retry-outbox.ts` para retry manual
- **Falta:** `tests/outbox.test.ts`

### ⬜ Fase 5 — Tracking real (pendente)
- dataLayer já implementado no frontend
- **Falta:** criar GTM container e GA4 property
- **Falta:** adicionar `PUBLIC_GTM_ID`, `PUBLIC_GA_MEASUREMENT_ID`, `PUBLIC_CLARITY_ID` como env vars
- **Falta:** instalar script GTM/Clarity no BaseLayout
- **Falta:** validar DebugView com `generate_lead`, `whatsapp_click`

### ⬜ Fase 6 — Conteúdo MVP real (pendente)
- 26 rotas criadas com placeholder
- **Falta:** escrever 20 artigos (900+ palavras, links internos, fontes oficiais)
- **Falta:** preencher 5 hubs com FAQ e priorityArticles
- **Falta:** glossário inicial
- **Falta:** revisão OAB de todo conteúdo antes de publicar

### ✅ Fase 7 — Cloudflare Pages deploy (concluída)
- Projeto criado: `blog-vr` (manual deploy, não Git-connected)
- URL: `https://blog-vr.pages.dev/`
- D1 binding funcionando
- **Falta:** conectar Git repo ao Pages para deploy automático
- **Falta:** custom domain `blog.vradvogados.com.br`

### ⬜ Fase 8 — Pós-deploy SEO/analytics (pendente)
- **Falta:** adicionar propriedade no Google Search Console
- **Falta:** enviar sitemap
- **Falta:** configurar GTM/GA4/Clarity
- **Falta:** Lighthouse CI

---

## 6. Gate de lançamento

O MVP só está pronto para produção quando todos passarem:

```text
[x] Repo Git limpo e remoto configurado        — https://github.com/vtrpza/blog-vr
[x] npm test passa                              — 29 tests (2 files)
[x] npm run check passa                         — 22 files, 0 errors
[x] npm run build passa                         — 38 pages, sitemap
[x] Cloudflare Pages deploy funcionando         — https://blog-vr.pages.dev/
[x] D1 database criado e vinculado              — 3 tabelas, health ok
[x] POST /api/leads implementado                — Turnstile → D1 → Pipedrive → outbox
[x] PIPEDRIVE_API_TOKEN configurado             — secret no Pages project
[ ] TURNSTILE_SECRET_KEY real                   — placeholder
[ ] PIPEDRIVE_OWNER_ID + LEAD_LABEL_IDS         — vazios
[ ] Custom domain funcionando em HTTPS          — blog.vradvogados.com.br pendente
[ ] Headers e redirects publicados              — incluídos no bundle
[ ] Sitemap publicado                           — sitemap-index.xml incluso
[ ] Search Console recebeu sitemap              — pendente
[ ] GTM/GA4 instalado                           — dataLayer pronto, scripts faltam
[ ] generate_lead validado                      — pendente
[ ] whatsapp_click validado                     — pendente
[ ] Turnstile ativo no formulário               — depende da secret key
[ ] /api/leads salva no D1 antes de Pipedrive   — código implementado, falta testar
[ ] Falha do Pipedrive cria outbox              — código implementado, falta testar
[ ] Lead real aparece no Pipedrive              — depende de OWNER_ID + LABEL_IDS
[ ] Conteúdo MVP revisado para OAB              — placeholder
[ ] Artigos reais sem noindex                   — placeholder
[ ] Lighthouse dentro do budget                 — pendente
```

Concluído: 8/24. Próximo passo crítico: preencher secrets restantes e conectar Git ao Pages.

---

## 7. Comandos de rotina

### Desenvolvimento

```bash
npm run dev
```

### Teste/validação

```bash
npm test
npm run check
npm run build
```

### Preview estático

```bash
npm run preview -- --host 127.0.0.1 --port 4321
```

### Smoke local

```bash
for path in / /busca-e-apreensao/ /diagnostico-inicial/ /robots.txt /sitemap-index.xml; do
  curl -s -o /dev/null -w "%{http_code} $path\n" "http://127.0.0.1:4321$path"
done
```

### Smoke produção

```bash
for path in / /busca-e-apreensao/ /diagnostico-inicial/ /robots.txt /sitemap-index.xml; do
  curl -s -o /dev/null -w "%{http_code} $path\n" "https://blog.vradvogados.com.br$path"
done
```

---

## 8. Riscos e mitigação

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Conteúdo genérico | Não ranqueia/não converte | Escrever por dor real e Search Console |
| Promessa jurídica indevida | Risco OAB/reputação | Checklist editorial e disclaimer |
| Lead perdido por falha CRM | Perda comercial | D1 primeiro + outbox retry |
| Spam em formulário | Lead lixo/custo | Turnstile + rate limit + validação server-side |
| Tracking quebrado | Não aprende nada | Validar DebugView antes de publicar tráfego |
| CSP bloqueando ferramenta | Analytics/Turnstile quebram | Ajustar `public/_headers` por ferramenta |
| Deploy sem Git | Sem rollback rastreável | Git obrigatório antes de produção |
| Conteúdo IA cru | Alucinação/compliance ruim | IA só gera draft; humano revisa |

---

## 9. Próxima ação recomendada

Próximo slice correto:

```text
Worker/Pages Function /api/leads + D1 schema + Turnstile mock + testes
```

Por quê:

- homepage e rotas já existem;
- build estático já passa;
- funil sem captura real é só vitrine;
- lead precisa ser salvo localmente antes de Pipedrive.

Ordem exata:

1. inicializar Git;
2. commitar scaffold atual;
3. criar D1 schema/migration;
4. criar schema de validação do payload;
5. escrever testes do payload;
6. implementar `/api/leads`;
7. mockar Turnstile em dev/test;
8. salvar lead em D1;
9. simular falha Pipedrive e gravar outbox;
10. rodar `npm test && npm run check && npm run build`;
11. subir preview Cloudflare.

Essa é a linha reta até deploy sem comprar complexidade cedo demais.
