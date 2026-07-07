import { describe, expect, it } from 'vitest';
import {
  ARTICLE_ROUTES,
  CLUSTERS,
  HOMEPAGE_PRIMARY_HUBS,
  REQUIRED_TRACKING_EVENTS,
  getClusterBySlug,
} from '../src/lib/taxonomy';

const routePattern = /^\/[a-z0-9-]+\/$/;

describe('lead engine taxonomy', () => {
  it('exposes the five commercial hubs planned for the MVP homepage', () => {
    expect(CLUSTERS).toHaveLength(5);
    expect(HOMEPAGE_PRIMARY_HUBS).toEqual(CLUSTERS.map((cluster) => cluster.slug));

    for (const cluster of CLUSTERS) {
      expect(cluster.hubRoute).toMatch(routePattern);
      expect(cluster.title.length).toBeGreaterThan(8);
      expect(cluster.summary.length).toBeGreaterThan(40);
      expect(cluster.primaryCta.type).toMatch(/^(whatsapp|diagnostic|checklist|form)$/);
    }
  });

  it('keeps all initial article routes lowercase, canonical, and linked to a valid cluster', () => {
    expect(ARTICLE_ROUTES).toHaveLength(26);

    for (const article of ARTICLE_ROUTES) {
      expect(article.route).toMatch(routePattern);
      expect(getClusterBySlug(article.cluster)?.slug).toBe(article.cluster);
      expect(article.title).not.toMatch(/garantid|certeza|limpe seu nome agora/i);
    }
  });

  it('covers the launch tracking contract before traffic exists', () => {
    expect(REQUIRED_TRACKING_EVENTS).toEqual(
      expect.arrayContaining([
        'article_view',
        'hub_view',
        'cta_view',
        'cta_click',
        'whatsapp_click',
        'diagnostic_submit',
        'checklist_complete',
        'generate_lead',
      ]),
    );
  });
});
