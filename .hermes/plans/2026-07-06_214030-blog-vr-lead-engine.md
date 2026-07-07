# BLOG.VRADVOGADOS Lead Engine Plan

> **For Hermes:** Planejamento apenas. Não implementar sem confirmação explícita do usuário.

**Goal:** Criar `blog.vradvogados.com.br` como um site editorial de aquisição orgânica para atrair, engajar e converter leads jurídicos ligados a problemas bancários.

**Architecture:** O site B não será um “blog comum”. Será um **hub de problemas bancários**, estruturado por dores reais do usuário, com artigos evergreen, páginas-pilar, checklists, ferramentas leves, CTAs contextuais e tracking de conversão.

**Tech Stack sugerido:** WordPress bem otimizado ou Astro/Next.js estático + CMS simples, GA4, Google Search Console, GTM, Microsoft Clarity, schema.org, sitemap, formulários/WhatsApp com UTM/eventos.

---

## 1. Enquadramento correto

O site `vradvogados.com.br` serve como referência institucional: marca, autoridade, escritório, equipe, serviços e confiança.

O novo `blog.vradvogados.com.br` deve servir outro papel:

- capturar buscas orgânicas de pessoas com problema urgente;
- educar rápido;
- reduzir ansiedade;
- mostrar caminho seguro;
- converter em contato qualificado;
- provar que o canal orgânico gera demanda.

A pergunta real não é “B ganha do A?”.

A pergunta real é:

> Esse novo site consegue virar uma máquina previsível de leads orgânicos?

---

## 2. Tese do produto

O usuário não procura “escritório de advocacia bonito”. Ele procura:

- “oficial de justiça veio buscar meu carro”;
- “quantas parcelas atrasadas dá busca e apreensão”;
- “juros abusivos financiamento veículo”;
- “bloqueio judicial conta PJ”;
- “banco negativou meu nome indevidamente”;
- “empresa com dívida bancária o que fazer”.

Então o blog deve ser construído ao redor de **situações**, não ao redor de “notícias do escritório”.

---

## 3. Público-alvo inicial

### Público 1: pessoa física com veículo financiado

Dores:
- parcelas atrasadas;
- medo de busca e apreensão;
- veículo de trabalho;
- carro já apreendido;
- juros altos;
- contrato confuso;
- proposta abusiva do banco.

### Público 2: consumidor com dívida bancária

Dores:
- empréstimo impagável;
- cartão/cheque especial;
- negativação;
- cobrança indevida;
- superendividamento;
- renegociação ruim.

### Público 3: empresa endividada

Dores:
- capital de giro;
- CCB;
- execução bancária;
- bloqueio judicial;
- avalista/sócio em risco;
- renegociação PJ;
- fluxo de caixa comprometido.

---

## 4. Objetivo de conversão

### Conversão primária

Lead qualificado iniciado por:

- clique em WhatsApp;
- formulário enviado;
- diagnóstico inicial preenchido;
- solicitação de análise de contrato;
- agendamento com especialista.

### Microconversões

- scroll 75%;
- clique em checklist;
- clique em artigo relacionado;
- uso de simulador;
- download/visualização de documentos necessários;
- clique em CTA intermediário.

### Métrica principal

```text
lead_rate = leads_qualificados / sessões orgânicas elegíveis
```

Métrica bonita sem lead é vaidade. Tempo na página não paga boleto.

---

## 5. Estrutura do site

### 5.1 Homepage

A homepage precisa ser uma central de dores, não uma vitrine genérica.

Blocos:

1. **Hero direto**
   - “Entenda seus direitos contra abusos bancários antes de tomar uma decisão.”

2. **Escolha seu problema**
   - Meu veículo está em risco
   - Quero revisar juros abusivos
   - Minha empresa está sendo cobrada
   - Estou superendividado
   - Sofri cobrança/negativação indevida

3. **Hubs principais**
   - Busca e apreensão
   - Juros abusivos
   - Dívidas PJ
   - Superendividamento
   - Cobranças indevidas

4. **Ferramentas rápidas**
   - Checklist de documentos
   - Diagnóstico inicial
   - Simulador/triagem

5. **Artigos essenciais**
   - Não listar “últimos posts”; listar “mais úteis”.

6. **CTA final**
   - “Separe seus documentos e solicite uma análise.”

---

## 6. Hubs obrigatórios do MVP

### Hub 1: Busca e apreensão

URL sugerida:

`/busca-e-apreensao/`

Função:
- capturar tráfego de urgência;
- explicar prazos e riscos;
- levar para contato rápido.

Artigos iniciais:

