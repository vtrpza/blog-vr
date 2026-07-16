import type { ArticleBlock, Source } from "./content.ts";

export type PublishedPost = {
  title: string;
  slug: string;
  metaDescription: string;
  excerpt: string;
  blocks: ArticleBlock[];
  sources: Source[];
  authorSlug: string;
  publishedAt: string;
  updatedAt: string;
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]!);
}

function renderBlock(block: ArticleBlock, sourceMap: Map<string, number>): string {
  const refs = block.sourceIds
    .map((id) => sourceMap.get(id))
    .filter((id): id is number => id !== undefined)
    .map((id) => `<a class="ref" href="#fonte-${id}" aria-label="Fonte ${id}">[${id}]</a>`)
    .join("");
  if (block.type === "heading") return `<h2>${escapeHtml(block.text)}</h2>`;
  if (block.type === "list") return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>${refs}`;
  if (block.type === "callout") return `<aside class="callout">${escapeHtml(block.text)}${refs}</aside>`;
  return `<p>${escapeHtml(block.text)}${refs}</p>`;
}

function layout(title: string, description: string, canonical: string, body: string, schema: object): string {
  const json = JSON.stringify(schema).replace(/</g, "\\u003c");
  const socialImage = `${new URL(canonical).origin}/og-default.webp`;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)} | VR Advogados</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(socialImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/styles.css">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script type="application/ld+json">${json}</script>
</head>
<body>
  <a class="skip" href="#conteudo">Ir para o conteúdo</a>
  <header class="site-header">
    <div class="header-main">
      <a class="brand" href="/" aria-label="VR Advogados — início"><span class="brand-mark">VR</span><span class="brand-name"><strong>VR Advogados</strong><small>Direito Bancário</small></span></a>
      <nav class="utility-nav" aria-label="Institucional"><a href="/sobre/">Sobre</a><a href="/politica-editorial/">Política editorial</a></nav>
      <a class="button header-cta" href="/contato/">Falar com a equipe</a>
    </div>
    <nav class="topic-nav" aria-label="Temas"><div><span>Biblioteca jurídica</span><a href="/busca-e-apreensao/">Busca e apreensão</a><a href="/revisao-de-contratos-bancarios/">Contratos bancários</a><a href="/dividas-bancarias-empresariais/">Dívidas empresariais</a></div></nav>
  </header>
  <main id="conteudo">${body}</main>
  <footer class="site-footer"><div class="footer-main"><div><a class="brand footer-brand" href="/"><span class="brand-mark">VR</span><span class="brand-name"><strong>VR Advogados</strong><small>Direito Bancário</small></span></a><p>Conteúdo informativo para decisões mais conscientes em relações bancárias.</p></div><nav aria-label="Temas do rodapé"><strong>Temas</strong><a href="/busca-e-apreensao/">Busca e apreensão</a><a href="/revisao-de-contratos-bancarios/">Contratos bancários</a><a href="/dividas-bancarias-empresariais/">Dívidas empresariais</a></nav><nav aria-label="Institucional do rodapé"><strong>Institucional</strong><a href="/sobre/">Sobre</a><a href="/politica-editorial/">Política editorial</a><a href="/politica-de-correcoes/">Correções</a><a href="/privacidade/">Privacidade</a></nav></div><div class="footer-note"><span>VR Advogados</span><span>Informação jurídica responsável, sem promessa de resultado.</span></div></footer>
</body>
</html>`;
}

