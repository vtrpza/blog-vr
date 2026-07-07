# Research Notes — blog.vradvogados

## Objetivo da pesquisa

Definir como construir `blog.vradvogados.com.br` como motor de aquisição orgânica para leads jurídicos bancários, com base em evidência técnica, SEO, performance, tracking, compliance OAB e custo mínimo.

Decisão central: **usar o que já existe — OpenAI, Pipedrive e Cloudflare — e não comprar stack nova antes de provar lead.**

---

## 1. Evidências de custo/infra

### Cloudflare Pages

Fonte: https://developers.cloudflare.com/pages/platform/limits/

Achados:
- Free plan permite 500 builds/mês.
- Free plan permite 100 custom domains por projeto.
- Free plan permite 20.000 arquivos por site.
- Assets estáticos são servidos pela rede global da Cloudflare.

Implicação:
- `blog.vradvogados.com.br` cabe no Cloudflare Pages Free no MVP.
- Não precisamos de Vercel/Netlify pago.
- Astro estático combina melhor com Pages do que WordPress pluginado.

---

### Cloudflare Workers

Fonte: https://developers.cloudflare.com/workers/platform/pricing/

Achados:
- Workers Free inclui 100.000 requests/dia.
- Workers Paid começa em US$5/mês se precisar escalar.
- Static assets são gratuitos/ilimitados; só requests que batem no Worker contam.
- Workers podem chamar APIs externas e integrar Pages/D1/Turnstile.

Cálculo verificado:
```text
100.000 requests/dia ≈ 3.000.000 requests/mês em 30 dias
```

Implicação:
- Forms, webhooks e crons cabem no Free no MVP.
- Upgrade só faz sentido depois que tráfego/lead justificar.

---

### Cloudflare D1

Fonte: https://developers.cloudflare.com/d1/platform/pricing/

Achados:
- Workers Free inclui D1 para prototipar/experimentar.
- Free: 5M rows read/dia.
- Free: 100k rows written/dia.
- Free: 5GB storage.
- Não cobra egress.
- Escala a zero; sem pagar capacidade parada.

Cálculo verificado:
```text
5M reads/dia ≈ 150M reads/mês
100k writes/dia ≈ 3M writes/mês
```

Implicação:
- D1 substitui Supabase no MVP.
- D1 deve guardar leads, eventos, outbox, sinais de conteúdo e logs de IA.
- Pipedrive continua fonte da verdade comercial; D1 é buffer/auditoria/inteligência.

---

### Cloudflare Turnstile

Fontes:
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://developers.cloudflare.com/turnstile/plans/

