import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const cluster = z.enum([
  'busca-e-apreensao',
  'juros-abusivos',
  'dividas-pj',
  'superendividamento',
  'cobrancas-indevidas',
  'fraudes-bancarias',
]);

const ctaType = z.enum(['whatsapp', 'diagnostic', 'checklist', 'form']);
const oabRisk = z.enum(['low', 'medium', 'high']);

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    slug: z.string(),
    status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
    title: z.string(),
    seoTitle: z.string(),
    metaDescription: z.string().max(170),
    cluster,
    intent: z.enum(['informational', 'urgent', 'commercial-investigation', 'comparison', 'checklist']),
    author: z.string(),
    reviewedBy: z.string().optional(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    imageAlt: z.string().optional(),
    summary: z.string(),
    primaryKeyword: z.string(),
    secondaryKeywords: z.array(z.string()).default([]),
    relatedArticles: z.array(z.string()).default([]),
    ctaType,
    requiredDocuments: z.array(z.string()).default([]),
    sources: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    oabRisk,
    noindex: z.boolean().default(false),
    canonical: z.string().optional(),
  }),
});

const hubs = defineCollection({
  loader: glob({ base: './src/content/hubs', pattern: '**/*.{json,yaml,yml}' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    seoTitle: z.string(),
    metaDescription: z.string().max(170),
    cluster: z.string(),
    summary: z.string(),
    priorityArticles: z.array(z.string()).default([]),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
    ctaType,
  }),
});

const glossary = defineCollection({
  loader: glob({ base: './src/content/glossary', pattern: '**/*.{json,yaml,yml}' }),
  schema: z.object({
    term: z.string(),
    slug: z.string(),
    definition: z.string(),
    cluster: z.string(),
    relatedArticles: z.array(z.string()).default([]),
  }),
});

const briefs = defineCollection({
  loader: glob({ base: './src/content/briefs', pattern: '**/*.{json,yaml,yml}' }),
  schema: z.object({
    theme: z.string(),
    cluster: z.string(),
    searchIntent: z.string(),
    userPain: z.string(),
    mainQuestion: z.string(),
    shortAnswer: z.string(),
    keywords: z.array(z.string()).default([]),
    internalLinks: z.array(z.string()).default([]),
    recommendedCta: z.string(),
    requiredDocuments: z.array(z.string()).default([]),
    officialSources: z.array(z.string()).default([]),
    oabRisk: z.string(),
    conversionHypothesis: z.string(),
    status: z.enum(['idea', 'approved', 'written', 'published']).default('idea'),
  }),
});

export const collections = { articles, hubs, glossary, briefs };