export function renderHome(posts: PublishedPost[], siteUrl: string): string {
  const cards = posts.length
    ? posts.map((post) => `<article class="card article-card"><p class="eyebrow">Direito Bancário</p><h3><a href="/artigos/${escapeHtml(post.slug)}/">${escapeHtml(post.title)}</a></h3><p>${escapeHtml(post.excerpt)}</p><a class="card-link" href="/artigos/${escapeHtml(post.slug)}/">Ler artigo <span aria-hidden="true">→</span></a></article>`).join("")
    : `<div class="empty-state"><p class="eyebrow">Em preparação</p><h3>Novos conteúdos chegam em breve.</h3><p>Cada texto passa por validações de fontes, linguagem e estrutura antes de ser publicado.</p></div>`;
  const body = `<section class="hero"><div class="hero-copy"><p class="eyebrow">Biblioteca jurídica VR Advogados</p><h1>Direito bancário com clareza e fontes verificáveis</h1><p>Orientação informativa para compreender contratos, cobranças e medidas bancárias antes de tomar decisões.</p><div class="actions"><a class="button" href="/contato/">Falar com a equipe</a><a class="text-link" href="#temas">Explorar os temas <span aria-hidden="true">↓</span></a></div></div><aside class="hero-panel"><p class="panel-kicker">O que orienta este blog</p><ol><li><span>01</span><div><strong>Fontes oficiais</strong><p>Legislação, tribunais e órgãos públicos.</p></div></li><li><span>02</span><div><strong>Linguagem responsável</strong><p>Sem promessas, atalhos ou respostas genéricas.</p></div></li><li><span>03</span><div><strong>Contexto antes da decisão</strong><p>Documentos e fatos mudam a análise.</p></div></li></ol></aside></section>
  <section id="temas" class="section themes"><div class="section-head"><div><p class="eyebrow">Comece pelo seu problema</p><h2>Três frentes de Direito Bancário</h2></div><p>Conteúdo organizado para você localizar o ponto de partida, preservar documentos e compreender os próximos passos.</p></div><div class="grid pillars">
    <a class="card" href="/busca-e-apreensao/"><span class="card-index">01</span><h3>Busca e apreensão</h3><p>Entenda mora, notificação, defesa e próximos passos.</p><span class="card-link">Explorar tema →</span></a>
    <a class="card" href="/revisao-de-contratos-bancarios/"><span class="card-index">02</span><h3>Revisão de contratos</h3><p>Compare taxas, CET e cláusulas com critérios verificáveis.</p><span class="card-link">Explorar tema →</span></a>
    <a class="card" href="/dividas-bancarias-empresariais/"><span class="card-index">03</span><h3>Dívidas bancárias empresariais</h3><p>Organize riscos, garantias e alternativas de negociação.</p><span class="card-link">Explorar tema →</span></a>
  </div></section>
  <section class="section recent"><div class="section-head"><div><p class="eyebrow">Artigos recentes</p><h2>Conteúdo para decisões mais informadas</h2></div><p>Leituras objetivas, com referências públicas e data de atualização.</p></div><div class="grid article-grid">${cards}</div></section>
  <section class="section editorial"><div class="section-head"><div><p class="eyebrow">Transparência editorial</p><h2>Confiança também se constrói mostrando o processo</h2></div></div><div class="editorial-links"><a href="/autores/equipe-editorial/"><span>01</span><div><h3>Equipe Editorial</h3><p>Uso de automação e limites da autoria.</p></div><b aria-hidden="true">↗</b></a><a href="/politica-editorial/"><span>02</span><div><h3>Política editorial</h3><p>Critérios de fontes, linguagem e publicação.</p></div><b aria-hidden="true">↗</b></a><a href="/politica-de-correcoes/"><span>03</span><div><h3>Correções</h3><p>Como indicar erros ou mudanças normativas.</p></div><b aria-hidden="true">↗</b></a></div></section>
  <section class="cta wide"><div><p class="eyebrow">Análise individual</p><h2>Seu caso exige leitura dos documentos?</h2><p>Envie apenas os dados iniciais. A equipe retorna pelo canal escolhido.</p></div><a class="button" href="/contato/">Falar com a equipe</a></section>`;
  return layout("Direito Bancário", "Conteúdo informativo e verificável sobre contratos, dívidas bancárias e busca e apreensão.", `${siteUrl}/`, body, {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "Blog VR Advogados", url: `${siteUrl}/`, inLanguage: "pt-BR" },
      { "@type": "Organization", name: "VR Advogados", url: siteUrl }
    ]
  });
}

type StaticPage = {
  title: string;
  description: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  sources?: Array<Pick<Source, "title" | "url">>;
  updatedAt?: string;
};