Achados:
- Validação server-side é obrigatória.
- Siteverify API: `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- Token expira em 5 minutos.
- Token é single-use.
- Free plan: até 20 widgets e verificações/challenges ilimitados.

Implicação:
- Turnstile é a escolha óbvia para anti-spam no formulário.
- Não precisamos de reCAPTCHA pago/chato.
- Nunca validar token só no frontend.

---

## 2. Evidências de CRM/Pipedrive

### Leads API

Fonte: https://developers.pipedrive.com/docs/api/v1/Leads

Achados:
- Leads ficam no Leads Inbox antes de arquivar ou converter em deal.
- Todo lead precisa de `title` e estar ligado a uma pessoa ou organização.
- Endpoint para criar lead: `POST /api/v1/leads`.
- Endpoint para buscar leads: `GET /api/v1/leads`.
- Endpoint para atualizar lead: `PATCH /api/v1/leads/{id}`.

Implicação:
- O fluxo deve buscar/criar Person antes de criar Lead.
- O blog deve enviar lead com title, label, canal, origem, UTM e nota contextual.

---

### Persons API

Fonte: https://developers.pipedrive.com/docs/api/v1/Persons

Achados:
- `GET /api/v2/persons/search` existe para busca.
- `POST /api/v2/persons` cria pessoa.
- `PATCH /api/v2/persons/{id}` atualiza pessoa.

Implicação:
- Dedupe por telefone/e-mail antes de criar lead.
- Evita bagunçar CRM com pessoa duplicada.

---

### Notes API

Fonte: https://developers.pipedrive.com/docs/api/v1/Notes

Achados:
- Notes são textos HTML associados a deals, persons e organizations; a documentação também permite filtro por `lead_id`.
- Tamanho máximo aproximado: 100.000 caracteres/100KB por nota.
- Endpoint: `POST /api/v1/notes`.

Implicação:
- Contexto do formulário deve ir como nota no Pipedrive.
- Nota deve incluir página, UTM, dor, documentos, mensagem, checklist e request_id.

---

### Activities API

Fonte: https://developers.pipedrive.com/docs/api/v1/Activities

Achados:
- Activities são tarefas/eventos/calendário.
- Podem ser associadas a lead, person e organization.
- Endpoint para criar: `POST /api/v2/activities`.

Implicação:
- Pode criar follow-up automático só para leads urgentes/qualificados.
- Não precisa de ferramenta externa para lembrar comercial.

---

### Webhooks API

Fonte: https://developers.pipedrive.com/docs/api/v1/Webhooks

Achados:
- `POST /api/v1/webhooks` cria webhook.
- Requer `subscription_url` pública.
- Usa `event_action` + `event_object`.
- Versão 2.0 é default desde 2025-03-17.

Implicação:
- Webhook do Pipedrive atualiza D1 quando lead vira qualificado, em atendimento, convertido ou perdido.
- Isso fecha loop de qualidade de lead por artigo/cluster.

---

## 3. Evidências de OpenAI

### Responses API

Fonte: https://developers.openai.com/api/docs/guides/migrate-to-responses

Achados:
- OpenAI recomenda migração gradual para Responses API.
- Responses usa `/v1/responses`.
- Structured outputs em Responses usam `text.format`.
- Assistants API está sendo migrada/deprecada em favor da Responses API.

Implicação:
- Usar Responses API para briefs/drafts/revisões.
- Evitar construir em API legada.

---

### Structured Outputs

Fonte: https://developers.openai.com/api/docs/guides/structured-outputs

Achados:
- Permite saída JSON controlada por schema.
- Requer tratar casos de resposta incompleta, recusa e content filter.

Implicação:
- Todo brief/draft/revisão OAB deve sair em schema validável.
- Sem JSON livre bagunçado.

---

### Batch API

Fonte: https://developers.openai.com/api/docs/guides/batch

Achados:
- Batch API reduz custo em 50% versus APIs síncronas.
- Tem pool separado de rate limit.
- Completa em até 24h.
- Suporta `/v1/responses`, `/v1/chat/completions`, `/v1/embeddings`, etc.

Implicação:
- Usar Batch para briefs e drafts não urgentes.
- Não usar chamada síncrona cara para lote de conteúdo semanal.

---

## 4. Evidências de analytics/SEO

### GA4 eventos recomendados

Fonte: https://support.google.com/analytics/answer/9267735?hl=pt-BR

Achados:
- GA4 recomenda eventos para geração de leads:
  - `generate_lead`;
  - `qualify_lead`;
  - `disqualify_lead`;
  - `working_lead`;
  - `close_convert_lead`;
  - `close_unconvert_lead`.
- `generate_lead` deve disparar quando usuário envia formulário ou solicita informações.

Implicação:
- Tracking precisa ir além de pageview.
- Pipedrive webhook deve fechar ciclo de lead qualificado/convertido.

---

### Search Console API

Fonte: https://developers.google.com/webmaster-tools/v1/searchanalytics/query

Achados:
- Endpoint: `POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query`.
- Permite consultar tráfego por data, query, page, country, device etc.
- Requer autorização.
- Resultados incluem métricas como clicks, impressions, CTR e position.

Implicação:
- Pauta deve ser orientada por queries reais.
- Search Console alimenta `source_signals` semanalmente.

---

### Microsoft Clarity

Fonte: https://clarity.microsoft.com/pricing

Achados:
- Clarity declara ser free forever.
- Não impõe limite de tráfego.
- Inclui heatmaps, recordings, rage/dead clicks, segmentações e integração com GA.

Implicação:
- Melhor ferramenta grátis para validar CTA, formulário e scroll.
- Instalar no MVP.

---

## 5. Evidências de fontes oficiais de conteúdo

### STJ RSS

Fonte: https://www.stj.jus.br/sites/portalp/Comunicacao/conte%C3%BAdos-por-feed-(rss)

Achados:
- STJ disponibiliza RSS de Notícias.
- STJ disponibiliza feeds de Pesquisa Pronta, Jurisprudência em Teses e Informativo de Jurisprudência.

Feeds:
```text
https://res.stj.jus.br/hrestp-c-portalp/RSS.xml
https://scon.stj.jus.br/SCON/PesquisaProntaFeed
https://scon.stj.jus.br/SCON/JurisprudenciaEmTesesFeed
https://processo.stj.jus.br/jurisprudencia/externo/InformativoFeed
```

Implicação:
- Fonte oficial e gratuita para sinais de atualização.
- Bom para manter artigos vivos sem virar portal de notícia.

---

### BCB SGS JSON

Fontes:
- https://dadosabertos.bcb.gov.br/dataset/11-taxa-de-juros---selic/resource/b73edc07-bbac-430c-a2cb-b1639e605fa8
- https://dadosabertos.bcb.gov.br/dataset/25443-taxa-media-mensal-de-juros-das-operacoes-de-credito-com-recursos-livres---pessoas-juridicas--/resource/e069b419-af84-4b51-9e9d-89b8308b1008

Achados:
- API JSON do BCData/SGS usa padrão:
  `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados?formato=json&dataInicial=dd/MM/aaaa&dataFinal=dd/MM/aaaa`
- Também permite últimos N valores:
  `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados/ultimos/{N}?formato=json`
- Série 11: Selic.
- Série 25443: taxa média mensal PJ capital de giro rotativo.

Implicação:
- Conteúdo de juros/revisional deve usar dados oficiais BCB.
- Dá para criar tabelas e checklists sem API paga.

---

### CNJ DataJud API Pública

Fonte: https://www.cnj.jus.br/sistemas/datajud/api-publica/

Achados:
- API Pública dá acesso a metadados processuais do DataJud.
- Dados respeitam proteção de processos sigilosos e partes.
- Uso orientado a pesquisa, apps e análise do sistema de Justiça.

Implicação:
- Pode apoiar conteúdo macro e pesquisa, não promessa de resultado.
- Não é necessário no caminho crítico do MVP.

---

### Consumidor.gov API

Fonte: https://consumidor.gov.br/pages/principal/documentacao-api

Achados:
- API existe, mas exige credenciais/habilitação.
- Token é temporário e expira no dia.
- Documentação menciona janelas de disponibilidade/livre acesso.

Implicação:
- Não colocar Consumidor.gov no core do MVP.
- Usar apenas se houver credenciais e caso de uso claro.

---

## 6. SEO/estrutura técnica já validada

### Google structured data

Fontes:
- https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- https://developers.google.com/search/docs/appearance/structured-data/article
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb

Achados:
- Google recomenda JSON-LD como formato fácil de manter.
- Structured data deve refletir conteúdo visível.
- `BlogPosting`, `BreadcrumbList` e `FAQPage` são úteis quando correspondem ao conteúdo.
- Validar com Rich Results Test e monitorar Search Console.

Implicação:
- Todo artigo terá `BlogPosting`.
- Todo hub/artigo terá `BreadcrumbList`.
- FAQ schema apenas se FAQ visível.

---

### Astro

Fontes:
- https://docs.astro.build/en/concepts/why-astro/
- https://docs.astro.build/en/guides/content-collections/

Achados:
- Astro é feito para content-driven sites.
- Zero JS por padrão.
- Content Collections dão schema/type-safety para Markdown/MDX.

Implicação:
- Astro é melhor que Next.js para este produto.
- O produto é conteúdo + conversão leve, não SaaS/app complexo.

---

## 7. Compliance OAB

Fonte:
- Provimento OAB 205/2021: https://eticaedisciplina.oab.org.br/assets/docs/Provimento%20n.%20205.2021%20-%20Publicidade.pdf

Achados:
- Marketing jurídico é permitido quando informativo, discreto e sóbrio.
- Conteúdo jurídico pode consolidar reputação profissional.
- Vedado promessa de resultado, mercantilização, autoengrandecimento, comparação, valores/descontos como captação.
- Chatbot é permitido para comunicação/coleta de dados/documentos, sem substituir decisão de advogado.

Implicação:
- Diagnóstico inicial não dá parecer jurídico automático.
- CTAs devem ser sóbrios: “solicitar análise”, “organizar documentos”, “entender próximos passos”.
- Todo conteúdo precisa de disclaimer informativo.

---

## 8. Conclusão da pesquisa

A arquitetura correta é:

1. **Astro/static-first** para SEO e performance.
2. **Cloudflare Pages/Workers/D1/Turnstile** para evitar backend/banco pagos.
3. **Pipedrive API** como fonte da verdade dos leads.
4. **OpenAI Responses + Structured Outputs + Batch** para reduzir custo e manter outputs validáveis.
5. **Search Console + Pipedrive + fontes oficiais** como combustível editorial.
6. **GA4/GTM + Clarity** para medir conversão, não vaidade.
7. **Revisão humana/OAB obrigatória** antes de publicar.

Não construir WordPress genérico, não comprar automação antes de provar demanda, não pagar SERP API para descobrir o que o Search Console vai contar de graça depois. Stack inchada antes de lead é só cosplay de startup.
