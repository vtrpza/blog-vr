# SPECS — blog.vradvogados Lead Engine

## 0. Produto

`blog.vradvogados.com.br` é um motor de aquisição orgânica para a VR Advogados.

Ele captura pessoas pesquisando problemas bancários, entrega orientação informativa, organiza próximos passos e converte visitantes em leads qualificados para atendimento humano.

Não é portal de notícia. Não é blog institucional. Não é fábrica de post.

É um funil editorial por intenção.

---

## 1. Objetivos

### Objetivo primário

Gerar leads qualificados orgânicos para a VR Advogados.

### Objetivos secundários

- Capturar tráfego long-tail em direito bancário.
- Aumentar autoridade temática da marca.
- Reduzir dúvidas repetidas no atendimento.
- Preparar leads com documentos certos.
- Identificar clusters comerciais vencedores.

---

## 2. Personas e intenções

### Persona 1 — Consumidor com veículo financiado

Busca:
- busca e apreensão;
- parcelas atrasadas;
- veículo apreendido;
- oficial de justiça;
- entrega amigável;
- juros do financiamento.

Conversão esperada:
- WhatsApp urgente;
- checklist de documentos;
- diagnóstico inicial.

### Persona 2 — Pessoa física endividada

Busca:
- juros abusivos;
- superendividamento;
- negativação indevida;
- cobrança indevida;
- empréstimo/cartão/cheque especial.

Conversão esperada:
- formulário;
- diagnóstico;
- análise de contrato.

### Persona 3 — Empresa endividada

Busca:
- execução bancária;
- CCB;
- capital de giro;
- bloqueio judicial;
- avalista;
- renegociação PJ.

Conversão esperada:
- contato qualificado;
- agendamento;
- envio de documentos.

---

## 3. Arquitetura de informação

### Rotas principais

```text
/
/busca-e-apreensao/
/juros-abusivos/
/dividas-pj/
/superendividamento/
/cobrancas-indevidas/
/fraudes-bancarias/
/glossario-bancario/
/diagnostico-inicial/
/checklist-busca-e-apreensao/
/checklist-juros-abusivos/
/checklist-divida-pj/
/sobre-o-blog/
/privacidade/
```

### Estrutura por cluster

Cada cluster deve ter:
- 1 hub;
- 4–8 artigos iniciais;
- 1 checklist ou diagnóstico contextual;
- CTA específico;
- links para páginas comerciais do domínio principal quando fizer sentido.

---

## 4. MVP de conteúdo

### Busca e apreensão

```text
/busca-e-apreensao-veiculo/
/quantas-parcelas-atrasadas-busca-e-apreensao/
/oficial-de-justica-busca-e-apreensao-o-que-fazer/
/veiculo-de-trabalho-pode-ser-apreendido/
/como-recuperar-veiculo-apreendido/
/entrega-amigavel-quita-divida/
```

### Juros abusivos

```text
/juros-abusivos-financiamento-veiculo/
/taxa-media-bacen-como-comparar/
/seguro-prestamista-e-obrigatorio/
/tarifas-bancarias-financiamento/
/acao-revisional-quando-vale-a-pena/
/parcelas-do-financiamento-nao-baixam/
```

### Dívidas PJ

```text
/execucao-bancaria-empresa-o-que-fazer/
/capital-de-giro-juros-abusivos/
/bloqueio-judicial-conta-pj/
/avalista-divida-empresa-riscos/
/renegociacao-divida-pj-com-banco/
/ccb-bancaria-empresa-cuidados/
```

### Superendividamento

```text
/lei-do-superendividamento-como-funciona/
/quais-dividas-entram-no-superendividamento/
/minimo-existencial-dividas/
/banco-e-obrigado-a-renegociar-divida/
```

### Cobranças/fraudes

```text
/nome-negativado-indevidamente-o-que-fazer/
/cobranca-indevida-banco-como-resolver/
/emprestimo-nao-contratado/
/golpe-pix-responsabilidade-do-banco/
```

---

