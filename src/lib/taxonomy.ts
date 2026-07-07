export type ClusterSlug =
  | 'busca-e-apreensao'
  | 'juros-abusivos'
  | 'dividas-pj'
  | 'superendividamento'
  | 'cobrancas-fraudes';

export type Intent = 'informational' | 'urgent' | 'commercial-investigation' | 'comparison' | 'checklist';
export type CtaType = 'whatsapp' | 'diagnostic' | 'checklist' | 'form';

export interface LeadCta {
  type: CtaType;
  label: string;
  href: string;
  position: string;
}

export interface Cluster {
  slug: ClusterSlug;
  hubRoute: `/${string}/`;
  title: string;
  shortTitle: string;
  summary: string;
  primaryCta: LeadCta;
  checklistRoute?: `/${string}/`;
}

export interface ArticleRoute {
  route: `/${string}/`;
  slug: string;
  title: string;
  cluster: ClusterSlug;
  intent: Intent;
  primaryKeyword: string;
  ctaType: CtaType;
}

export const CLUSTERS = [
  {
    slug: 'busca-e-apreensao',
    hubRoute: '/busca-e-apreensao/',
    title: 'Busca e apreensão de veículo',
    shortTitle: 'Busca e apreensão',
    summary:
      'Guias urgentes para quem atrasou parcelas, recebeu visita de oficial de justiça ou precisa entender próximos passos antes de falar com o banco.',
    primaryCta: {
      type: 'whatsapp',
      label: 'Falar sobre busca e apreensão',
      href: 'https://wa.me/5500000000000?text=Tenho%20d%C3%BAvidas%20sobre%20busca%20e%20apreens%C3%A3o',
      position: 'hub_hero',
    },
    checklistRoute: '/checklist-busca-e-apreensao/',
  },
  {
    slug: 'juros-abusivos',
    hubRoute: '/juros-abusivos/',
    title: 'Juros abusivos e revisão de contrato',
    shortTitle: 'Juros abusivos',
    summary:
      'Conteúdo para comparar contrato, taxa média, tarifas e sinais de desequilíbrio financeiro sem prometer redução automática de dívida.',
    primaryCta: {
      type: 'diagnostic',
      label: 'Solicitar análise inicial do contrato',
      href: '/diagnostico-inicial/?problema=juros-abusivos',
      position: 'hub_hero',
    },
    checklistRoute: '/checklist-juros-abusivos/',
  },
  {
    slug: 'dividas-pj',
    hubRoute: '/dividas-pj/',
    title: 'Dívidas bancárias PJ',
    shortTitle: 'Dívidas PJ',
    summary:
      'Orientação para empresas com execução bancária, capital de giro caro, CCB, avalista e bloqueios judiciais com foco em documentação e estratégia.',
    primaryCta: {
      type: 'form',
      label: 'Organizar caso PJ',
      href: '/diagnostico-inicial/?problema=dividas-pj',
      position: 'hub_hero',
    },
    checklistRoute: '/checklist-divida-pj/',
  },
  {
    slug: 'superendividamento',
    hubRoute: '/superendividamento/',
    title: 'Superendividamento',
    shortTitle: 'Superendividamento',
    summary:
      'Guias sobre mínimo existencial, renegociação, quais dívidas entram e como preparar informações para uma avaliação individual.',
    primaryCta: {
      type: 'diagnostic',
      label: 'Entender documentos necessários',
      href: '/diagnostico-inicial/?problema=superendividamento',
      position: 'hub_hero',
    },
  },
  {
    slug: 'cobrancas-fraudes',
    hubRoute: '/cobrancas-indevidas/',
    title: 'Cobranças indevidas e fraudes bancárias',
    shortTitle: 'Cobranças e fraudes',
    summary:
      'Próximos passos para negativação indevida, cobrança bancária questionável, empréstimo não contratado e golpes envolvendo Pix.',
    primaryCta: {
      type: 'diagnostic',
      label: 'Relatar cobrança ou fraude',
      href: '/diagnostico-inicial/?problema=cobrancas-fraudes',
      position: 'hub_hero',
    },
  },
] as const satisfies readonly Cluster[];

export const HOMEPAGE_PRIMARY_HUBS = CLUSTERS.map((cluster) => cluster.slug);