1. `/busca-e-apreensao-veiculo/`
2. `/quantas-parcelas-atrasadas-busca-e-apreensao/`
3. `/oficial-de-justica-busca-e-apreensao-o-que-fazer/`
4. `/veiculo-de-trabalho-pode-ser-apreendido/`
5. `/como-recuperar-veiculo-apreendido/`
6. `/entrega-amigavel-quita-divida/`

### Hub 2: Juros abusivos e revisional

URL sugerida:

`/juros-abusivos/`

Artigos iniciais:

1. `/juros-abusivos-financiamento-veiculo/`
2. `/taxa-media-bacen-como-comparar/`
3. `/seguro-prestamista-e-obrigatorio/`
4. `/tarifas-bancarias-financiamento/`
5. `/acao-revisional-quando-vale-a-pena/`
6. `/parcelas-do-financiamento-nao-baixam/`

### Hub 3: Dívidas PJ

URL sugerida:

`/dividas-pj/`

Artigos iniciais:

1. `/execucao-bancaria-empresa-o-que-fazer/`
2. `/capital-de-giro-juros-abusivos/`
3. `/bloqueio-judicial-conta-pj/`
4. `/avalista-divida-empresa-riscos/`
5. `/renegociacao-divida-pj-com-banco/`
6. `/ccb-bancaria-empresa-cuidados/`

### Hub 4: Superendividamento

URL sugerida:

`/superendividamento/`

Artigos iniciais:

1. `/lei-do-superendividamento-como-funciona/`
2. `/quais-dividas-entram-no-superendividamento/`
3. `/minimo-existencial-dividas/`
4. `/banco-e-obrigado-a-renegociar-divida/`

### Hub 5: Cobranças indevidas e negativação

URL sugerida:

`/cobrancas-indevidas/`

Artigos iniciais:

1. `/nome-negativado-indevidamente-o-que-fazer/`
2. `/cobranca-indevida-banco-como-resolver/`
3. `/emprestimo-nao-contratado/`
4. `/golpe-pix-responsabilidade-do-banco/`

---

## 7. Páginas utilitárias para capturar lead

Essas páginas são o diferencial. Sem elas, vira blogzinho jurídico igual mil outros.

### 7.1 Diagnóstico inicial

URL:

`/diagnostico-inicial/`

Campos:
- tipo de problema;
- banco/financeira;
- valor aproximado;
- há processo judicial?;
- há veículo apreendido?;
- tem contrato?;
- nome;
- telefone/WhatsApp;
- consentimento LGPD.

### 7.2 Checklist de documentos

URLs:

- `/checklist-busca-e-apreensao/`
- `/checklist-juros-abusivos/`
- `/checklist-divida-pj/`

Objetivo:
- gerar valor imediato;
- preparar lead;
- aumentar qualidade do atendimento.

### 7.3 Glossário bancário

URL:

`/glossario-bancario/`

Objetivo:
- capturar long-tail;
- criar interlink interno;
- educar usuário leigo.

---

## 8. Template obrigatório de artigo

Todo artigo deve seguir essa estrutura:

```markdown
# Título com a dúvida real do usuário

Resposta curta e direta em até 4 linhas.

## Em resumo

Bullets com resposta prática.

## Quando isso acontece

Contexto da situação.

## O que pode ser avaliado juridicamente

Sem promessa de resultado.

## Documentos necessários

Checklist.

## Erros que pioram o caso

Lista objetiva.

## Próximo passo seguro

Orientação prática.

## Perguntas frequentes

FAQ real.

## CTA contextual

Contato/diagnóstico/checklist.
```

---

## 9. Regras editoriais

### Usar

- linguagem simples;
- resposta rápida no início;
- exemplos concretos;
- checklists;
- tabelas;
- fontes oficiais quando houver dado jurídico/financeiro;
- CTA contextual;
- disclaimer leve.

### Evitar

- juridiquês;
- prometer resultado;
- “garantimos recuperar seu carro”;
- “limpe seu nome agora”;
- texto genérico;
- notícia sem relação com lead;
- post só para volume.

### Disclaimer padrão

> Este conteúdo é informativo e não substitui a análise individual de um advogado. Cada caso depende dos documentos, valores, prazos e fase da cobrança ou processo.

---

## 10. SEO técnico

### Obrigatório no lançamento

- sitemap.xml do subdomínio;
- robots.txt correto;
- canonical;
- schema `Article`, `FAQPage`, `BreadcrumbList`;
- meta title/description únicos;
- headings limpos;
- URLs curtas;
- Core Web Vitals decente;
- imagem otimizada com alt text;
- Search Console configurado;
- GA4 configurado.

### Interlink mínimo por artigo

Cada artigo deve ter:

- 1 link para hub principal;
- 2 links para artigos relacionados;
- 1 link para checklist/diagnóstico;
- 1 CTA final.

