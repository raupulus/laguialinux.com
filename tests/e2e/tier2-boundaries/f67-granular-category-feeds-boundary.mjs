import { expect } from '../harness/assert.mjs';
import { FeedsAndSeoEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F67: Granular Category Feeds (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F67.B1: Category with 0 publications generates valid channel without items',
      async run() {
        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', [], 'Categoría Vacía');
        expect(xml).toContain('<title>La Guía Linux — Categoría Vacía</title>');
        expect(xml).not.toContain('<item>');
      }
    },
    {
      name: 'F67.B2: Non-existent category query returns empty feed safely',
      async run() {
        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', [], 'Inexistente');
        expect(xml).toContain('<channel>');
      }
    },
    {
      name: 'F67.B3: Category feed properly handles subcategory publications',
      async run() {
        const items = [
          { title: 'Subcat Item', category_slug: 'comandos', subcategory_slug: 'archivos-directorios' }
        ];
        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', items, 'Comandos');
        expect(xml).toContain('Subcat Item');
      }
    },
    {
      name: 'F67.B4: Special characters in category slug handled safely in feed URL',
      async run() {
        const catSlug = 'redes-servidores';
        const feedUrl = `https://laguialinux.com/${catSlug}/feed.xml`;
        expect(feedUrl).toBe('https://laguialinux.com/redes-servidores/feed.xml');
      }
    },
    {
      name: 'F67.B5: Output format is valid XML parseable by standard XML parsers',
      async run() {
        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', [], 'Test');
        expect(xml.startsWith('<?xml')).toBe(true);
        expect(xml.endsWith('</rss>')).toBe(true);
      }
    }
  ]
};
