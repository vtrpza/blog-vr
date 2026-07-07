export type ClusterSlug =
  | 'busca-e-apreensao'
  | 'juros-abusivos'
  | 'dividas-pj'
  | 'superendividamento'
  | 'cobrancas-fraudes';

export type Intent = 'informational' | 'urgent' | 'commercial-investigation' | 'comparison' | 'checklist';
export type CtaType = 'whatsapp' | 'diagnostic' | 'checklist';

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
  /** Tom de voz do hub: frase curta de impacto acima do H1 */
  tagline: string;
  /** Headline principal do hub (pode conter marcadores para text-gradient) */
  headline: string;
  /** Subhead de apoio, 1-2 linhas com a dor */
  subhead: string;
  /** 3 bullets do que o leitor vai encontrar neste hub */
  valueProp: readonly string[];
  /** 3-4 dores específicas do cluster */
  painPoints: readonly string[];
  /** Estatísticas/provas sociais usadas no hub */
  stats: readonly { value: string; label: string }[];
  primaryCta: LeadCta;
  /** CTA secundário opcional (ex: WhatsApp para clusters urgentes) */
  secondaryCta?: LeadCta;
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

// ── Constantes compartilhadas ──────────────────────────────────────────
/** Número placeholder do WhatsApp (substituir pelo número real do escritório) */
export const WHATSAPP_NUMBER = '5500000000000';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function whatsappUrl(text: string): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
}

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/people/VR-Advogados/61552954863571/',
  instagram: 'https://www.instagram.com/vradvogados.com.br/',
  linkedin: 'https://www.linkedin.com/company/vr-advogados/',
  youtube: 'https://www.youtube.com/channel/UCXd8xI1yMraXq_kjRATWh-A',
} as const;

export interface Office {
  city: string;
  state: string;
  address: string;
}

export const OFFICES = [
  {
    city: 'Rio de Janeiro',
    state: 'RJ',
    address: 'Av. das Américas, 3500 - Barra da Tijuca, Rio de Janeiro - RJ, 22640-102',
  },
  {
    city: 'Colatina',
    state: 'ES',
    address: 'Rua Michel Dalla, 66 - Centro, Colatina - ES, 29700-100',
  },
  {
    city: 'São Paulo',
    state: 'SP',
    address: 'Av. Paulista, 1842 - T Norte - 17° andar - Bela Vista, São Paulo – SP, 01310-945',
  },
  {
    city: 'Vitória',
    state: 'ES',
    address: 'R. Ten. Mário Francisco Brito, 854-998 - Enseada do Suá, Vitória - ES, 29050-555 - sala 1704 - 17 andar',
  },
] as const satisfies readonly Office[];

// ── Estratégia de CTAs ─────────────────────────────────────────────────
// WhatsApp (direto): URGÊNCIA — já está com oficial, veículo apreendido,
//   bloqueio judicial. Precisa falar AGORA com um humano.
// Form /diagnostico-inicial/ (diagnostic): TODO O RESTO — precisa coletar
//   dados antes do contato (investigação, informational, comparação, PJ).
// Checklist: leva à página de checklist, que tem seu próprio CTA ao final.
// ───────────────────────────────────────────────────────────────────────

