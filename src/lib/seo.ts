import type { ArticleRoute, Cluster } from './taxonomy';

export const SITE_URL = 'https://blog.vradvogados.com.br';

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: 'VR Advogados',
    url: 'https://vradvogados.com.br',
    areaServed: 'BR',
    sameAs: ['https://vradvogados.com.br'],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Blog VR Advogados',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function collectionPageSchema(cluster: Cluster) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cluster.title,
    description: cluster.summary,
    url: absoluteUrl(cluster.hubRoute),
    isPartOf: { '@type': 'WebSite', name: 'Blog VR Advogados', url: SITE_URL },
  };
}

export function articleSchema(article: ArticleRoute, cluster: Cluster, publishedAt?: string, updatedAt?: string, heroImage?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: `Guia informativo sobre ${article.primaryKeyword}, com documentos, erros comuns e próximos passos seguros.`,
    url: absoluteUrl(article.route),
    datePublished: publishedAt ?? new Date().toISOString().split('T')[0],
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    ...(heroImage ? { image: absoluteUrl(heroImage) } : {}),
    articleSection: cluster.shortTitle,
    author: {
      '@type': 'Person',
      name: 'VR Advogados',
      url: 'https://vradvogados.com.br',
    },
    publisher: { '@type': 'Organization', name: 'VR Advogados' },
    mainEntityOfPage: absoluteUrl(article.route),
  };
}
