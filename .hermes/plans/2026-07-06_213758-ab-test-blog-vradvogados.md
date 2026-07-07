# BLOG.VRADVOGADOS A/B Test Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Criar o `blog.vradvogados` como variante B em um teste contra o site institucional `vradvogados.com.br` — variante A — para provar que sabemos construir uma experiência com mais engajamento, menor churn, maior captação de leads e tração orgânica.

**Architecture:** O experimento compara duas experiências: A = site institucional atual, focado em apresentação do escritório; B = novo blog/editorial hub, focado em conteúdo útil, navegação por intenção, retenção e conversão progressiva. Como SEO orgânico não permite A/B clássico puro no curto prazo, o desenho correto é híbrido: teste controlado com tráfego distribuído + coorte orgânica acompanhada por Search Console/GA4.

**Tech Stack:** WordPress/headless ou Next.js/Astro para `blog.vradvogados`, GA4, Google Search Console, GTM, Microsoft Clarity/Hotjar, schema.org, UTM, eventos customizados, CRM/WhatsApp tracking, sitemap próprio, dashboard de métricas.

---

## 1. Correção de entendimento

### Variante A

`https://vradvogados.com.br/`

Função: site institucional do escritório.

Serve para:
- apresentar autoridade;
- mostrar áreas de atuação;
- transmitir confiança;
- direcionar para contato;
- mostrar presença nacional;
- explicar quem é a VR Advogados.

### Variante B

`https://blog.vradvogados.com.br/`

Função: novo produto editorial/orgânico.

Serve para:
- atrair público frio por busca orgânica;
- educar o visitante;
- prender atenção com navegação guiada;
- transformar dúvida em lead;
- gerar recorrência;
- provar capacidade de growth orgânico.

### Hipótese central

> Se o visitante entra por uma dúvida jurídica/bancária específica, uma experiência editorial orientada por intenção terá mais engajamento, menor abandono e maior conversão do que uma página institucional genérica.

---

## 2. Ponto crítico: isso não é A/B clássico puro

Chamar de A/B tudo bem comercialmente, mas tecnicamente precisamos ser honestos.

Um A/B clássico exige:
- mesmo público;
- mesma origem de tráfego;
- distribuição aleatória;
- mesma janela de comparação;
- métrica primária definida antes.

Comparar `vradvogados.com.br` com `blog.vradvogados.com.br` por orgânico puro não é A/B limpo, porque:
- SEO demora a indexar;
- queries de entrada são diferentes;
- intenção do usuário muda;
- autoridade do domínio/subdomínio pode variar;
- páginas ranqueiam em tempos distintos.

### Solução correta

Rodar dois testes em paralelo:

1. **Teste controlado de experiência**
   - tráfego pago, social, email, QR, remarketing ou campanhas internas;
   - 50/50 para A e B;
   - mede comportamento e lead.

2. **Teste orgânico longitudinal**
   - acompanha crescimento do B por 30/60/90 dias;
   - mede impressões, cliques, indexação, CTR, posição e leads orgânicos;
   - compara com baseline orgânico do A.

Isso evita autoengano. E autoengano em growth é uma máquina cara de fazer gráfico bonito e dinheiro sumir.

---

## 3. Objetivos do experimento

### Objetivo primário

Provar que o `blog.vradvogados` gera **mais leads qualificados por visitante orgânico/intencional** do que a experiência institucional atual.

### Objetivos secundários

- Aumentar tempo engajado.
- Reduzir bounce/abandono rápido.
- Aumentar páginas por sessão.
- Aumentar cliques em CTA.
- Aumentar microconversões.
- Criar base indexável de conteúdo evergreen.
- Validar modelo editorial repetível.

---

## 4. Métricas

### Métrica primária

**Lead qualified action rate**

Eventos considerados:
- clique WhatsApp com contexto do artigo;
- envio de formulário;
- clique em “falar com especialista”;
- envio de diagnóstico jurídico;
- upload/análise de contrato, se existir;
- clique em simulador seguido de contato.

Fórmula:

```text
lead_rate = leads_qualificados / sessões elegíveis
```

### Métricas de engajamento

- Engaged sessions rate.
- Average engagement time.
- Scroll depth 50%, 75%, 90%.
- Pages/session.
- Internal CTR.
- CTA view → CTA click.
- Article completion rate.
- Return visitor rate.

### Métricas de churn/abandono

- Bounce rate.
- Exit rate por template.
- Abandono antes de 10 segundos.
- Abandono sem scroll.
- Rage clicks/dead clicks via Clarity.

### Métricas orgânicas

- Impressões no Search Console.
- Cliques orgânicos.
- CTR orgânico.
- Posição média.
- Queries novas capturadas.
- Páginas indexadas.
- Leads por landing page orgânica.

---

## 5. Desenho do experimento

### Grupo A — institucional

Landing original ou conjunto de páginas atuais do `vradvogados.com.br`.

Exemplos:
- home;
- área de atuação;
- busca e apreensão;
- juros abusivos;
- contato;
- páginas de serviço.

### Grupo B — blog