## 5. Templates funcionais

### 5.1 Homepage

Blocos obrigatórios:

1. Hero:
   - promessa informativa;
   - CTA para diagnóstico;
   - CTA secundário para escolher problema.
2. Selector de dor:
   - cards por problema.
3. Hubs principais.
4. Ferramentas rápidas.
5. Artigos essenciais, não “últimos posts”.
6. CTA final.

Acceptance criteria:
- usuário consegue chegar a qualquer hub em até 1 clique;
- CTA principal aparece acima da dobra;
- não há promessas de resultado;
- eventos `cta_view` e `cta_click` disparam.

### 5.2 Hub

Blocos obrigatórios:

1. H1 do cluster.
2. Resposta curta: “se este é seu problema, comece por aqui”.
3. Checklist rápido.
4. Guias essenciais ordenados por urgência.
5. FAQ.
6. CTA contextual.

Acceptance criteria:
- cada hub linka para todos os artigos do cluster;
- cada hub tem pelo menos 1 CTA;
- cada hub possui `BreadcrumbList`.

### 5.3 Artigo

Estrutura obrigatória:

```markdown
# H1

Resposta curta em até 4 linhas.

## Em resumo
## Quando isso acontece
## O que pode ser avaliado
## Documentos necessários
## Erros comuns
## Próximo passo seguro
## Perguntas frequentes
## CTA contextual
```

Acceptance criteria:
- mínimo 900 palavras, salvo FAQ/glossário;
- resposta curta no início;
- pelo menos 3 links internos;
- CTA contextual;
- disclaimer informativo;
- sem promessa de resultado.

### 5.4 Checklist

Funcionalidades:
- lista marcável no browser;
- opção “enviar meus dados para análise”;
- não exigir login;
- salvar apenas após consentimento.

Acceptance criteria:
- checklist funciona sem JS crítico quando possível;
- conversão dispara `checklist_complete` e/ou `generate_lead`.

### 5.5 Diagnóstico inicial

Campos mínimos:

```text
problem_type
bank_or_financial_institution
person_type: PF/PJ
has_lawsuit
has_vehicle_seized
contract_available
approx_debt_value_range
name
phone
email optional
message
lgpd_consent
utm_source
utm_medium
utm_campaign
landing_page
referrer
```

Acceptance criteria:
- não dá parecer jurídico automático;
- confirma recebimento;
- grava lead no Cloudflare D1 antes de chamar qualquer serviço externo;
- cria/atualiza pessoa, lead e nota contextual no Pipedrive;
- em caso de falha do Pipedrive, registra item em `pipedrive_outbox` para retry;
- dispara `generate_lead`;
- bloqueia spam com Turnstile.

---

## 6. Content model

### Collection: `articles`

Campos:

```ts
slug: string
status: 'draft' | 'review' | 'published' | 'archived'
title: string
seoTitle: string
metaDescription: string
cluster: 'busca-e-apreensao' | 'juros-abusivos' | 'dividas-pj' | 'superendividamento' | 'cobrancas-indevidas' | 'fraudes-bancarias'
intent: 'informational' | 'urgent' | 'commercial-investigation' | 'comparison' | 'checklist'
author: string
reviewedBy?: string
publishedAt: date
updatedAt?: date
heroImage?: image
imageAlt?: string
summary: string
primaryKeyword: string
secondaryKeywords: string[]
relatedArticles: string[]
ctaType: 'whatsapp' | 'diagnostic' | 'checklist' | 'form'
requiredDocuments: string[]
sources: { label: string; url: string }[]
oabRisk: 'low' | 'medium' | 'high'
noindex: boolean
canonical?: string
```

### Collection: `hubs`

```ts
slug: string
title: string
seoTitle: string
metaDescription: string
cluster: string
summary: string
priorityArticles: string[]
faq: { question: string; answer: string }[]
ctaType: string
```

### Collection: `glossary`

```ts
term: string
slug: string
definition: string
cluster: string
relatedArticles: string[]
```

### Collection: `briefs`