const PAGES: Record<string, StaticPage> = {
  "busca-e-apreensao": {
    title: "Busca e apreensão de veículos",
    description: "Entenda contrato, mora, notificação, apreensão, pagamento e documentos relevantes na busca e apreensão de veículos financiados.",
    intro: "A busca e apreensão de veículo financiado envolve o contrato, a garantia fiduciária, a constituição da mora e a fase em que o procedimento se encontra. Esta página organiza os pontos que normalmente precisam ser compreendidos, sem substituir a análise dos documentos de uma situação específica.",
    sections: [
      { title: "O que é a busca e apreensão de veículo", body: "Em muitos financiamentos, o veículo permanece em posse do devedor, mas é dado ao credor como garantia até a quitação. Diante do inadimplemento e do cumprimento dos requisitos legais, o credor pode pedir a apreensão do bem. A existência de parcelas vencidas é relevante, porém não encerra a análise: contrato, notificações, pagamentos, planilha da dívida e atos processuais precisam ser considerados em conjunto." },
      { title: "Contrato e alienação fiduciária", body: "O primeiro documento a conferir é o contrato completo, incluindo proposta, cédula, aditivos, seguros, tarifas e quadro de pagamentos. Ele deve identificar o veículo, a operação, a garantia e as obrigações assumidas. Também é importante comparar o instrumento assinado com os valores efetivamente liberados e pagos. Fotos isoladas de páginas ou simulações comerciais não substituem a versão integral do contrato." },
      { title: "Constituição da mora e notificação", body: "A constituição da mora e a forma de sua comprovação ocupam posição central nesse procedimento. Devem ser conferidos o endereço informado no contrato, a forma de envio, as datas, o conteúdo da comunicação e os documentos apresentados no processo. Correspondência devolvida, mudança de endereço ou contato informal com o banco não produzem uma conclusão automática; a relevância de cada fato depende da legislação e da jurisprudência aplicáveis." },
      { title: "Como a medida judicial se desenvolve", body: "O pedido costuma ser acompanhado pelo contrato, pela demonstração da mora e pelo cálculo apresentado pelo credor. Se a medida for concedida, o cumprimento pode ocorrer antes de uma discussão mais ampla sobre o contrato. Por isso, a leitura do mandado, da decisão e da petição inicial é mais segura do que depender de mensagens de terceiros. Prazos processuais próprios podem começar a correr com os atos de apreensão e citação." },
      { title: "O que acontece depois da apreensão", body: "Após a retirada do veículo, surgem questões sobre guarda, consolidação da propriedade, venda do bem, prestação de contas e eventual saldo da operação. Objetos pessoais não integram a garantia e devem ser identificados e reclamados pelos canais documentados. O destino do veículo e da dívida não deve ser presumido: é necessário acompanhar o processo e conservar comprovantes de toda comunicação ou pagamento posterior." },
      { title: "Pagamento, negociação e saldo da dívida", body: "Pagamento parcial, proposta de renegociação e entrega voluntária são situações diferentes. Antes de aceitar um valor ou acordo, convém entender o que será quitado, quais encargos permanecem, como a garantia será tratada e se existe renúncia a alguma discussão. A venda do veículo também não significa, por si só, que a operação terminou sem saldo; o demonstrativo do credor precisa indicar a aplicação do valor obtido e a evolução restante." },
      { title: "Documentos que merecem conferência", body: "Reúna contrato e aditivos, comprovantes de pagamento, notificações, conversas mantidas pelos canais oficiais, planilhas de evolução, boletos, extratos e documentos do processo. Registre datas e evite alterar arquivos originais. Se o veículo continha bens pessoais, faça uma relação objetiva desses itens. Não envie documentos bancários ou dados sensíveis em formulários públicos; a triagem inicial pode começar com uma descrição breve do assunto." },
      { title: "Cuidados práticos e limites da informação", body: "Esconder o veículo, ignorar comunicações ou confiar em intermediários não identificados pode ampliar riscos e dificultar a organização dos fatos. Confirme qualquer proposta diretamente com os canais oficiais da instituição e preserve protocolos. Conteúdo geral ajuda a compreender o procedimento, mas não permite afirmar se uma apreensão é válida, se um valor está correto ou qual providência é adequada sem examinar o conjunto documental." }
    ],
    sources: [
      { title: "Decreto-Lei nº 911/1969 — alienação fiduciária", url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/1965-1988/del0911.htm" },
      { title: "Código Civil — Lei nº 10.406/2002", url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm" },
      { title: "Código de Processo Civil — Lei nº 13.105/2015", url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm" }
    ],
    updatedAt: "2026-07-15T00:00:00Z"
  },
  "revisao-de-contratos-bancarios": {
    title: "Revisão de contratos bancários",
    description: "Saiba como conferir taxas, CET, tarifas, seguros, capitalização e evolução de contratos bancários sem conclusões automáticas.",
    intro: "Revisar um contrato bancário significa reconstruir a operação e compreender como cada valor foi formado. Taxa elevada, parcela pesada ou saldo crescente podem justificar uma conferência, mas não demonstram isoladamente erro ou abusividade.",
    sections: [
      { title: "O que uma revisão contratual procura esclarecer", body: "A conferência busca identificar o que foi contratado, quanto foi disponibilizado, quais custos foram incorporados, como as parcelas foram calculadas e de que modo o saldo evoluiu. Ela pode revelar divergências documentais ou simplesmente explicar uma dinâmica financeira pouco compreendida. O objetivo inicial não é prometer redução, mas separar dados, cláusulas e hipóteses que dependem de análise jurídica ou contábil." },
      { title: "Comece pelo contrato completo", body: "Reúna o instrumento assinado, aditivos, demonstrativos, extratos, boletos, comprovantes, propostas de renegociação e comunicações da instituição. Em contratos digitais, preserve também o arquivo original e os registros disponíveis sobre a contratação. Uma simulação refeita apenas com parcela e valor financiado pode omitir tarifas, seguros, tributos, períodos de carência e alterações realizadas durante a operação." },
      { title: "Taxa nominal, taxa efetiva e periodicidade", body: "A taxa anunciada não deve ser lida sem sua periodicidade. Percentuais mensais e anuais não são comparáveis por simples multiplicação, e taxa nominal não é sinônimo de taxa efetiva. O contrato deve permitir identificar a base de cálculo e a forma de incidência. Para conferir a operação, é necessário manter unidade, período e modalidade consistentes, evitando comparar números que descrevem custos diferentes." },
      { title: "Custo Efetivo Total (CET)", body: "O CET procura reunir, em uma taxa única, juros, tarifas, tributos, seguros e outras despesas vinculadas à concessão do crédito. Ele ajuda a comparar propostas da mesma natureza, mas não substitui a leitura das rubricas individuais. Duas operações com juros semelhantes podem apresentar custos totais distintos. Por isso, o demonstrativo do CET e o fluxo previsto de pagamentos são peças relevantes na organização da análise." },
      { title: "Como usar as taxas médias do Banco Central", body: "As séries divulgadas pelo Banco Central ajudam a contextualizar taxas praticadas por modalidade e período. Elas funcionam como referência estatística, não como teto automático nem como prova isolada de irregularidade. A comparação deve escolher a modalidade correta, observar a data da contratação e considerar características da operação. Misturar crédito pessoal, financiamento de veículo, capital de giro e rotativo produz conclusões pouco confiáveis." },
      { title: "Capitalização, amortização e evolução do saldo", body: "Capitalização de juros e sistema de amortização são temas relacionados, mas não idênticos. A análise precisa observar a redação do contrato, a taxa informada, a periodicidade e a memória de cálculo. Tabelas Price, SAC e outros fluxos distribuem principal e juros de maneiras diferentes. O fato de uma parcela conter juros não demonstra duplicidade; a conclusão depende da reconstrução matemática e do regime jurídico aplicável." },
      { title: "Tarifas, seguros e encargos por atraso", body: "Tarifa de cadastro, avaliação, registro, seguro e serviços de terceiros devem ser identificados separadamente. Em caso de atraso, também podem aparecer multa, juros de mora e outros encargos previstos para a inadimplência. A denominação usada no extrato não basta: é preciso localizar a cláusula correspondente, a base de cálculo e a eventual cumulação com outras cobranças. Regras podem variar conforme produto, data e relação contratual." },
      { title: "Checklist para uma conferência útil", body: "Organize uma linha do tempo com contratação, liberações, pagamentos, atrasos, aditivos e renegociações. Compare contrato, CET e extratos; registre diferenças sem assumir sua causa. Preserve versões anteriores quando houver acordo novo, pois confissão de dívida ou novação podem alterar a estrutura da obrigação. Uma análise responsável distingue dúvida documental, divergência matemática e discussão jurídica, evitando promessas baseadas apenas em uma calculadora." }
    ],
    sources: [
      { title: "Banco Central — Custo Efetivo Total (CET)", url: "https://www.bcb.gov.br/meubc/faqs/p/custo-efetivo-total-cet" },
      { title: "Banco Central — Taxas de juros", url: "https://www.bcb.gov.br/estatisticas/txjuros" },
      { title: "Código de Defesa do Consumidor — Lei nº 8.078/1990", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" },
      { title: "Código Civil — Lei nº 10.406/2002", url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm" }
    ],
    updatedAt: "2026-07-15T00:00:00Z"
  },
  "dividas-bancarias-empresariais": {
    title: "Dívidas bancárias empresariais",
    description: "Organize contratos, garantias, fluxo de caixa e riscos antes de renegociar dívidas bancárias empresariais.",
    intro: "Uma dívida bancária empresarial raramente se resume ao saldo exibido no internet banking. Contratos, garantias, recebíveis, obrigações pessoais dos sócios e efeitos de uma renegociação precisam ser reunidos em um mapa único antes de qualquer decisão.",
    sections: [
      { title: "Comece pelo diagnóstico da exposição", body: "O diagnóstico deve abranger todas as instituições e operações, não apenas a parcela em atraso. Empréstimos, capital de giro, conta garantida, antecipação de recebíveis, cartões, financiamentos e renegociações podem compartilhar garantias ou eventos de vencimento. A visão consolidada reduz o risco de negociar uma dívida sem perceber como o novo acordo afeta outros contratos, o caixa operacional ou o patrimônio dos garantidores." },
      { title: "Como montar o mapa das dívidas", body: "Para cada operação, registre credor, número do contrato, valor originalmente liberado, saldo informado, parcelas, taxa, CET, vencimento, atraso e garantia. Acrescente aditivos, cobranças, protestos e processos conhecidos. Mantenha documentos vinculados a essa tabela e indique a data de cada saldo, pois números de períodos diferentes não são diretamente comparáveis. O mapa é uma ferramenta de organização, não uma conclusão sobre a validade da cobrança." },
      { title: "Garantias reais, pessoais e recebíveis", body: "Contratos empresariais podem envolver imóveis, veículos, máquinas, estoque, aplicações, recebíveis, aval ou fiança. Cada garantia tem funcionamento e formalidades próprios. Também é necessário verificar se o mesmo bem ou fluxo está comprometido em mais de uma obrigação. A separação entre patrimônio da empresa e dos sócios não impede efeitos pessoais quando alguém assumiu garantia em nome próprio ou quando existe fundamento jurídico específico." },
      { title: "Diferença entre aval e fiança", body: "Aval e fiança são garantias pessoais, mas não devem ser tratados como expressões equivalentes. O aval se relaciona a títulos de crédito; a fiança decorre de obrigação contratual e segue regras próprias. O documento precisa mostrar quem assinou, em qual qualidade, qual obrigação foi garantida e se houve alteração posterior. A extensão da responsabilidade não deve ser inferida apenas pela presença de uma assinatura na última página." },
      { title: "Cédula de crédito, confissão e renegociação", body: "A Cédula de Crédito Bancário pode reunir condições da operação e garantias em um instrumento com disciplina legal específica. Renegociações também podem incluir confissão de dívida, novação, liberação ou reforço de garantias. Antes de assinar, compare a obrigação anterior e a nova: saldo reconhecido, custos, prazo, carência, vencimento antecipado e consequências de um novo atraso merecem leitura conjunta." },
      { title: "Inadimplência e efeitos cruzados", body: "O atraso pode gerar encargos, restrições cadastrais, protesto, cobrança e medidas judiciais, conforme o contrato e a lei. Algumas operações preveem vencimento antecipado ou efeitos relacionados a outras dívidas. Isso não significa que toda consequência indicada pelo credor seja automática, mas exige que a empresa acompanhe notificações e processos. Comunicações recebidas devem ser datadas, preservadas e relacionadas à operação correta." },
      { title: "Fluxo de caixa e negociação sustentável", body: "Uma proposta viável precisa respeitar a capacidade real de pagamento depois dos custos essenciais da atividade. Projeções devem separar receita provável de expectativa comercial, considerar sazonalidade e mostrar quais garantias ou recebíveis já estão comprometidos. Alongar prazo pode reduzir a parcela e elevar o custo total; desconto pode exigir pagamento incompatível com o caixa. A decisão depende do conjunto de riscos, e não apenas do valor mensal oferecido." },
      { title: "O que conferir antes de um novo acordo", body: "Leia a minuta completa e compare-a com os contratos anteriores. Verifique saldo reconhecido, forma de amortização, encargos, novas garantias, responsabilidade dos sócios, renúncias, vencimento antecipado e tratamento das cobranças em andamento. Registre a origem dos recursos para pagamento e preserve propostas trocadas. Se os números ou documentos não fecharem, a divergência deve ser esclarecida antes da assinatura, sem assumir que a renegociação corrigirá automaticamente a operação." }
    ],
    sources: [
      { title: "Código Civil — Lei nº 10.406/2002", url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm" },
      { title: "Lei nº 10.931/2004 — Cédula de Crédito Bancário", url: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10.931.htm" },
      { title: "Código de Processo Civil — Lei nº 13.105/2015", url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm" },
      { title: "Banco Central — Custo Efetivo Total (CET)", url: "https://www.bcb.gov.br/meubc/faqs/p/custo-efetivo-total-cet" }
    ],
    updatedAt: "2026-07-15T00:00:00Z"
  },
  "sobre": {
    title: "Sobre o blog VR Advogados",
    description: "Conheça o propósito e os limites editoriais do blog VR Advogados.",
    intro: "Esta publicação organiza informação verificável sobre Direito Bancário para pessoas e empresas compreenderem melhor seus documentos e próximos passos.",
    sections: [
      { title: "Propósito", body: "Explicar temas complexos em linguagem clara, com fontes acessíveis, datas de atualização e distinção entre informação geral e análise individual." },
      { title: "Limites", body: "O conteúdo não substitui consulta jurídica, não cria relação advogado-cliente e não antecipa resultado para situações concretas." }
    ]
  },
  "politica-editorial": {
    title: "Política editorial",
    description: "Critérios de fontes, automação, autoria e qualidade do blog VR Advogados.",
    intro: "O blog usa automação com apoio de inteligência artificial para pesquisa e redação estruturada, submetida a validações editoriais automáticas.",
    sections: [
      { title: "Fontes e afirmações", body: "Priorizamos legislação, tribunais, Banco Central, CNJ e órgãos públicos. Afirmações numéricas e datas precisam apontar uma fonte." },
      { title: "Automação responsável", body: "A automação não é apresentada como advogado ou revisor. Conteúdo que falha os critérios de fonte, estrutura, linguagem ou duplicidade não é publicado." },
      { title: "Independência", body: "Não publicamos promessa de resultado, comparação promocional, caso de sucesso usado como captação ou conteúdo produzido apenas para repetir palavras-chave." }
    ]
  },
  "politica-de-correcoes": {
    title: "Política de correções",
    description: "Como solicitar e acompanhar correções no blog VR Advogados.",
    intro: "Erros factuais, links quebrados e mudanças normativas podem ser informados pelo formulário de contato.",
    sections: [
      { title: "Como tratamos uma correção", body: "A indicação é conferida na fonte, o conteúdo é corrigido ou retirado quando necessário e a data de atualização é modificada." },
      { title: "Escopo", body: "A política cobre precisão editorial. Solicitações sobre um caso individual seguem o fluxo de contato e não são respondidas publicamente." }
    ]
  },
  "privacidade": {
    title: "Aviso de privacidade",
    description: "Como os dados enviados pelo blog VR Advogados são tratados.",
    intro: "Coletamos somente os dados informados no formulário para realizar a triagem e responder ao pedido de contato.",
    sections: [
      { title: "Dados e finalidade", body: "Nome, e-mail ou telefone, UF, assunto, mensagem, origem e consentimento são enviados ao Pipedrive, utilizado como sistema de relacionamento." },
      { title: "Proteção e retenção", body: "O blog não mantém cópia local do conteúdo do formulário. Logs técnicos não devem conter nome, mensagem, e-mail ou telefone." },
      { title: "Seus direitos", body: "Solicitações de acesso, correção ou eliminação podem ser iniciadas pelo formulário, sem anexar documentos sensíveis nessa etapa." }
    ]
  }
};

export function renderPage(slug: string, siteUrl: string, posts: PublishedPost[] = []): string {
  const page = PAGES[slug];
  if (!page) throw new Error("page not found");
  const sections = page.sections.map((section) => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></section>`).join("");
  const updated = page.updatedAt ? `<p class="byline"><time datetime="${escapeHtml(page.updatedAt)}">Atualizado em ${escapeHtml(new Date(page.updatedAt).toLocaleDateString("pt-BR", { timeZone: "UTC" }))}</time></p>` : "";
  const sources = page.sources?.length ? `<section class="sources"><h2>Fontes oficiais</h2><ul>${page.sources.map((source) => `<li><a href="${escapeHtml(source.url)}" rel="noopener">${escapeHtml(source.title)}</a></li>`).join("")}</ul></section><p class="notice">Conteúdo informativo. A aplicação das normas depende dos documentos, fatos e contexto de cada situação.</p>` : "";
  const postLinks = posts.length ? `<section class="pillar-posts"><h2>Conteúdos deste tema</h2><div class="grid article-grid">${posts.map((post) => `<article class="article-card"><p class="eyebrow">Guia prático</p><h3><a href="/artigos/${escapeHtml(post.slug)}/">${escapeHtml(post.title)}</a></h3><p>${escapeHtml(post.excerpt)}</p><a class="card-link" href="/artigos/${escapeHtml(post.slug)}/">Ler artigo <span>→</span></a></article>`).join("")}</div></section>` : "";
  const body = `<article class="static-page"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Início</a></nav><header class="page-head"><p class="eyebrow">Biblioteca VR Advogados</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.intro)}</p>${updated}</header>${sections}${postLinks}${sources}<aside class="cta"><h2>Precisa avaliar documentos e contexto?</h2><p>Use o formulário para solicitar um primeiro retorno da equipe.</p><a class="button" href="/contato/?origem=${encodeURIComponent(slug)}">Falar com a equipe</a></aside></article>`;
  return layout(page.title, page.description, `${siteUrl}/${slug}/`, body, {
    "@context": "https://schema.org", "@type": "WebPage", name: page.title, description: page.description, url: `${siteUrl}/${slug}/`, dateModified: page.updatedAt
  });
}

export function renderAuthor(siteUrl: string): string {
  const body = `<article class="static-page"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Início</a> / Autores</nav><header class="page-head"><p class="eyebrow">Autoria editorial</p><h1>Equipe Editorial VR Advogados</h1><p>Identificação usada nos conteúdos produzidos pelo fluxo editorial automatizado do blog.</p></header><section><h2>Como o conteúdo é preparado</h2><p>A automação pesquisa fontes oficiais, gera texto estruturado e aplica validações de fonte, linguagem, duplicidade e formato antes da publicação.</p></section><section><h2>O que esta autoria não significa</h2><p>Ela não atribui revisão a um advogado específico. Nome, OAB e responsabilidade individual só serão exibidos quando houver participação humana real e identificada.</p></section><aside class="cta"><h2>Critérios públicos</h2><p>Consulte as regras de fontes, automação e correções do blog.</p><a class="button" href="/politica-editorial/">Ler a política editorial</a></aside></article>`;
  return layout("Equipe Editorial VR Advogados", "Conheça o processo e os limites da autoria editorial automatizada do blog VR Advogados.", `${siteUrl}/autores/equipe-editorial/`, body, {
    "@context": "https://schema.org", "@type": "Organization", name: "Equipe Editorial VR Advogados", url: `${siteUrl}/autores/equipe-editorial/`
  });
}

export function renderContact(siteUrl: string, turnstileSiteKey: string, sent = false, sourceUrl = `${siteUrl}/contato/`): string {
  const body = `${sent ? '<p class="success" role="status">Recebemos seu pedido. A equipe fará a triagem e retornará pelo canal informado.</p>' : ""}<section class="page-head"><p class="eyebrow">Contato</p><h1>Conte apenas o necessário para o primeiro retorno</h1><p>Não envie contratos, documentos ou dados bancários neste formulário.</p></section>
  <section class="form-shell"><form method="post" action="/api/contact">
    <label>Nome<input name="name" autocomplete="name" maxlength="100" required></label>
    <div class="form-row"><label>E-mail<input name="email" type="email" autocomplete="email" maxlength="254"></label><label>Telefone<input name="phone" type="tel" autocomplete="tel" maxlength="24"></label></div>
    <div class="form-row"><label>UF<input name="uf" autocomplete="address-level1" maxlength="2" required></label><label>Assunto<select name="subject" required><option value="">Selecione</option><option value="busca-e-apreensao">Busca e apreensão</option><option value="revisao-de-contrato">Revisão de contrato</option><option value="divida-empresarial">Dívida empresarial</option><option value="outro">Outro</option></select></label></div>
    <label>Mensagem<textarea name="message" maxlength="2000" rows="5"></textarea></label>
    <label class="honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
    <label class="check"><input name="consent" type="checkbox" value="true" required> Li o aviso de privacidade e autorizo o contato pelos dados informados.</label>
    <input type="hidden" name="sourceUrl" value="${escapeHtml(sourceUrl)}">
    <div class="cf-turnstile" data-sitekey="${escapeHtml(turnstileSiteKey)}" data-action="contact"></div>
    <button class="button" type="submit">Solicitar retorno</button>
  </form><aside><h2>O que acontece depois?</h2><ol><li>Os dados seguem diretamente ao Pipedrive.</li><li>A equipe faz a triagem inicial.</li><li>O retorno ocorre pelo canal válido informado.</li></ol><p>O envio não cria relação advogado-cliente nem garante atendimento ou resultado.</p></aside></section>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`;
  return layout("Contato", "Envie os dados iniciais para retorno da equipe VR Advogados.", `${siteUrl}/contato/`, body, {
    "@context": "https://schema.org", "@type": "ContactPage", name: "Contato VR Advogados", url: `${siteUrl}/contato/`
  });
}

export function renderSitemap(posts: PublishedPost[], siteUrl: string): string {
  const staticPaths = ["/", "/busca-e-apreensao/", "/revisao-de-contratos-bancarios/", "/dividas-bancarias-empresariais/", "/autores/equipe-editorial/", "/sobre/", "/politica-editorial/", "/politica-de-correcoes/", "/privacidade/", "/contato/"];
  const urls = [
    ...staticPaths.map((path) => ({ loc: `${siteUrl}${path}`, modified: undefined })),
    ...posts.map((post) => ({ loc: `${siteUrl}/artigos/${post.slug}/`, modified: post.updatedAt.slice(0, 10) }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `\n  <url><loc>${escapeHtml(url.loc)}</loc>${url.modified ? `<lastmod>${escapeHtml(url.modified)}</lastmod>` : ""}</url>`).join("")}\n</urlset>`;
}

export function renderArticle(post: PublishedPost, siteUrl: string, related: PublishedPost[] = []): string {
  const canonical = `${siteUrl}/artigos/${post.slug}/`;
  const sourceMap = new Map(post.sources.map((source, index) => [source.id, index + 1]));
  const relatedHtml = related.length ? `<section><h2>Conteúdos relacionados</h2><div class="grid">${related.map((item) => `<a class="card" href="/artigos/${escapeHtml(item.slug)}/"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.excerpt)}</p></a>`).join("")}</div></section>` : "";
  const body = `<article>
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Início</a> / Artigos</nav>
    <h1>${escapeHtml(post.title)}</h1>
    <p class="dek">${escapeHtml(post.excerpt)}</p>
    <p class="byline"><a href="/autores/equipe-editorial/">Equipe Editorial VR Advogados</a> · <time datetime="${escapeHtml(post.updatedAt)}">Atualizado em ${escapeHtml(new Date(post.updatedAt).toLocaleDateString("pt-BR", { timeZone: "UTC" }))}</time></p>
    <div class="article-body">${post.blocks.map((block) => renderBlock(block, sourceMap)).join("\n")}</div>
    <section class="sources"><h2>Fontes</h2><ol>${post.sources.map((source, index) => `<li id="fonte-${index + 1}"><a href="${escapeHtml(source.url)}" rel="noopener">${escapeHtml(source.title)}</a></li>`).join("")}</ol></section>
    <p class="notice">Conteúdo informativo. A análise de uma situação específica depende dos documentos, fatos e normas aplicáveis.</p>
    ${relatedHtml}
    <aside class="cta"><h2>Precisa analisar uma situação específica?</h2><p>As informações são gerais. A análise depende dos documentos e do contexto.</p><a class="button" href="/contato/?origem=${encodeURIComponent(post.slug)}">Falar com a equipe</a></aside>
  </article>`;
  return layout(post.title, post.metaDescription, canonical, body, {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: "Equipe Editorial VR Advogados" },
    publisher: { "@type": "Organization", name: "VR Advogados", url: siteUrl },
    mainEntityOfPage: canonical
  });
}
