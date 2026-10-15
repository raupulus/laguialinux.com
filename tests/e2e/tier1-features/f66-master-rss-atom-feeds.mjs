import { expect } from '../harness/assert.mjs';
import { FeedsAndSeoEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F66: Master RSS 2.0 & Atom Feeds (/feed.xml)',
  tier: 1,
  tests: [
    {
      name: 'F66.1: Generates valid RSS 2.0 XML with channel, title, link and description',
      async run() {
        const items = [
          { title: 'Guía de find', slug: 'guia-find', excerpt: 'Uso de find en GNU/Linux', published_at: '2026-10-01T10:00:00Z' }
        ];

        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', items);
        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).toContain('<rss version="2.0"');
        expect(xml).toContain('<title>La Guía Linux</title>');
        expect(xml).toContain('<link>https://laguialinux.com</link>');
        expect(xml).toContain('<item>');
        expect(xml).toContain('Guía de find');
      }
    },
    {
      name: 'F66.2: Generates valid Atom 1.0 XML syndication feed',
      async run() {
        const items = [
          { title: 'Nueva versión del Kernel Linux', slug: 'kernel-release', excerpt: 'Actualización estable', published_at: '2026-10-02T12:00:00Z' }
        ];

        const xml = FeedsAndSeoEngine.generateAtomFeed('news', items);
        expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
        expect(xml).toContain('<title>Noticias Linux</title>');
        expect(xml).toContain('<entry>');
        expect(xml).toContain('Nueva versión del Kernel Linux');
      }
    },
    {
      name: 'F66.3: Escapes XML special characters (&, <, >, ", \') in titles and excerpts',
      async run() {
        const items = [
          { title: 'Comandos & Trucos <Linux> "Avanzados"', slug: 'trucos', excerpt: 'Guía de BASH & ZSH', published_at: '2026-10-03T00:00:00Z' }
        ];

        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', items);
        expect(xml).toContain('&amp;');
        expect(xml).toContain('&lt;Linux&gt;');
        expect(xml).toContain('&quot;Avanzados&quot;');
        expect(xml).not.toContain('<Linux>');
      }
    },
    {
      name: 'F66.4: Items include permalink GUID pointing to canonical publication URL',
      async run() {
        const items = [
          { title: 'Guía swap', slug: 'guia-swap', type: { slug: 'guide' } }
        ];

        const xml = FeedsAndSeoEngine.generateRssFeed('laguialinux', items);
        expect(xml).toContain('<guid isPermaLink="true">https://laguialinux.com/guia/guia-swap</guid>');
      }
    },
    {
      name: 'F66.5: News tenant master feed reflects Noticias Linux title and domain',
      async run() {
        const xml = FeedsAndSeoEngine.generateRssFeed('news', []);
        expect(xml).toContain('<title>Noticias Linux</title>');
        expect(xml).toContain('<link>https://news.laguialinux.com</link>');
      }
    }
  ]
};
