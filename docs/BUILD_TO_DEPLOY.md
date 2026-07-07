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

Arquivos principais já existentes:

```text
package.json
package-lock.json
tsconfig.json
vitest.config.ts
astro.config.mjs
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

Dependências instaladas:

```text
astro
@astrojs/check
@astrojs/mdx
@astrojs/sitemap
@tailwindcss/vite
tailwindcss
typescript
vitest
```

### 3.2 Content Collections configuradas

Arquivo:

```text
src/content.config.ts
```

Collections criadas:

```text
articles
hubs
glossary
briefs
```

Conteúdo inicial de validação:

```text
src/content/articles/busca-e-apreensao-veiculo.mdx
src/content/hubs/busca-e-apreensao.json
src/content/glossary/alienacao-fiduciaria.json
src/content/briefs/busca-e-apreensao-veiculo.json
```

### 3.3 Taxonomia e contrato do lead engine

Arquivo:

```text
src/lib/taxonomy.ts
```

Criado:

- 5 hubs comerciais;
- 26 rotas iniciais de artigos;
- 3 checklists;
- CTAs por cluster;
- eventos obrigatórios de tracking;
- helpers para buscar cluster, artigo e checklist.

Hubs atuais:

```text
/busca-e-apreensao/
/juros-abusivos/
/dividas-pj/
/superendividamento/
/cobrancas-indevidas/
```

Checklists atuais:

```text
/checklist-busca-e-apreensao/
/checklist-juros-abusivos/
/checklist-divida-pj/
```

### 3.4 Teste TDD do contrato

Arquivo:

```text
tests/taxonomy.test.ts
```

Cobre:

- existência dos 5 hubs planejados;
- rotas lowercase/canônicas;
- 26 artigos vinculados a clusters válidos;
- ausência de copy proibida óbvia em títulos;
- eventos mínimos de tracking.

Fluxo executado:

```bash
npm test
```

Resultado verificado:

```text
1 test file passed
3 tests passed
```

### 3.5 Layout, componentes e páginas

Layouts/componentes:

```text
src/layouts/BaseLayout.astro
src/components/SiteHeader.astro
src/components/LeadCta.astro
src/components/ClusterCard.astro
src/components/Disclaimer.astro
src/lib/seo.ts
src/styles/global.css
```

Páginas:

```text
src/pages/index.astro
src/pages/[...slug].astro
src/pages/diagnostico-inicial.astro
src/pages/sobre-o-blog.astro
src/pages/privacidade.astro
src/pages/robots.txt.ts
```

Implementado:

- homepage orientada por dor;
- hubs gerados a partir da taxonomia;
- artigos placeholder estruturados;
- checklists marcáveis;
- formulário de diagnóstico inicial estático;
- disclaimer OAB;
- JSON-LD básico;
- canonical;
- OpenGraph/Twitter card;
- tracking base com `window.dataLayer`;
- eventos `cta_view`, `cta_click`, `whatsapp_click`, scroll e links internos.

### 3.6 Segurança e deploy estático

Arquivos:

```text
public/_headers
public/_redirects
```

Inclui:

- `X-Frame-Options: DENY`;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- CSP inicial;
- redirect `/diagnostico` → `/diagnostico-inicial/`.

### 3.7 Build verificado

Comandos executados e aprovados:

```bash
npm test
npm run check
npm run build
```

Resultados verificados:

```text
npm test      -> 3 tests passed
npm run check -> 0 errors, 0 warnings, 0 hints
npm run build -> 38 page(s) built, sitemap-index.xml created
```

Também foi executado preview local:

```bash
npm run preview -- --host 127.0.0.1 --port 4321
```

Rotas testadas com HTTP 200:

```text
/
/busca-e-apreensao/
/busca-e-apreensao-veiculo/
/checklist-busca-e-apreensao/
/diagnostico-inicial/
/robots.txt
/sitemap-index.xml
```

Checks de HTML encontraram:

```text
dataLayer
Começar diagnóstico inicial
Funil editorial por intenção
BlogPosting
Este conteúdo é informativo
Próximo passo seguro
```

### 3.8 Estado de versionamento

O diretório atual ainda **não é um repositório Git**.

Comando usado:

```bash
git status --short --branch
```

Resultado:

```text
fatal: not a git repository
```

Antes de qualquer deploy sério, inicializar Git, commitar e conectar o repo à Cloudflare Pages. Deploy sem Git é deploy de cowboy; às vezes funciona, quase sempre vira arqueologia.

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

## 5. Próximos passos até deploy

## Fase 1 — Versionamento e repositório

### Objetivo

Transformar o diretório em repo Git e preparar deploy rastreável.

### Passos

```bash
cd /home/virto/blog-vr
git init
git add .
git commit -m "feat: scaffold astro lead engine"
```

Criar repo no GitHub/GitLab/Bitbucket e conectar:

```bash
git remote add origin <REPO_URL>
git branch -M main
git push -u origin main
```

### Critério de aceite

```bash
git status --short --branch
```

Deve mostrar branch limpa.

---

## Fase 2 — Lead capture backend

### Objetivo

Criar `/api/leads` com validação server-side, Turnstile, D1 primeiro e outbox para Pipedrive.

### Arquivos a criar

```text
wrangler.toml
migrations/0001_initial.sql
functions/api/leads.ts
functions/api/health.ts
src/lib/lead-schema.ts
tests/lead-schema.test.ts
```

### D1 schema mínimo

Usar D1/SQLite:

```sql
create table leads (
  id text primary key,
  created_at text not null,
  updated_at text,
  name text not null,
  phone text not null,
  email text,
  person_type text,
  problem_type text not null,
  bank_or_financial_institution text,
  approx_debt_value_range text,
  has_lawsuit integer,
  has_vehicle_seized integer,
  contract_available integer,
  message text,
  landing_page text not null,
  source_article text,
  cluster text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  referrer text,
  user_agent text,
  ip_hash text,
  lgpd_consent integer not null,
  pipedrive_person_id integer,
  pipedrive_lead_id text,
  pipedrive_deal_id integer,
  pipedrive_status text,
  status text not null default 'new',
  qualified integer,
  disqualification_reason text
);

