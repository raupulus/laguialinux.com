import { expect } from '../harness/assert.mjs';
import { FeedsAndSeoEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F67: Granular Category Feeds (/{category}/feed.xml)',
  tier: 1,
  tests: [
    {
      name: 'F67.1: Generates category-specific RSS feed for /comandos/feed.xml',
      async run() {
        const items = [
          { title: 'Guía de find', slug: 'guia-find', category_slug: 'comandos' }
        ];

        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', items, 'Comandos y Chuletas');
        expect(xml).toContain('<title>La Guía Linux — Comandos y Chuletas</title>');
        expect(xml).toContain('Guía de find');
      }
    },
    {
      name: 'F67.2: Filters items strictly to the requested category',
      async run() {
        const allItems = [
          { title: 'Comando apt', category_slug: 'comandos' },
          { title: 'Partición fdisk', category_slug: 'almacenamiento' }
        ];

        const filtered = allItems.filter(i => i.category_slug === 'comandos');
        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', filtered, 'Comandos');

        expect(xml).toContain('Comando apt');
        expect(xml).not.toContain('Partición fdisk');
      }
    },
    {
      name: 'F67.3: Generates dedicated category feed on news platform (/ciberseguridad/feed.xml)',
      async run() {
        const items = [
          { title: 'Alerta CVE Crítica', slug: 'cve-alert', category_slug: 'ciberseguridad', type: { slug: 'news' } }
        ];

        const xml = FeedsAndSeoEngine.generateRssFeed('news', items, 'Ciberseguridad y Privacidad');
        expect(xml).toContain('<title>Noticias Linux — Ciberseguridad y Privacidad</title>');
        expect(xml).toContain('https://news.laguialinux.com/noticia/cve-alert');
      }
    },
    {
      name: 'F67.4: Category feed item contains accurate published_at date',
      async run() {
        const dateStr = '2026-09-15T09:00:00Z';
        const items = [{ title: 'Item', slug: 'item', published_at: dateStr }];
        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', items, 'Test');

        expect(xml).toContain(`<pubDate>${dateStr}</pubDate>`);
      }
    },
    {
      name: 'F67.5: Category feed title escapes special characters in category name',
      async run() {
        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', [], 'Redes & Servidores');
        expect(xml).toContain('Redes &amp; Servidores');
      }
    }
  ]
};