---

## 11. Tracking

### Eventos GA4/GTM

```text
page_view
article_view
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
```

### Parâmetros

```text
page_type
cluster
intent
cta_position
cta_type
source_article
lead_topic
```

### Conversões principais

- `whatsapp_click`
- `form_submit`
- `diagnostic_submit`

---

## 12. MVP recomendado

### Páginas mínimas para lançar

- Homepage
- 5 hubs
- 20 artigos
- 3 checklists
- 1 diagnóstico inicial
- 1 glossário
- páginas legais: privacidade/LGPD/termos se necessário

Total: aproximadamente 31 páginas.

Isso é suficiente para provar tese sem construir um monstro.

---

## 13. Plano de conteúdo dos primeiros 30 dias

### Semana 1

- publicar homepage;
- publicar hub busca e apreensão;
- publicar 6 artigos de busca e apreensão;
- publicar checklist busca e apreensão.

### Semana 2

- publicar hub juros abusivos;
- publicar 6 artigos de juros/revisional;
- publicar checklist juros abusivos.

### Semana 3

- publicar hub dívidas PJ;
- publicar 6 artigos de dívidas PJ;
- publicar checklist dívida PJ.

### Semana 4

- publicar hubs superendividamento e cobranças indevidas;
- publicar 8 artigos restantes;
- publicar glossário;
- revisar interlinks;
- validar tracking;
- enviar sitemap.

---

## 14. Operação recorrente após lançamento

### Semanal

- revisar Search Console;
- identificar queries com impressão e baixo CTR;
- atualizar títulos/meta;
- criar 2 artigos novos com base em demanda real;
- melhorar 2 artigos existentes;
- revisar leads por cluster.

### Mensal

- relatório de tráfego orgânico;
- relatório de conversão;
- páginas que geram lead;
- páginas que atraem mas não convertem;
- novos clusters a explorar;
- poda de conteúdo inútil.

---

## 15. Critérios de sucesso

### 30 dias

- site indexado;
- tracking funcionando;
- primeiras impressões no Search Console;
- primeiros leads rastreáveis, mesmo que poucos;
- comportamento claro por cluster.

### 60 dias

- crescimento de impressões;
- primeiras queries relevantes;
- artigos com CTR ajustado;
- leads por pelo menos 2 hubs;
- dados suficientes para melhorar CTAs.

### 90 dias

- lead orgânico recorrente;
- clusters vencedores identificados;
- páginas prioritárias atualizadas;
- expansão baseada em dado, não achismo.

---

## 16. Riscos

### Risco: virar blog genérico

Mitigação: construir por dor/intenção, não por categoria genérica.

### Risco: tráfego sem lead

Mitigação: checklists, diagnóstico, CTA contextual e formulários curtos.

### Risco: promessa jurídica indevida

Mitigação: linguagem prudente, revisão de claims e disclaimer.

### Risco: SEO lento

Mitigação: interlinks do domínio principal, sitemap, conteúdo evergreen, páginas utilitárias e consistência.

### Risco: conteúdo demais sem qualidade

Mitigação: começar com MVP de 31 páginas e expandir por dado.

---

## 17. Próxima execução sugerida

Se aprovado, executar nesta ordem:

1. definir stack do `blog.vradvogados.com.br`;
2. criar arquitetura de informação;
3. criar wireframe textual da homepage;
4. criar templates de hub/artigo/checklist;
5. produzir primeiro lote: hub busca e apreensão + 6 artigos + checklist;
6. configurar tracking;
7. publicar MVP;
8. medir 30/60/90 dias.

---

## 18. Como alimentaremos o site

A alimentação não deve vir de “vamos postar 3 vezes por semana”. Isso é calendário vazio fantasiado de estratégia.

O site será alimentado por **sinais reais de demanda**, divididos em 6 fontes.

### Fonte 1: Busca orgânica e intenção do Google

Usar para descobrir o que as pessoas já estão perguntando.

Entradas:
- Google Search Console;
- Google Trends;
- autocomplete do Google;
- “As pessoas também perguntam”;
- buscas relacionadas;
- análise de concorrentes ranqueando.

Saída:
- novos artigos long-tail;
- ajustes em títulos/meta;
- atualização de FAQs;
- expansão de hubs vencedores.

Exemplo:

Se aparecer muita impressão para “oficial de justiça pode levar carro sem eu estar em casa”, vira artigo ou FAQ dentro do hub de busca e apreensão.

### Fonte 2: Leads reais e atendimento

Essa é a melhor fonte. O Google mostra busca; o comercial mostra dor com dinheiro na mesa.