create index leads_created_at_idx on leads(created_at);
create index leads_phone_idx on leads(phone);
create index leads_pipedrive_lead_idx on leads(pipedrive_lead_id);

create table lead_events (
  id text primary key,
  lead_id text not null references leads(id),
  created_at text not null,
  event_name text not null,
  payload_json text
);

create table pipedrive_outbox (
  id text primary key,
  lead_id text references leads(id),
  created_at text not null,
  next_attempt_at text not null,
  attempts integer not null default 0,
  action text not null,
  payload_json text not null,
  last_error text,
  status text not null default 'pending'
);
```

### Regras obrigatórias do endpoint

`POST /api/leads` deve:

1. aceitar apenas JSON ou form data esperado;
2. validar `lgpd_consent`;
3. validar Turnstile server-side;
4. normalizar telefone;
5. rejeitar payload inválido com `400`;
6. salvar no D1 antes de chamar Pipedrive;
7. criar evento `generate_lead`/`lead_created` local;
8. chamar Pipedrive;
9. se Pipedrive falhar, criar `pipedrive_outbox`;
10. nunca retornar parecer jurídico.

### Variáveis/secrets

```text
TURNSTILE_SECRET_KEY
PIPEDRIVE_API_TOKEN
PIPEDRIVE_API_BASE
PIPEDRIVE_OWNER_ID
PIPEDRIVE_LEAD_LABEL_IDS
WEBHOOK_SHARED_SECRET
```

### Testes

```bash
npm test
npm run check
npm run build
```

Depois testar com `wrangler pages dev`:

```bash
npx wrangler pages dev dist --d1 BLOG_VR_DB=<D1_DATABASE_ID>
```

Critérios:

- payload sem LGPD retorna `400`;
- payload sem Turnstile retorna `400` ou `403`;
- payload válido salva no D1;
- falha simulada do Pipedrive cria outbox.

---

## Fase 3 — Pipedrive

### Objetivo

Sincronizar lead com CRM sem perder dado local.

### Fluxo

```text
/api/leads
  -> D1 insert lead
  -> Pipedrive persons search
  -> create/update person
  -> create lead
  -> create note
  -> update D1 ids/status
