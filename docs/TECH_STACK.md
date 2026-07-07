# Tech Stack — blog.vradvogados

## Decisão final

**Stack mínimo recomendado:** Astro + TypeScript + MDX Content Collections + Tailwind + Cloudflare Pages + Cloudflare Workers + Cloudflare D1 + Cloudflare Turnstile + Pipedrive API + OpenAI API + GA4/GTM + Search Console + Microsoft Clarity.

Take direto: **não vamos adicionar Supabase, WordPress, Zapier, Make, SERP API paga ou WhatsApp Business API no MVP.** Já temos OpenAI, Pipedrive e Cloudflare; então a stack certa é espremer esses três até sangrar custo zero.

---

## 1. Frontend

### Framework

**Astro**

Motivos:
- site content-driven: blog, hubs, checklists, páginas de conversão;
- HTML estático por padrão;
- zero JS por padrão;
- excelente para SEO/Core Web Vitals;
- Content Collections validam schema de MDX;
- ilhas interativas só onde precisa.

### Linguagem

**TypeScript**

Uso:
- schemas de conteúdo;
- componentes tipados;
- payloads de tracking;
- validação de formulário;
- integração Worker/Pipedrive/OpenAI.

### UI

**Tailwind CSS + componentes próprios**

Nada de biblioteca pesada. Texto, CTA e formulário não precisam de um caminhão de JS.

### Interatividade mínima

Client-side apenas para:
- diagnóstico inicial;
- checklists;
- busca interna;
- tracking de scroll/CTA;
- formulário/Turnstile.

---

## 2. Conteúdo/CMS

### MVP

**MDX em Git + Astro Content Collections.**

Motivos:
- custo zero;
- conteúdo versionado;
- revisão por PR;
- schema forte;
- rollback fácil;
- menos superfície de ataque.

### CMS visual — só se necessário

**Keystatic** como primeira opção se o time precisar editar pelo navegador.

Não usar WordPress como frontend. Se alguém exigir WordPress no futuro, ele vira **headless CMS**, e o frontend continua Astro. Botar o lead engine em plugin Jenga seria pedir para sofrer.

---

## 3. Hosting/infra

### DNS/CDN/deploy

**Cloudflare Pages**

Uso:
- `blog.vradvogados.com.br`;
- deploy preview por branch;
- build estático;
- cache/CDN;
- headers e redirects.

Evidência: Cloudflare Pages Free suporta 500 builds/mês, 100 domínios custom por projeto e 20.000 arquivos por site.

### Serverless/API

**Cloudflare Workers**

Uso:
- `/api/leads`;
- validação Turnstile;
- integração Pipedrive;
- ingestão de sinais de conteúdo;
- jobs agendados por Cron Trigger;
- retry de falhas via tabela `outbox` no D1.

Evidência: Workers Free inclui 100.000 requests/dia; em 30 dias isso dá ~3.000.000 requests/mês. Static assets em Cloudflare não entram nesse custo.

### Banco

**Cloudflare D1**

Uso:
- leads recebidos;
- eventos de lead;
- outbox/retry Pipedrive;
- sinais de conteúdo;
- briefs gerados por IA;
- logs de execução OpenAI.

Evidência: D1 Free inclui 5M rows read/dia, 100k rows written/dia e 5GB de storage. Em 30 dias: ~150M rows read e ~3M rows written. Para MVP jurídico, sobra.

### Anti-spam

**Cloudflare Turnstile**

Uso:
- formulário de diagnóstico;
- checklists com envio;
- endpoint de contato.

Evidência: plano Free tem até 20 widgets e desafios/verificações ilimitados; validação server-side é obrigatória via `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`.

---

## 4. CRM e leads

### CRM principal

**Pipedrive**

Fluxo:
1. visitante envia formulário;
2. Worker valida Turnstile;
3. Worker grava lead bruto no D1;
4. Worker procura/cria pessoa no Pipedrive;
5. Worker cria lead no Leads Inbox;
6. Worker adiciona nota com contexto, UTM, página, dor e documentos;
7. Worker cria atividade opcional para atendimento;
8. webhook do Pipedrive atualiza status local e alimenta métricas.

Endpoints previstos:
- `GET /api/v2/persons/search` — dedupe por e-mail/telefone;
- `POST /api/v2/persons` — criar pessoa;
- `PATCH /api/v2/persons/{id}` — atualizar pessoa;
- `POST /api/v1/leads` — criar lead;
- `PATCH /api/v1/leads/{id}` — atualizar lead;
- `POST /api/v1/notes` — anexar resumo/contexto;
- `POST /api/v2/activities` — tarefa de follow-up;
- `POST /api/v1/webhooks` — receber mudanças de lead/deal/person.

Regra: **Pipedrive é o CRM fonte da verdade; D1 é buffer, auditoria e inteligência.**

---

## 5. IA/content operations

### OpenAI API

Uso:
- clusterização de queries do Search Console;
- geração de brief estruturado;
- rascunho inicial de artigo;
- títulos/meta descriptions;
- FAQ;
- checagem editorial/OAB;
- sugestão de links internos.

