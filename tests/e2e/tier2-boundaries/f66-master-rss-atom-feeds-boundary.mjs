import { expect } from '../harness/assert.mjs';
import { FeedsAndSeoEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F66: Master RSS 2.0 & Atom Feeds (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F66.B1: Empty items list generates valid XML channel without item elements',
      async run() {
        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', []);
        expect(xml).toContain('<rss version="2.0"');
        expect(xml).not.toContain('<item>');
      }
    },
    {
      name: 'F66.B2: Item with missing excerpt handles gracefully with empty description',
      async run() {
        const items = [{ title: 'Sin extracto', slug: 'sin-extracto' }];
        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', items);
        expect(xml).toContain('<description></description>');
      }
    },
    {
      name: 'F66.B3: Non-string characters or symbols in title sanitized without throwing',
      async run() {
        expect(() => {
          FeedsAndSeoEngine.escapeXml(null);
          FeedsAndSeoEngine.escapeXml(undefined);
          FeedsAndSeoEngine.escapeXml('');
        }).not.toThrow();
      }
    },
    {
      name: 'F66.B4: Atom feed includes valid ISO 8601 updated timestamp',
      async run() {
        const xml = FeedsAndSeoEngine.generateAtomFeed('laguialinux', []);
        expect(xml).toMatch(/<updated>\d{4}-\d{2}-\d{2}T.*<\/updated>/);
      }
    },
    {
      name: 'F66.B5: Feed language tag is set to Spanish (<language>es</language>)',
      async run() {
        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', []);
        expect(xml).toContain('<language>es</language>');
      }
    }
  ]
};