export const ARTICLE_ROUTES = [
  {
    route: '/busca-e-apreensao-veiculo/',
    slug: 'busca-e-apreensao-veiculo',
    title: 'Busca e apreensão de veículo: o que observar primeiro',
    cluster: 'busca-e-apreensao',
    intent: 'urgent',
    primaryKeyword: 'busca e apreensão veículo',
    ctaType: 'whatsapp',
  },
  {
    route: '/quantas-parcelas-atrasadas-busca-e-apreensao/',
    slug: 'quantas-parcelas-atrasadas-busca-e-apreensao',
    title: 'Quantas parcelas atrasadas podem levar à busca e apreensão?',
    cluster: 'busca-e-apreensao',
    intent: 'informational',
    primaryKeyword: 'quantas parcelas atrasadas busca e apreensão',
    ctaType: 'checklist',
  },
  {
    route: '/oficial-de-justica-busca-e-apreensao-o-que-fazer/',
    slug: 'oficial-de-justica-busca-e-apreensao-o-que-fazer',
    title: 'Oficial de justiça em busca e apreensão: o que fazer',
    cluster: 'busca-e-apreensao',
    intent: 'urgent',
    primaryKeyword: 'oficial de justiça busca e apreensão o que fazer',
    ctaType: 'whatsapp',
  },
  {
    route: '/veiculo-de-trabalho-pode-ser-apreendido/',
    slug: 'veiculo-de-trabalho-pode-ser-apreendido',
    title: 'Veículo de trabalho pode ser apreendido?',
    cluster: 'busca-e-apreensao',
    intent: 'informational',
    primaryKeyword: 'veículo de trabalho pode ser apreendido',
    ctaType: 'diagnostic',
  },
  {
    route: '/como-recuperar-veiculo-apreendido/',
    slug: 'como-recuperar-veiculo-apreendido',
    title: 'Como recuperar veículo apreendido: documentos e prazos',
    cluster: 'busca-e-apreensao',
    intent: 'urgent',
    primaryKeyword: 'como recuperar veículo apreendido',
    ctaType: 'whatsapp',
  },
  {
    route: '/entrega-amigavel-quita-divida/',
    slug: 'entrega-amigavel-quita-divida',
    title: 'Entrega amigável quita a dívida? Pontos para avaliar',
    cluster: 'busca-e-apreensao',
    intent: 'commercial-investigation',
    primaryKeyword: 'entrega amigável quita dívida',
    ctaType: 'diagnostic',
  },
  {
    route: '/juros-abusivos-financiamento-veiculo/',
    slug: 'juros-abusivos-financiamento-veiculo',
    title: 'Juros abusivos em financiamento de veículo: como avaliar',
    cluster: 'juros-abusivos',
    intent: 'commercial-investigation',
    primaryKeyword: 'juros abusivos financiamento veículo',
    ctaType: 'diagnostic',
  },
  {
    route: '/taxa-media-bacen-como-comparar/',
    slug: 'taxa-media-bacen-como-comparar',
    title: 'Taxa média Bacen: como comparar com seu contrato',
    cluster: 'juros-abusivos',
    intent: 'comparison',
    primaryKeyword: 'taxa média Bacen como comparar',
    ctaType: 'checklist',
  },
  {
    route: '/seguro-prestamista-e-obrigatorio/',
    slug: 'seguro-prestamista-e-obrigatorio',
    title: 'Seguro prestamista é obrigatório?',
    cluster: 'juros-abusivos',
    intent: 'informational',
    primaryKeyword: 'seguro prestamista é obrigatório',
    ctaType: 'diagnostic',
  },
  {
    route: '/tarifas-bancarias-financiamento/',
    slug: 'tarifas-bancarias-financiamento',
    title: 'Tarifas bancárias em financiamento: quais merecem atenção',
    cluster: 'juros-abusivos',
    intent: 'informational',
    primaryKeyword: 'tarifas bancárias financiamento',
    ctaType: 'checklist',
  },
  {
    route: '/acao-revisional-quando-vale-a-pena/',
    slug: 'acao-revisional-quando-vale-a-pena',
    title: 'Ação revisional: quando pode valer a pena avaliar',
    cluster: 'juros-abusivos',
    intent: 'commercial-investigation',
    primaryKeyword: 'ação revisional quando vale a pena',
    ctaType: 'diagnostic',
  },
  {
    route: '/parcelas-do-financiamento-nao-baixam/',
    slug: 'parcelas-do-financiamento-nao-baixam',
    title: 'Parcelas do financiamento não baixam: o que conferir',
    cluster: 'juros-abusivos',
    intent: 'informational',
    primaryKeyword: 'parcelas financiamento não baixam',
    ctaType: 'diagnostic',
  },
  {
    route: '/execucao-bancaria-empresa-o-que-fazer/',
    slug: 'execucao-bancaria-empresa-o-que-fazer',
    title: 'Execução bancária contra empresa: primeiros passos',
    cluster: 'dividas-pj',
    intent: 'urgent',
    primaryKeyword: 'execução bancária empresa o que fazer',
    ctaType: 'form',
  },
  {
    route: '/capital-de-giro-juros-abusivos/',
    slug: 'capital-de-giro-juros-abusivos',
    title: 'Capital de giro com juros altos: como organizar a análise',
    cluster: 'dividas-pj',
    intent: 'commercial-investigation',
    primaryKeyword: 'capital de giro juros abusivos',
    ctaType: 'form',
  },
  {
    route: '/bloqueio-judicial-conta-pj/',
    slug: 'bloqueio-judicial-conta-pj',
    title: 'Bloqueio judicial em conta PJ: o que levantar de informação',
    cluster: 'dividas-pj',
    intent: 'urgent',
    primaryKeyword: 'bloqueio judicial conta PJ',
    ctaType: 'form',
  },
  {
    route: '/avalista-divida-empresa-riscos/',
    slug: 'avalista-divida-empresa-riscos',
    title: 'Avalista em dívida de empresa: riscos que devem ser avaliados',
    cluster: 'dividas-pj',
    intent: 'informational',
    primaryKeyword: 'avalista dívida empresa riscos',
    ctaType: 'diagnostic',
  },
  {
    route: '/renegociacao-divida-pj-com-banco/',
    slug: 'renegociacao-divida-pj-com-banco',
    title: 'Renegociação de dívida PJ com banco: como preparar proposta',
    cluster: 'dividas-pj',
    intent: 'commercial-investigation',
    primaryKeyword: 'renegociação dívida PJ banco',
    ctaType: 'form',
  },
  {
    route: '/ccb-bancaria-empresa-cuidados/',
    slug: 'ccb-bancaria-empresa-cuidados',
    title: 'CCB bancária para empresa: cuidados antes de assinar ou discutir',
    cluster: 'dividas-pj',
    intent: 'informational',
    primaryKeyword: 'CCB bancária empresa cuidados',
    ctaType: 'diagnostic',
  },
  {
    route: '/lei-do-superendividamento-como-funciona/',
    slug: 'lei-do-superendividamento-como-funciona',
    title: 'Lei do superendividamento: como funciona em linhas gerais',
    cluster: 'superendividamento',
    intent: 'informational',
    primaryKeyword: 'lei do superendividamento como funciona',
    ctaType: 'diagnostic',
  },
  {
    route: '/quais-dividas-entram-no-superendividamento/',
    slug: 'quais-dividas-entram-no-superendividamento',
    title: 'Quais dívidas entram no superendividamento?',
    cluster: 'superendividamento',
    intent: 'informational',
    primaryKeyword: 'quais dívidas entram no superendividamento',
    ctaType: 'diagnostic',
  },
  {
    route: '/minimo-existencial-dividas/',
    slug: 'minimo-existencial-dividas',
    title: 'Mínimo existencial e dívidas: o que significa',
    cluster: 'superendividamento',
    intent: 'informational',
    primaryKeyword: 'mínimo existencial dívidas',
    ctaType: 'diagnostic',
  },
  {
    route: '/banco-e-obrigado-a-renegociar-divida/',
    slug: 'banco-e-obrigado-a-renegociar-divida',
    title: 'Banco é obrigado a renegociar dívida?',
    cluster: 'superendividamento',
    intent: 'commercial-investigation',
    primaryKeyword: 'banco é obrigado a renegociar dívida',
    ctaType: 'diagnostic',
  },
  {
    route: '/nome-negativado-indevidamente-o-que-fazer/',
    slug: 'nome-negativado-indevidamente-o-que-fazer',
    title: 'Nome negativado indevidamente: o que fazer primeiro',
    cluster: 'cobrancas-fraudes',
    intent: 'urgent',
    primaryKeyword: 'nome negativado indevidamente o que fazer',
    ctaType: 'diagnostic',
  },
  {
    route: '/cobranca-indevida-banco-como-resolver/',
    slug: 'cobranca-indevida-banco-como-resolver',
    title: 'Cobrança indevida de banco: como organizar a reclamação',
    cluster: 'cobrancas-fraudes',
    intent: 'urgent',
    primaryKeyword: 'cobrança indevida banco como resolver',
    ctaType: 'diagnostic',
  },
  {
    route: '/emprestimo-nao-contratado/',
    slug: 'emprestimo-nao-contratado',
    title: 'Empréstimo não contratado: documentos e próximos passos',
    cluster: 'cobrancas-fraudes',
    intent: 'urgent',
    primaryKeyword: 'empréstimo não contratado',
    ctaType: 'diagnostic',
  },
  {
    route: '/golpe-pix-responsabilidade-do-banco/',
    slug: 'golpe-pix-responsabilidade-do-banco',
    title: 'Golpe do Pix e responsabilidade do banco: o que pode ser analisado',
    cluster: 'cobrancas-fraudes',
    intent: 'commercial-investigation',
    primaryKeyword: 'golpe Pix responsabilidade banco',
    ctaType: 'diagnostic',
  },
] as const satisfies readonly ArticleRoute[];