```ts
theme: string
cluster: string
searchIntent: string
userPain: string
mainQuestion: string
shortAnswer: string
keywords: string[]
internalLinks: string[]
recommendedCta: string
requiredDocuments: string[]
officialSources: string[]
oabRisk: string
conversionHypothesis: string
status: 'idea' | 'approved' | 'written' | 'published'
```

---

## 7. Lead model

### Table: `leads`

D1/SQLite style, com Pipedrive IDs para reconciliação.

```sql
id text primary key
created_at text not null
updated_at text null
name text not null
phone text not null
email text null
person_type text null
problem_type text not null
bank_or_financial_institution text null
approx_debt_value_range text null
has_lawsuit integer null
has_vehicle_seized integer null
contract_available integer null
message text null
landing_page text not null
source_article text null
cluster text null
utm_source text null
utm_medium text null
utm_campaign text null
utm_content text null
referrer text null
user_agent text null
ip_hash text null
lgpd_consent integer not null
pipedrive_person_id integer null
pipedrive_lead_id text null
pipedrive_deal_id integer null
pipedrive_status text null
status text not null default 'new'
qualified integer null
disqualification_reason text null
```

### Table: `lead_events`

```sql
id text primary key
lead_id text references leads(id)
created_at text not null
event_name text not null
payload_json text null
```

### Table: `pipedrive_outbox`

Fila simples para não perder lead se o Pipedrive falhar.

```sql
id text primary key
lead_id text references leads(id)
created_at text not null
next_attempt_at text not null
attempts integer not null default 0
action text not null
payload_json text not null
last_error text null
status text not null default 'pending'
```

---

## 8. Tracking spec

### dataLayer event format