APIs/padrões:
- **Responses API** para geração normal;
- **Structured Outputs** para JSON validável (`brief`, `article_draft`, `compliance_report`);
- **Batch API** para jobs assíncronos de menor custo;
- `store: false` quando o payload tiver dado sensível;
- sem publicação automática.

Evidência: OpenAI Batch API oferece 50% de desconto versus chamadas síncronas, pool separado de rate limit e conclusão em até 24h. É perfeito para conteúdo que não precisa sair em tempo real.

Modelo operacional mínimo:
- modelo barato para ideias/metas/FAQ;
- modelo melhor apenas para revisão final ou conteúdo sensível;
- prompts fixos e versionados;
- saída sempre em JSON schema;
- revisão humana antes de publicar.

---

## 6. Analytics/SEO

### GA4 + GTM

Eventos obrigatórios:
- `article_view`;
- `hub_view`;
- `scroll_50`, `scroll_75`, `scroll_90`;
- `cta_view`;
- `cta_click`;
- `whatsapp_click`;
- `form_start`;
- `form_submit`;
- `diagnostic_start`;
- `diagnostic_submit`;
- `checklist_open`;
- `checklist_complete`;
- `generate_lead`;
- `qualify_lead`;
- `disqualify_lead`;
- `working_lead`;
- `close_convert_lead`;
- `close_unconvert_lead`.

Evidência: GA4 recomenda `generate_lead`, `qualify_lead`, `disqualify_lead`, `working_lead`, `close_convert_lead` e `close_unconvert_lead` para funil de geração de leads.

### Google Search Console API

Uso:
- importar queries semanais;
- identificar páginas com impressão alta e CTR baixo;
- priorizar pauta por cluster;
- medir páginas com tráfego sem lead.

Endpoint:
- `POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query`

### Microsoft Clarity

Uso:
- heatmaps;
- gravações;
- rage/dead clicks;
- validação de CTA e formulário.

Evidência: Clarity declara plano gratuito sem limite de tráfego.

---

## 7. Fontes públicas de conteúdo/sinais

### Usar no MVP

- **Search Console**: demanda real do próprio domínio.
- **Pipedrive/WhatsApp/comercial**: dores reais que viram lead.
- **STJ RSS**: notícias e jurisprudência por feed.
- **BCB SGS JSON**: séries oficiais de juros/Selic/taxas médias.
- **CNJ DataJud API Pública**: metadados públicos do Judiciário, quando fizer sentido.

### Usar com cautela

- **Consumidor.gov API**: existe, mas exige credenciais/habilitação e tem janelas de disponibilidade. Não colocar no caminho crítico do MVP.

### Não usar no MVP

- Serasa/Experian pago;
- API de SERP paga;
- scraping agressivo de sites jurídicos;
- automação de WhatsApp via provedor pago;
- banco externo pago.

---

## 8. QA/testes

- Playwright para fluxos críticos:
  - abrir artigo;
  - abrir hub;
  - clicar CTA;
  - enviar diagnóstico com Turnstile mock;
  - validar dataLayer;
  - validar resposta do endpoint;
  - simular falha Pipedrive e retry.
- Lighthouse CI:
  - Performance >= 90;
  - SEO >= 95;
  - Accessibility >= 90;
  - LCP mobile < 2.5s;
  - CLS < 0.1;
  - INP < 200ms.
- Validação de conteúdo:
  - schema Content Collections;
  - link checker;
  - JSON-LD Rich Results Test;
  - checklist OAB.

---

## 9. Variáveis/segredos

```text
OPENAI_API_KEY
PIPEDRIVE_API_TOKEN
PIPEDRIVE_API_BASE
PIPEDRIVE_OWNER_ID
PIPEDRIVE_LEAD_LABEL_IDS
TURNSTILE_SECRET_KEY
GA_MEASUREMENT_ID
GA_API_SECRET              # opcional para eventos server-side/offline
GSC_CLIENT_EMAIL           # se usar service account
GSC_PRIVATE_KEY            # se usar service account
WEBHOOK_SHARED_SECRET      # valida webhook inbound
```

Nunca expor segredo no frontend. Secrets ficam no Cloudflare Workers.

---

## 10. Decisão final

```text
Frontend: Astro + TypeScript + MDX
Styling: Tailwind CSS
CMS: MDX Git-based; Keystatic opcional depois
Hosting: Cloudflare Pages
API: Cloudflare Workers
Banco: Cloudflare D1
Anti-spam: Cloudflare Turnstile
CRM: Pipedrive API
IA: OpenAI Responses + Structured Outputs + Batch
Analytics: GA4 + GTM
SEO/Search data: Search Console + Search Console API
UX analytics: Microsoft Clarity
Search interna: Pagefind
QA: Playwright + Lighthouse CI + link checker
```

Resultado: custo fixo novo **R$0 no MVP**, salvo consumo variável de OpenAI e eventual upgrade de Workers se o tráfego/lead explodir. Se explodir, ótimo — problema caro que a gente quer ter.