export interface ChecklistRoute {
  route: `/${string}/`;
  slug: string;
  title: string;
  cluster: ClusterSlug;
  items: readonly string[];
  cta: LeadCta;
}

export const CHECKLIST_ROUTES = [
  {
    route: '/checklist-busca-e-apreensao/',
    slug: 'checklist-busca-e-apreensao',
    title: 'Checklist de documentos para busca e apreensão',
    cluster: 'busca-e-apreensao',
    items: [
      'Contrato de financiamento ou número do contrato',
      'Comprovantes de pagamento e parcelas em atraso',
      'Notificações do banco ou do cartório',
      'Cópia de mandado, processo ou visita do oficial de justiça, se houver',
      'CRLV e informações de uso do veículo',
    ],
    cta: {
      type: 'whatsapp',
      label: 'Enviar contexto da busca e apreensão',
      href: 'https://wa.me/5500000000000?text=Tenho%20documentos%20sobre%20busca%20e%20apreens%C3%A3o',
      position: 'checklist_complete',
    },
  },
  {
    route: '/checklist-juros-abusivos/',
    slug: 'checklist-juros-abusivos',
    title: 'Checklist para análise de juros abusivos',
    cluster: 'juros-abusivos',
    items: [
      'Contrato completo e aditivos',
      'Extrato de parcelas pagas e parcelas em aberto',
      'CET, taxa mensal e taxa anual informadas no contrato',
      'Tarifas, seguros e serviços embutidos',
      'Comprovantes de tentativa de renegociação',
    ],
    cta: {
      type: 'diagnostic',
      label: 'Solicitar análise inicial do contrato',
      href: '/diagnostico-inicial/?problema=juros-abusivos',
      position: 'checklist_complete',
    },
  },
  {
    route: '/checklist-divida-pj/',
    slug: 'checklist-divida-pj',
    title: 'Checklist de dívida bancária PJ',
    cluster: 'dividas-pj',
    items: [
      'CCB, contrato de capital de giro ou instrumento assinado',
      'Extratos da conta PJ e evolução do débito',
      'Garantias, avalistas e bens vinculados',
      'Citações, intimações ou bloqueios judiciais',
      'Propostas anteriores de renegociação',
    ],
    cta: {
      type: 'form',
      label: 'Organizar caso PJ para análise',
      href: '/diagnostico-inicial/?problema=dividas-pj',
      position: 'checklist_complete',
    },
  },
] as const satisfies readonly ChecklistRoute[];

