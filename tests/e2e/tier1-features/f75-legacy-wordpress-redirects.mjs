import { expect } from '../harness/assert.mjs';
import { LegacyRedirectEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F75: Legacy WordPress Redirects Engine (301 Permanent Redirections)',
  tier: 1,
  tests: [
    {
      name: 'F75.1: Resolves WordPress post shortlinks (?p=ID) to canonical guide URLs',
      async run() {
        const target = LegacyRedirectEngine.resolve('/', { p: 18 });
        expect(target).toBe('/guia/comandos-linux-gestionar-archivos-y-directorios');

        const blogTarget = LegacyRedirectEngine.resolve('/', { p: 1049 });
        expect(blogTarget).toBe('/blog/analizando-debian');
      }
    },
    {
      name: 'F75.2: Resolves legacy static pages and shortlinks (?page_id=ID)',
      async run() {
        const contactTarget = LegacyRedirectEngine.resolve('/', { page_id: 327 });
        expect(contactTarget).toBe('/contacto');

        const aboutPath = LegacyRedirectEngine.resolve('/sobre-laguialinux');
        expect(aboutPath).toBe('/sobre-nosotros');

        const privacyPath = LegacyRedirectEngine.resolve('/politica-de-privacidad');
        expect(privacyPath).toBe('/privacidad');
      }
    },
    {
      name: 'F75.3: Resolves WordPress search (?s=QUERY) to /buscar?q=QUERY',
      async run() {
        const searchTarget = LegacyRedirectEngine.resolve('/', { s: 'systemctl' });
        expect(searchTarget).toBe('/buscar?q=systemctl');

        const emptySearch = LegacyRedirectEngine.resolve('/', { s: '' });
        expect(emptySearch).toBe('/guias');
      }
    },
    {
      name: 'F75.4: Resolves category feeds to /{category}/feed.xml and master feed to /feed.xml',
      async run() {
        const catFeed = LegacyRedirectEngine.resolve('/category/redes/feed');
        expect(catFeed).toBe('/redes/feed.xml');

        const globalFeed = LegacyRedirectEngine.resolve('/feed');
        expect(globalFeed).toBe('/feed.xml');

        const rssParam = LegacyRedirectEngine.resolve('/', { feed: 'rss2' });
        expect(rssParam).toBe('/feed.xml');
      }
    },
    {
      name: 'F75.5: Normalizes plural guide routes (/guias/{slug}) to singular (/guia/{slug})',
      async run() {
        const normalized = LegacyRedirectEngine.resolve('/guias/comandos-indispensables-para-linux');
        expect(normalized).toBe('/guia/comandos-indispensables-para-linux');
      }
    }
  ]
};