Entradas:
- perguntas recebidas no WhatsApp;
- objeções do atendimento;
- dúvidas frequentes em formulário;
- motivos de lead desqualificado;
- documentos que os leads não sabem separar;
- frases reais usadas pelos clientes.

Saída:
- artigos com linguagem de cliente;
- checklists;
- páginas de objeção;
- melhorias no diagnóstico inicial;
- novos CTAs.

Exemplo:

Se muitos leads perguntam “entregar o carro quita a dívida?”, essa página vira prioridade porque já há intenção comercial clara.

### Fonte 3: Dados oficiais e indicadores

Usar para dar autoridade, atualização e motivo para revisitar páginas.

Entradas:
- Banco Central: taxa média de juros, IF.data, séries temporais;
- Selic/IPCA;
- STJ/STF/CNJ;
- Planalto;
- Senado/Câmara;
- Procons;
- Serasa/inadimplência;
- Febraban quando relevante.

Saída:
- atualizações de guias;
- artigos “o que muda com X?”;
- tabelas de referência;
- conteúdos comparativos;
- argumentos para páginas de juros abusivos.

Exemplo:

Se a taxa média Bacen para financiamento de veículos muda, atualizar páginas de juros abusivos e criar nota explicando como comparar contrato x média de mercado.

### Fonte 4: Notícias com ângulo de serviço

Não é para virar portal de notícia. Notícia só entra se gerar dúvida pesquisável ou lead.

Critérios para virar conteúdo:
- afeta consumidor endividado;
- afeta empresa devedora;
- muda prática bancária;
- envolve busca e apreensão, superendividamento, juros ou cobrança;
- gera pergunta prática.

Formato:
- “Notícia explicada”;
- “O que isso muda para quem tem financiamento?”;
- “Quais documentos separar?”;
- “Quando isso pode afetar seu caso?”

### Fonte 5: Performance interna do próprio blog

O blog se alimenta dele mesmo.

Entradas:
- páginas com muitas impressões e baixo CTR;
- páginas com bom tráfego e baixo lead;
- páginas com muito abandono;
- CTAs ignorados;
- queries novas no Search Console;
- artigos que geram WhatsApp.

Saída:
- reescrita de títulos;
- troca de CTA;
- melhoria de introdução;
- criação de artigo complementar;
- fusão de conteúdos fracos;
- expansão dos hubs vencedores.

Exemplo:

Se artigo de “veículo de trabalho pode ser apreendido” atrai muito tráfego mas pouco lead, testar CTA mais específico: “Use o checklist para provar que o veículo é ferramenta de trabalho”.

### Fonte 6: Cluster comercial prioritário

Nem toda pauta vale a mesma coisa. A alimentação precisa seguir dinheiro e intenção.

Prioridade inicial:

1. busca e apreensão;
2. juros abusivos/revisional;
3. dívidas PJ;
4. superendividamento;
5. cobranças indevidas/negativação;
6. fraudes bancárias.

Regra:

- 70% do conteúdo em clusters com maior chance de lead;
- 20% em expansão SEO long-tail;
- 10% em notícias/oportunidades.

---

## 19. Esteira operacional de alimentação

### Rotina semanal

1. Puxar dados do Search Console.
2. Listar queries novas.
3. Ver quais páginas tiveram impressão mas baixo CTR.
4. Revisar perguntas do WhatsApp/formulários.
5. Escolher 2 pautas novas e 2 atualizações.
6. Produzir briefing antes do texto.
7. Publicar ou agendar.
8. Registrar hipótese da página.

### Rotina mensal

1. Identificar hubs que mais geraram lead.
2. Expandir hubs vencedores.
3. Cortar/mesclar conteúdo que não performa.
4. Atualizar dados Bacen/STJ/legislação.
5. Revisar CTAs e formulários.
6. Criar relatório: tráfego, leads, conversão e próximos temas.

---

## 20. Modelo de briefing obrigatório

Antes de qualquer artigo, criar briefing com:

```markdown
# Briefing

Tema:
Cluster:
Intenção de busca:
Dor do usuário:
Pergunta principal:
Resposta curta:
Palavras-chave:
Páginas internas para linkar:
CTA recomendado:
Documentos que o usuário deve separar:
Fonte oficial necessária:
Risco jurídico/OAB:
Hipótese de conversão:
```

Sem briefing, não publica. Publicar sem briefing é como peticionar sem ler o processo: dá para fazer, mas é coisa de animal.

---

## 21. Recomendação direta

O projeto não deve ser vendido como “blog”. Blog é commodity.

Deve ser vendido como:

> **um mecanismo de aquisição orgânica por intenção jurídica**, onde cada página nasce para capturar uma dor pesquisada, educar rápido e converter em análise.

Esse é o jogo.