export const REQUIRED_TRACKING_EVENTS = [
  'article_view',
  'hub_view',
  'scroll_50',
  'scroll_75',
  'scroll_90',
  'cta_view',
  'cta_click',
  'whatsapp_click',
  'form_start',
  'form_submit',
  'diagnostic_start',
  'diagnostic_submit',
  'checklist_open',
  'checklist_complete',
  'internal_link_click',
  'search',
  'select_content',
  'generate_lead',
  'qualify_lead',
  'disqualify_lead',
  'working_lead',
  'close_convert_lead',
  'close_unconvert_lead',
] as const;

export function getClusterBySlug(slug: ClusterSlug | string): Cluster | undefined {
  return CLUSTERS.find((cluster) => cluster.slug === slug);
}

export function getArticleByRoute(route: string): ArticleRoute | undefined {
  const normalized = route.startsWith('/') ? route : `/${route}`;
  const canonical = normalized.endsWith('/') ? normalized : `${normalized}/`;
  return ARTICLE_ROUTES.find((article) => article.route === canonical);
}

export function getArticlesByCluster(clusterSlug: ClusterSlug): ArticleRoute[] {
  return ARTICLE_ROUTES.filter((article) => article.cluster === clusterSlug);
}

export function getChecklistByRoute(route: string): ChecklistRoute | undefined {
  const normalized = route.startsWith('/') ? route : `/${route}`;
  const canonical = normalized.endsWith('/') ? normalized : `${normalized}/`;
  return CHECKLIST_ROUTES.find((checklist) => checklist.route === canonical);
}
