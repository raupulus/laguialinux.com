import { expect } from '../harness/assert.mjs';
import { FeedsAndSeoEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F69: Head Auto-Discovery Links (<link rel="alternate" type="application/rss+xml">)',
  tier: 1,
  tests: [
    {
      name: 'F69.1: Injects master RSS and Atom auto-discovery link tags in root page head',
      async run() {
        const links = FeedsAndSeoEngine.getAutoDiscoveryLinks('/', 'laguialinux');
        expect(links.length).toBeGreaterThanOrEqual(2);

        const rssLink = links.find(l => l.type === 'application/rss+xml');
        expect(rssLink).toBeTruthy();
        expect(rssLink.href).toBe('/feed.xml');
        expect(rssLink.rel).toBe('alternate');
      }
    },
    {
      name: 'F69.2: Injects Atom format auto-discovery link (type: application/atom+xml)',
      async run() {
        const links = FeedsAndSeoEngine.getAutoDiscoveryLinks('/', 'laguialinux');
        const atomLink = links.find(l => l.type === 'application/atom+xml');

        expect(atomLink).toBeTruthy();
        expect(atomLink.href).toBe('/feed.atom');
      }
    },
    {
      name: 'F69.3: On category pages, injects category-specific feed auto-discovery link',
      async run() {
        const links = FeedsAndSeoEngine.getAutoDiscoveryLinks('/categoria/comandos', 'laguialinux');
        const catLink = links.find(l => l.href === '/comandos/feed.xml');

        expect(catLink).toBeTruthy();
        expect(catLink.title).toContain('comandos');
      }
    },
    {
      name: 'F69.4: Auto-discovery title matches tenant identity',
      async run() {
        const guidesLinks = FeedsAndSeoEngine.getAutoDiscoveryLinks('/', 'laguialinux');
        const newsLinks = FeedsAndSeoEngine.getAutoDiscoveryLinks('/', 'news');

        expect(guidesLinks[0].title).toContain('La Guía Linux');
        expect(newsLinks[0].title).toContain('Noticias Linux');
      }
    },
    {
      name: 'F69.5: Dynamic page transitions update auto-discovery links without creating duplicates',
      async run() {
        const linksHome = FeedsAndSeoEngine.getAutoDiscoveryLinks('/', 'laguialinux');
        const linksCat = FeedsAndSeoEngine.getAutoDiscoveryLinks('/categoria/almacenamiento', 'laguialinux');

        const hrefsHome = new Set(linksHome.map(l => l.href));
        const hrefsCat = new Set(linksCat.map(l => l.href));

        expect(hrefsHome.size).toBe(linksHome.length);
        expect(hrefsCat.size).toBe(linksCat.length);
      }
    }
  ]
};