export const CLUSTERS = [
  {
    slug: 'busca-e-apreensao',
    hubRoute: '/busca-e-apreensao/',
    title: 'Busca e apreensão de veículo',
    shortTitle: 'Busca e apreensão',
    summary:
      'Orientação para quem teve o veículo apreendido ou recebeu visita de oficial de justiça. Descubra seus direitos antes de falar com o banco.',
    tagline: 'Oficial na porta? Calma. Respira. Liga na VR.',
    headline: 'Recuperar veículo apreendido é urgência. E urgência a gente trata como guerra.',
    subhead:
      'Se o oficial de justiça bateu, você tem poucas horas para agir. Não assine nada, não entregue documento e não aceite proposta de quitação antes de saber se a dívida está mesmo certa.',
    valueProp: [
      'O que fazer na hora da busca e apreensão',
      'Como verificar se o mandado está regular',
      'Quando o veículo de trabalho ou de família tem proteção',
    ],
    painPoints: [
      "Oficial de justiça chegou sem aviso e eu não sei o que fazer",
      "Estão ameaçando levar o carro que eu uso para trabalhar",
      "O banco falou que entregar o veículo quita a dívida, mas eu duvido",
      "Perdi o carro e preciso saber se ainda dá para reverter",
    ],
    stats: [
      { value: '24h', label: 'Para travar a piora do caso' },
      { value: '+11 mil', label: 'Processos ativos da VR' },
      { value: 'R$ 500M+', label: 'Negociados contra bancos' },
    ],
    primaryCta: {
      type: 'whatsapp',
      label: 'Falar com advogado agora',
      href: whatsappUrl('Oficial de justiça na porta —_preciso de orientação urgente'),
      position: 'hub_hero',
    },
    secondaryCta: {
      type: 'diagnostic',
      label: 'Solicitar análise por e-mail',
      href: '/diagnostico-inicial/?problema=busca-e-apreensao',
      position: 'hub_hero_secondary',
    },
    checklistRoute: '/checklist-busca-e-apreensao/',
  },
  {
    slug: 'juros-abusivos',
    hubRoute: '/juros-abusivos/',
    title: 'Juros abusivos e revisão de contrato',
    shortTitle: 'Juros abusivos',
    summary:
      'Identifique juros abusivos, tarifas indevidas e seguros embutidos no seu financiamento. Recupere o que o banco cobrou a mais com estratégia.',
    tagline: 'O banco cobrou caro. A gente cobra certo.',
    headline: 'Seu contrato pode estar sangrando dinheiro. Vamos achando essa brecha.',
    subhead:
      'CET acima da realidade, tarifas fantasmas, seguro empurrado e parcela que nunca baixa. Tudo isso é passível de revisão. Antes de processar, a gente mapeia o quanto você pagou a mais.',
    valueProp: [
      'Como comparar seu contrato com a taxa média do Bacen',
      'Quando uma ação revisional compensa financeiramente',
      'Tarifas e seguros que não deveriam estar ali',
    ],
    painPoints: [
      "Pago financiamento há anos e a dívida não diminui",
      "O banco incluiu seguro e eu não sabia",
      "A taxa que me venderam é muito maior do que o mercado cobra",
      "Quero saber se vale a pena entrar com ação revisional",
    ],
    stats: [
      { value: '30%+', label: 'Dos contratos analisados têm erros visíveis' },
      { value: 'R$ 500M+', label: 'Em negociações e revisões forçadas' },
      { value: '14 anos', label: 'Só no Direito Bancário' },
    ],
    primaryCta: {
      type: 'diagnostic',
      label: 'Solicitar análise do contrato',
      href: '/diagnostico-inicial/?problema=juros-abusivos',
      position: 'hub_hero',
    },
    secondaryCta: {
      type: 'whatsapp',
      label: 'Enviar contrato no WhatsApp',
      href: whatsappUrl('Quero analisar meu contrato para juros abusivos'),
      position: 'hub_hero_secondary',
    },
    checklistRoute: '/checklist-juros-abusivos/',
  },
  {
    slug: 'dividas-pj',
    hubRoute: '/dividas-pj/',
    title: 'Dívidas bancárias PJ',
    shortTitle: 'Dívidas PJ',
    summary:
      'Defesa para empresas contra execuções bancárias, bloqueios judiciais e capital de giro abusivo. Recupere o controle financeiro do seu negócio antes que ele pare.',
    tagline: 'Sua empresa não para porque o banco resolveu apertar.',
    headline: 'Bloqueio em conta PJ? Execução bancária? A defesa começa agora.',
    subhead:
      'Capital de giro com juros estratosféricos, CCB assinada sem leitura, avalista sendo cobrado junto. Empresa tem prazos menores e riscos maiores — a estratégia tem que ser cirúrgica.',
    valueProp: [
      'Como reagir a bloqueio judicial imediato',
      'Análise de CCB, capital de giro e garantias',
      'Negociação e defesa sem paralisar o negócio',
    ],
    painPoints: [
      "Bloquearam a conta da empresa e não posso pagar folha",
      "O banco executa uma dívida que não reconheço",
      "Capital de giro comeu o fluxo de caixa",
      "Sou avalista e agora querem cobrar de mim",
    ],
    stats: [
      { value: '+1.500', label: 'Empresas atendidas' },
      { value: 'R$ 150M+', label: 'Em dívidas PJ contestadas' },
      { value: '48h', label: 'Para primeira resposta estratégica' },
    ],
    primaryCta: {
      type: 'diagnostic',
      label: 'Solicitar análise do caso PJ',
      href: '/diagnostico-inicial/?problema=dividas-pj',
      position: 'hub_hero',
    },
    secondaryCta: {
      type: 'whatsapp',
      label: 'Falar com advogado PJ',
      href: whatsappUrl('Preciso de advogado para dívida bancária PJ'),
      position: 'hub_hero_secondary',
    },
    checklistRoute: '/checklist-divida-pj/',
  },
  {
    slug: 'superendividamento',
    hubRoute: '/superendividamento/',
    title: 'Superendividamento',
    shortTitle: 'Superendividamento',
    summary:
      'Mínimo existencial, renegociação e quais dívidas entram na Lei do Superendividamento. Veja se você tem saída legal sem vender dignidade.',
    tagline: 'Nenhuma dívida vale sua sobrevivência.',
    headline: 'Compro metade do salário em dívida? A Lei pode te proteger.',
    subhead:
      'Superendividamento não é sinônimo de dívida alta. É quando o que você deve consome a sua capacidade de viver com dignidade. A Lei 14.597/23 criou ferramentas; aqui você entende quais cabem no seu caso.',
    valueProp: [
      'Quais dívidas entram no superendividamento',
      'Como funciona o mínimo existencial',
      'Quando o banco é obrigado a negociar de verdade',
    ],
    painPoints: [
      "Pago metade do salário só em parcelas",
      "Já renegociei e a dívida continua crescendo",
      "O banco não aceita negociar de forma justa",
      "Preciso saber o que a nova lei muda no meu caso",
    ],
    stats: [
      { value: '40%+', label: 'Da renda comprometida = alerta vermelho' },
      { value: '9K+', label: 'Famílias orientadas' },
      { value: '2023', label: 'Lei que mudou a regra do jogo' },
    ],
    primaryCta: {
      type: 'diagnostic',
      label: 'Ver se meu caso se encaixa',
      href: '/diagnostico-inicial/?problema=superendividamento',
      position: 'hub_hero',
    },
    secondaryCta: {
      type: 'whatsapp',
      label: 'Conversar sobre minha dívida',
      href: whatsappUrl('Preciso entender se estou superendividado'),
      position: 'hub_hero_secondary',
    },
  },
  {
    slug: 'cobrancas-fraudes',
    hubRoute: '/cobrancas-indevidas/',
    title: 'Cobranças indevidas e fraudes bancárias',
    shortTitle: 'Cobranças e fraudes',
    summary:
      'Negativação indevida, cobrança sem contrato, empréstimo não autorizado e golpe do Pix. Defenda seu nome, seu dinheiro e seus direitos.',
    tagline: 'Se não foi você, não é sua.',
    headline: 'Cobrança errada e nome sujo? A gente limpa essa zona.',
    subhead:
      'Emprestimo que você não fez, assinatura forjada, cobrança de tarifa não contratada ou Pix feito por golpe. O banco tem responsabilidade e você não precisa aceitar o prejuízo sozinho.',
    valueProp: [
      'Como provar que a cobrança é indevida',
      'Responsabilidade do banco em golpes do Pix',
      'Procedimento para limpar nome nos órgãos',
    ],
    painPoints: [
      "Meu nome foi negativado por dívida que não reconheço",
      "Cai no golpe do Pix e o banco não quer reembolsar",
      "Apareceu empréstimo no meu nome que eu não contratei",
      "Cobrança autônoma ou tarifa não combinada",
    ],
    stats: [
      { value: '+1.075', label: 'Avaliações 5 estrelas' },
      { value: '95%', label: 'Dos casos indevidos são documentáveis' },
      { value: '7 dias', label: 'Prazo médio para iniciar defesa' },
    ],
    primaryCta: {
      type: 'diagnostic',
      label: 'Relatar cobrança ou fraude',
      href: '/diagnostico-inicial/?problema=cobrancas-fraudes',
      position: 'hub_hero',
    },
    secondaryCta: {
      type: 'whatsapp',
      label: 'Falar sobre golpe/cobrança',
      href: whatsappUrl('Tenho cobrança indevida ou fraude no meu nome'),
      position: 'hub_hero_secondary',
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
    ctaType: 'diagnostic',
  },
  {
    route: '/capital-de-giro-juros-abusivos/',
    slug: 'capital-de-giro-juros-abusivos',
    title: 'Capital de giro com juros altos: como organizar a análise',
    cluster: 'dividas-pj',
    intent: 'commercial-investigation',
    primaryKeyword: 'capital de giro juros abusivos',
    ctaType: 'diagnostic',
  },
  {
    route: '/bloqueio-judicial-conta-pj/',
    slug: 'bloqueio-judicial-conta-pj',
    title: 'Bloqueio judicial em conta PJ: o que levantar de informação',
    cluster: 'dividas-pj',
    intent: 'urgent',
    primaryKeyword: 'bloqueio judicial conta PJ',
    ctaType: 'diagnostic',
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
    ctaType: 'diagnostic',
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
      href: whatsappUrl('Tenho documentos sobre busca e apreensão'),
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
      type: 'diagnostic',
      label: 'Solicitar análise do caso PJ',
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