Novo `blog.vradvogados.com.br` com páginas editoriais e jornada de conversão.

Exemplos:
- artigo guia;
- hub de problema;
- checklist interativo;
- FAQ;
- simulador/diagnóstico;
- CTA contextual.

### Tráfego controlado

Criar campanhas/canais com distribuição 50/50:

```text
/ab/ba-veiculo      -> 50% A: página institucional de busca e apreensão
                    -> 50% B: hub/artigo blog sobre busca e apreensão

/ab/juros-abusivos  -> 50% A: página institucional/revisional
                    -> 50% B: guia blog juros abusivos + calculadora

/ab/divida-pj       -> 50% A: página institucional dívida PJ
                    -> 50% B: hub blog execução/capital de giro/renegociação
```

### Tráfego orgânico

Não fazer cloaking. Não dividir usuário orgânico do Google com redirecionamento aleatório em página indexada. Isso é pedir para apanhar do Google sem necessidade.

Para orgânico:
- indexar B normalmente;
- medir B como nova propriedade no Search Console;
- comparar contra baseline histórico do A;
- comparar clusters equivalentes.

---

## 6. Estrutura do blog B

### Homepage do blog

Objetivo: não ser “lista de posts”. Lista de posts é preguiça com CSS.

Estrutura recomendada:

1. Hero com promessa clara:
   - “Entenda seus direitos contra abusos bancários antes de tomar uma decisão.”

2. Busca por problema:
   - “Meu veículo está em risco”
   - “Minha dívida virou bola de neve”
   - “Minha empresa foi executada”
   - “Suspeito de juros abusivos”
   - “Meu nome foi negativado”

3. Hubs principais:
   - Busca e apreensão
   - Juros abusivos
   - Dívidas PJ
   - Superendividamento
   - Fraudes e cobranças indevidas

4. Ferramentas/conversores:
   - checklist de documentos;
   - calculadora/simulador;
   - diagnóstico inicial;
   - “qual é meu próximo passo?”

5. Conteúdo recente e conteúdo mais útil.

6. CTA final:
   - “Separe seus documentos e solicite uma análise.”

### Hubs principais

Cada hub deve funcionar como mini-produto, não categoria WordPress largada.

Template de hub:

```markdown
# Tema principal

Resumo do problema.

## O que fazer agora

Checklist imediato.

## Guias essenciais

Artigos principais ordenados por jornada.

## Perguntas frequentes

FAQ curta.

## Ferramenta útil

Simulador/checklist/diagnóstico.

## Quando buscar análise jurídica

CTA contextual.
```

### Artigos

Template obrigatório:

```markdown
# Título com intenção de busca

Resposta curta em até 4 linhas.

## Em resumo

## Quando isso acontece

## O que pode ser avaliado

## Documentos necessários

## Erros comuns

## Passo a passo

## Perguntas frequentes

## Próximo passo recomendado
```

---

## 7. Jornada de conversão do B

### Visitante frio

Origem:
- Google;
- campanha;
- social;
- indicação.

Entrada:
- artigo específico;
- hub de problema;
- checklist.

Objetivo da primeira sessão:
- entender dor;
- engajar;
- avançar para diagnóstico leve.

### Microconversões

- Scroll 75%.
- Clique em FAQ.
- Clique em artigo relacionado.
- Uso de checklist.
- Download/visualização de lista de documentos.
- Clique em simulador.
- Clique em WhatsApp.

### Conversões fortes

- Formulário enviado.
- WhatsApp iniciado.
- Diagnóstico enviado.
- Contrato/documento anexado.
- Agendamento com especialista.

---

## 8. Conteúdo inicial mínimo para o teste

Não precisa lançar com 300 posts. Precisa lançar com 15 páginas boas.

### Hub 1: Busca e apreensão

1. `busca-e-apreensao-veiculo/`
2. `quantas-parcelas-atrasadas-busca-e-apreensao/`
3. `oficial-de-justica-busca-e-apreensao-o-que-fazer/`
4. `veiculo-de-trabalho-pode-ser-apreendido/`
5. `como-recuperar-veiculo-apreendido/`

### Hub 2: Juros abusivos

6. `juros-abusivos-financiamento-veiculo/`
7. `taxa-media-bacen-como-comparar/`
8. `seguro-prestamista-e-obrigatorio/`
9. `tarifas-bancarias-no-financiamento/`
10. `acao-revisional-quando-vale-a-pena/`

### Hub 3: Dívidas PJ

11. `execucao-bancaria-empresa-o-que-fazer/`
12. `capital-de-giro-juros-abusivos/`
13. `bloqueio-judicial-conta-pj/`
14. `avalista-divida-empresa-riscos/`
15. `renegociacao-divida-pj-com-banco/`

### Páginas utilitárias

16. `checklist-documentos-busca-e-apreensao/`
17. `checklist-documentos-juros-abusivos/`
18. `diagnostico-inicial/`
19. `glossario-bancario/`
20. `sobre-o-blog/`

---

## 9. Instrumentação obrigatória

### GA4 events

Criar eventos:

```text
article_view
article_scroll_50
article_scroll_75
article_scroll_90
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
related_article_click
```

### Parâmetros mínimos

```text
page_type
cluster
article_id
cta_type
cta_position
traffic_variant
source_page
intent
```

### Variantes

```text
variant = A_institutional
variant = B_blog
```

### UTMs

Campanhas controladas devem usar:

```text
utm_source=abtest
utm_medium=controlled
utm_campaign=vr_blog_validation
utm_content=A_institutional
utm_content=B_blog
```

---

## 10. Dashboard de prova

Criar dashboard com 4 blocos.

### Bloco 1: Aquisição

- sessões por variante;
- origem/canal;
- usuários novos;
- queries orgânicas;
- landing pages.

### Bloco 2: Engajamento

- tempo engajado;
- scroll depth;
- páginas por sessão;
- cliques internos;
- retorno.

### Bloco 3: Conversão

- CTA clicks;
- WhatsApp clicks;
- form submit;
- lead rate;
- lead por cluster.

### Bloco 4: Qualidade

- bounce;
- churn <10s;
- dead clicks;
- páginas sem conversão;
- artigos com alta impressão e baixo CTR.

---

## 11. Critérios de vitória

### Mínimo para declarar B promissor

B vence se, na mesma origem controlada:

- lead rate >= A + 20%;
- engaged sessions rate >= A + 15%;
- churn <10s <= A - 15%;
- CTA click rate >= A + 25%.

### Mínimo para declarar B vencedor orgânico

Em 90 dias:

- páginas B indexadas corretamente;
- crescimento mensal de impressões;
- queries novas relevantes;
- leads orgânicos atribuídos ao B;
- pelo menos 3 clusters com tração real.

### Métrica que importa de verdade

Lead qualificado por sessão elegível.

Se tempo de tela sobe e lead não vem, temos revista digital, não máquina de aquisição.

---

## 12. Roadmap de execução

### Sprint 1 — Definição experimental

1. Definir páginas A que serão comparadas.
2. Definir páginas B equivalentes.
3. Definir métrica primária.
4. Definir eventos GA4/GTM.
5. Definir canais de tráfego controlado.
6. Definir período mínimo do teste.

### Sprint 2 — Protótipo do B

1. Criar arquitetura de informação.
2. Criar homepage do blog.
3. Criar 3 hubs.
4. Criar 15 artigos iniciais.
5. Criar 3 checklists.
6. Criar CTAs contextuais.

### Sprint 3 — Instrumentação

1. Instalar GA4/GTM.
2. Configurar eventos.
3. Configurar Search Console do subdomínio.
4. Configurar sitemap.
5. Configurar Clarity/Hotjar.
6. Validar tracking em ambiente real.

### Sprint 4 — Lançamento controlado

1. Publicar B.
2. Rodar smoke test técnico.
3. Distribuir campanha 50/50.
4. Monitorar bugs de tracking.
5. Coletar dados por 14 dias iniciais.
6. Ajustar CTAs e UX sem mexer na hipótese central.

### Sprint 5 — Orgânico

1. Submeter sitemap.
2. Criar interlinks do site A para B.
3. Publicar 2 conteúdos por semana com intenção clara.
4. Atualizar conteúdos por dados de Search Console.
5. Medir crescimento semanal.
6. Consolidar vencedores em hubs.

---

## 13. Riscos

### Risco: comparar tráfego diferente

**Mitigação:** separar dashboard controlado e dashboard orgânico.

### Risco: B ter mais curiosos e menos leads

**Mitigação:** CTA progressivo e qualificação por intenção.

### Risco: conteúdo jurídico virar promessa

**Mitigação:** disclaimer, revisão de claims e linguagem prudente.

### Risco: blog parecer genérico

**Mitigação:** ferramentas, checklists, exemplos reais, dados Bacen/STJ, navegação por problema.

### Risco: subdomínio demorar para ranquear

**Mitigação:** interlinks do domínio principal, sitemap, conteúdo evergreen, campanhas controladas no começo.

---

## 14. Open questions

1. O B será WordPress, Next.js/Astro ou outro stack?
2. Temos acesso ao domínio/DNS para criar `blog.vradvogados.com.br`?
3. O cliente aceita tráfego pago/controlado para validar A/B mais rápido?
4. Qual canal principal de lead: WhatsApp, formulário, diagnóstico ou CRM?
5. Quais páginas do A serão usadas como controle?
6. O teste precisa durar 30, 60 ou 90 dias?
7. Existe verba para Clarity/Hotjar ou usaremos Microsoft Clarity gratuito?
8. Quem aprova juridicamente os conteúdos?

---

## 15. Recomendação direta

Fazer o B como “blog de posts” é fraco. O B tem que ser um **produto editorial de conversão**, com hubs por problema, checklists, diagnóstico e tracking pesado.

O pitch para o cliente deve ser:

> “O site atual prova autoridade institucional. O blog vai provar tração: captura demanda orgânica, segura o usuário pela dor específica e converte com contexto.”

Esse é o teste certo.