```js
window.dataLayer.push({
  event: 'cta_click',
  page_type: 'article',
  cluster: 'busca-e-apreensao',
  intent: 'urgent',
  cta_type: 'whatsapp',
  cta_position: 'inline_after_documents',
  article_slug: 'oficial-de-justica-busca-e-apreensao-o-que-fazer'
})
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

### Conversões GA4

Marcar como conversão:
- `generate_lead`
- `whatsapp_click`
- `diagnostic_submit`
- `form_submit`

---

## 9. SEO spec

### Global

- sitemap.xml automático;
- robots.txt;
- canonical em todas as páginas;
- OpenGraph;
- Twitter cards;
- favicon e app icons;
- página 404 útil;
- redirects versionados.

### Schema

- Artigo: `BlogPosting`.
- Hub: `CollectionPage` + `BreadcrumbList`.
- FAQ visível: `FAQPage`.
- Breadcrumb global: `BreadcrumbList`.
- Organização/serviço jurídico: usar com sobriedade e consistência.

### URL rules

- lowercase;
- sem data na URL;
- sem acento;
- sem stopwords desnecessárias;
- slug curto e específico.

Bom:

```text
/oficial-de-justica-busca-e-apreensao-o-que-fazer/
```

Ruim:

```text
/ultimas-noticias/confira-agora-mesmo-tudo-sobre-como-funciona-a-busca-e-apreensao-de-veiculos-em-2026/
```

---

## 10. Compliance OAB/editorial

### Permitido

- conteúdo informativo;
- explicação técnica;
- checklists;
- identificação profissional verdadeira;
- CTA sóbrio para análise;
- coleta de documentos/dados;
- chatbot/diagnóstico inicial sem parecer automático.

### Proibido

- promessa de resultado;
- comparação com outros escritórios;
- autoengrandecimento;
- valores/honorários/descontos como isca;
- divulgação de caso concreto patrocinado;
- “garantimos”, “recupere com certeza”, “limpe seu nome agora”.

### Disclaimer padrão

```text
Este conteúdo é informativo e não substitui a análise individual de um advogado. Cada caso depende dos documentos, valores, prazos e fase da cobrança ou processo.
```

---

## 11. Alimentação do conteúdo

### Entradas semanais

- Search Console queries;
- perguntas de WhatsApp/formulário;
- objeções do comercial;
- dados Bacen/STJ/CNJ/Procon/Serasa;
- páginas com tráfego e baixa conversão;
- páginas com impressão e baixo CTR.

### Regra de priorização

```text
70% clusters comerciais fortes
20% long-tail SEO
10% notícias/oportunidades
```

Clusters prioritários:
1. busca e apreensão;
2. juros abusivos/revisional;
3. dívidas PJ;
4. superendividamento;
5. cobranças indevidas;
6. fraudes bancárias.

---

## 12. Non-functional requirements

### Performance

- LCP mobile < 2.5s;
- CLS < 0.1;
- INP < 200ms;
- Lighthouse Performance >= 90;
- SEO >= 95;
- Accessibility >= 90.

### Segurança

- HTTPS obrigatório;
- security headers;
- Turnstile em forms;
- rate limit no endpoint de lead;
- validação server-side;
- nenhum segredo no frontend;
- backups/export de leads.

### LGPD

- consentimento explícito;
- link para privacidade;
- armazenar finalidade do lead;
- possibilidade de remoção mediante solicitação;
- não coletar documento sensível no MVP sem política clara.

---

## 13. Launch checklist

### Antes de publicar

- [ ] DNS `blog.vradvogados.com.br` configurado.
- [ ] Cloudflare Pages conectado.
- [ ] GA4/GTM instalado.
- [ ] Search Console verificado.
- [ ] Clarity instalado.
- [ ] Sitemap gerado.
- [ ] Robots revisado.
- [ ] Formulário salva lead.
- [ ] Turnstile funcionando.
- [ ] Eventos aparecem no DebugView.
- [ ] Rich Results Test sem erro crítico.
- [ ] Lighthouse dentro do budget.
- [ ] Conteúdo revisado para OAB.
- [ ] CTAs sem promessa.

### MVP pronto quando existir

- [ ] homepage;
- [ ] 5 hubs;
- [ ] 20 artigos;
- [ ] 3 checklists;
- [ ] diagnóstico inicial;
- [ ] glossário;
- [ ] privacidade;
- [ ] tracking validado;
- [ ] lead salvo no D1 e criado no Pipedrive com nota contextual.

---

## 14. Definition of done

O produto está pronto para lançamento quando:

1. todas as rotas MVP carregam rápido;
2. conteúdo tem schema válido;
3. formulário gera lead real;
4. WhatsApp carrega contexto/UTM;
5. GA4 registra funil;
6. Search Console recebe sitemap;
7. checklist OAB passa;
8. primeiro relatório semanal pode ser produzido.

---

## 15. Roadmap técnico

### Sprint 1 — Fundação

- criar projeto Astro;
- configurar Tailwind;
- configurar Content Collections;
- criar layouts base;
- criar sitemap/robots;
- configurar Cloudflare Pages.

### Sprint 2 — Templates

- homepage;
- hub template;
- article template;
- checklist template;
- diagnostic form;
- schema components.

### Sprint 3 — Conteúdo MVP

- inserir hubs;
- inserir 20 artigos;
- inserir checklists;
- inserir glossário;
- revisar links internos.

### Sprint 4 — Tracking/lead

- configurar GTM/GA4;
- implementar dataLayer;
- criar Worker lead endpoint;
- salvar no Cloudflare D1;
- integrar Pipedrive `Person` + `Lead` + `Note` + `Activity` opcional;
- implementar `pipedrive_outbox` e retry por Cron Trigger;
- validar DebugView.

### Sprint 5 — QA/launch

- Playwright smoke tests;
- Lighthouse CI;
- link checker;
- Rich Results Test;
- deploy produção;
- submissão sitemap.

---

## 16. Decisão final

Construir com Astro, conteúdo estruturado, formulários próprios, Cloudflare D1 como buffer, Pipedrive como CRM e tracking pesado.

O ativo valioso não é “ter blog”. O ativo é saber exatamente qual dor atrai, qual página segura, qual CTA converte e qual cluster vira cliente.