```

### Endpoints previstos

```text
GET   /api/v2/persons/search
POST  /api/v2/persons
PATCH /api/v2/persons/{id}
POST  /api/v1/leads
PATCH /api/v1/leads/{id}
POST  /api/v1/notes
POST  /api/v2/activities
```

### Nota contextual mínima

A nota no Pipedrive deve conter:

```text
Origem: URL da página
Problema: problem_type / cluster
UTM: source / medium / campaign / content
Mensagem do usuário
Documentos disponíveis
Flags: processo, veículo apreendido, contrato disponível
Request/lead id local
```

### Critérios

- lead aparece no Leads Inbox;
- pessoa deduplicada por telefone/e-mail;
- nota contém contexto da página;
- IDs voltam para D1;
- falha externa não perde lead.

---

## Fase 4 — Retry/outbox e cron

### Objetivo

Reprocessar falhas de Pipedrive.

### Arquivos sugeridos

```text
functions/api/admin/retry-outbox.ts
functions/_scheduled.ts
src/lib/outbox.ts
tests/outbox.test.ts
```

### Regras

- selecionar outbox `pending` com `next_attempt_at <= now`;
- usar backoff por tentativas;
- registrar `last_error`;
- marcar `done` ao sincronizar;
- proteger endpoint admin por segredo.

### Cron sugerido

```text
0 */6 * * *  retry Pipedrive outbox
```

---

## Fase 5 — Tracking real

### Objetivo

Conectar dataLayer existente a GTM/GA4 e validar DebugView.

### Variáveis públicas sugeridas

```text
PUBLIC_GTM_ID
PUBLIC_GA_MEASUREMENT_ID
PUBLIC_CLARITY_ID
PUBLIC_TURNSTILE_SITE_KEY
```

### Eventos obrigatórios

```text
article_view
hub_view
scroll_50
scroll_75
scroll_90
cta_view
cta_click
whatsapp_click
form_start
form_submit
diagnostic_start
diagnostic_submit
checklist_open
checklist_complete
internal_link_click
search
select_content
generate_lead
qualify_lead
disqualify_lead
working_lead
close_convert_lead
close_unconvert_lead
```

### Critérios

- `generate_lead` aparece no GA4 DebugView;
- `whatsapp_click` aparece;
- scroll e CTA aparecem;
- Clarity registra sessão;
- CSP permite scripts necessários e bloqueia o resto.

---

## Fase 6 — Conteúdo MVP real

### Objetivo

Substituir placeholders por conteúdo publicável e revisado.

### Escopo mínimo

```text
5 hubs
20 artigos iniciais
3 checklists
glossário inicial
privacidade
sobre o blog
```

### Regras editoriais

Cada artigo precisa ter:

- resposta curta no início;
- mínimo 900 palavras, salvo FAQ/glossário;
- pelo menos 3 links internos;
- CTA contextual;
- fontes oficiais quando fizer sentido;
- disclaimer informativo;
- sem promessa de resultado;
- `noindex: false` apenas após revisão.

### Checklist OAB

Bloquear publicação se houver:

```text
garantimos
recupere com certeza
limpe seu nome agora
melhor escritório
resultado garantido
honorários/desconto como isca
urgência artificial agressiva
```

---

## Fase 7 — Cloudflare Pages deploy

### Objetivo

Publicar o site em `blog.vradvogados.com.br`.

### Método recomendado: Git conectado

1. Subir repo para GitHub/GitLab.
2. Cloudflare Dashboard → Workers & Pages → Create application → Pages.
3. Conectar repo.
4. Configurar build:

```text
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 22
```

5. Configurar variáveis de ambiente no Pages Project.
6. Configurar D1 binding quando backend estiver pronto.
7. Deploy preview por branch.
8. Deploy produção em `main`.

### Método manual opcional

Usar só para preview ou emergência:

```bash
npm run build
npx wrangler pages deploy dist --project-name blog-vradvogados
```

Melhor não depender disso para rotina; sem Git, deploy vira “quem subiu isso?” em três semanas.

### Custom domain

No projeto Pages:

```text
Custom domain: blog.vradvogados.com.br
```

DNS esperado:

```text
CNAME blog -> <pages-project>.pages.dev
Proxy: enabled
SSL/TLS: Full ou Full strict
```

### Critérios de aceite do deploy

Ao vivo:

```bash
curl -I https://blog.vradvogados.com.br/
curl -I https://blog.vradvogados.com.br/sitemap-index.xml
curl -I https://blog.vradvogados.com.br/robots.txt
```

Esperado:

```text
HTTP 200
HTTPS válido
headers de segurança presentes
sitemap acessível
robots aponta para sitemap
```

---

## Fase 8 — Pós-deploy SEO/analytics

### Search Console

1. Adicionar propriedade `blog.vradvogados.com.br`.
2. Verificar domínio/subdomínio.
3. Enviar sitemap:

```text
https://blog.vradvogados.com.br/sitemap-index.xml
```

### GA4/GTM

1. Confirmar container carregando.
2. Confirmar DebugView.
3. Marcar conversões:

```text
generate_lead
whatsapp_click
diagnostic_submit
form_submit
```

### Clarity

1. Instalar script via config/componente.
2. Confirmar sessão gravada.
3. Validar se não degrada Core Web Vitals.

### Lighthouse

Rodar contra produção:

```bash
npx lighthouse https://blog.vradvogados.com.br/ --view
```

Budgets:

```text
Performance >= 90
SEO >= 95
Accessibility >= 90
LCP mobile < 2.5s
CLS < 0.1
INP < 200ms
```

---

## 6. Gate de lançamento

O MVP só está pronto para produção quando todos passarem:

```text
[ ] Repo Git limpo e remoto configurado
[ ] npm test passa
[ ] npm run check passa
[ ] npm run build passa
[ ] Preview local responde rotas críticas
[ ] Cloudflare Pages conectado ao repo
[ ] Custom domain funcionando em HTTPS
[ ] Headers e redirects publicados
[ ] Sitemap publicado
[ ] Search Console recebeu sitemap
[ ] GTM/GA4 instalado
[ ] generate_lead validado
[ ] whatsapp_click validado
[ ] Turnstile ativo no formulário
[ ] /api/leads salva no D1 antes de Pipedrive
[ ] Falha do Pipedrive cria outbox
[ ] Lead real aparece no Pipedrive com nota contextual
[ ] Conteúdo MVP revisado para OAB
[ ] Artigos reais sem noindex
[ ] Lighthouse dentro do budget
```

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
