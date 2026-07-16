# Blog VR Advogados

Cloudflare Worker SSR para `blog.vradvogados.com.br`, com D1, Workflows, OpenAI Responses API, Turnstile e Pipedrive. Sem WordPress, framework front-end ou CMS.

## Rodar localmente

```bash
npm install --include=dev
npm run db:local
npm run seed:local
npm run dev
```

Abra `http://localhost:8787`. O formulário permanece indisponível até existirem secrets e IDs reais; nenhum envio recebe falso sucesso.

## Verificação

```bash
npm run check
```

O check executa testes Node, tipos gerados pelo Wrangler, smoke test HTTP local e bundle/dry-run.

## Secrets Cloudflare

Configurar somente pelo Wrangler:

```bash
wrangler secret put OPENAI_API_KEY --env staging
wrangler secret put PIPEDRIVE_API_TOKEN --env staging
wrangler secret put TURNSTILE_SECRET --env staging
wrangler secret put IDEMPOTENCY_SECRET --env staging
```

Repetir com `--env production` somente após a calibração em staging.

Nunca colocar os valores no Git, `.dev.vars`, logs ou tickets.

## Variáveis que precisam de IDs reais

Atualizar em `wrangler.jsonc` antes do deploy:

- `SITE_URL` e `EXPECTED_HOSTNAME`;
- `TURNSTILE_SITE_KEY`;
- `OPENAI_MODEL` disponível na conta;
- `PIPEDRIVE_BASE_URL`;
- owner comercial e owner de QA;
- label Blog;
- canal de marketing `Organic Search` e seu ID externo;
- tipo de Activity;
- seis field keys do Pipedrive.

O `database_id` atual é um placeholder. Criar o D1 remoto e substituir o ID:

```bash
wrangler d1 create vr-blog-staging
wrangler d1 create vr-blog
# Substitua os dois IDs no wrangler.jsonc e regenere os tipos:
wrangler types
wrangler d1 migrations apply DB --remote --env staging
wrangler d1 execute DB --remote --env staging --file seeds/topics.sql
# Após a calibração aprovada:
wrangler d1 migrations apply DB --remote --env production
wrangler d1 execute DB --remote --env production --file seeds/topics.sql
```

## Fluxo editorial

O cron semanal cria até 100 Workflows distribuídos durante sete dias. Cada execução:

1. reserva uma pauta;
2. pesquisa e redige com Structured Outputs;
3. executa quality gates determinísticos e verifica as URLs oficiais sem seguir redirects fora da allowlist;
4. executa auditoria crítica;
5. permite uma correção;
6. publica e reivindica atomicamente uma das 90 vagas via trigger D1;
7. invalida cache e atualiza o sitemap.

Conteúdo rejeitado nunca ocupa vaga. Os dez excedentes ficam na pauta da semana seguinte. Após as 100 execuções alcançarem estado terminal, uma Activity de QA idempotente é criada ou reutilizada no Pipedrive com contagens e amostra de dez URLs. Claims `uncertain` em `batch_launches` ou `qa_activity_claims` exigem reconciliação manual para evitar duplicação remota.

## Pautas

`seeds/topics.sql` contém 100 briefs iniciais distribuídos entre:

- busca e apreensão;
- revisão de contratos;
- dívidas bancárias empresariais.

Novos lotes exigem novos briefs distintos. Geração autônoma infinita de pautas foi deliberadamente evitada para não criar conteúdo em escala sem governança.

## Pipedrive

O formulário valida Turnstile, limita cada origem a cinco envios por hora com HMAC rotativo (sem persistir o IP bruto), normaliza dados e procura o `Submission ID` antes de criar:

1. Person, se ainda não existir;
2. Lead com origem, canal, cluster, CTA, UTM e consentimento;
3. Activity de retorno no próximo dia útil.

D1 armazena apenas HMAC de idempotência e ID do Lead por sete dias; nome, telefone, e-mail e mensagem ficam no Pipedrive.

## Go-live

1. substituir os IDs e URLs placeholder;
2. inserir secrets;
3. aplicar migration e seed remotos;
4. executar `npm run check`;
5. fazer deploy de staging;
6. validar formulário real, um Workflow de calibração e Pipedrive;
7. confirmar a criação automática do Custom Domain `blog.vradvogados.com.br`;
8. cadastrar sitemap no Search Console;
9. após dez artigos de calibração aprovados, alterar `EDITORIAL_ENABLED` para `true` em produção, regenerar os tipos e redeployar.

Os dois lead magnets e perfis de revisores humanos entram somente após o cliente aprovar os materiais e fornecer bios/OAB; o projeto não inventa essas atribuições.
