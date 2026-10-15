import { expect } from '../harness/assert.mjs';
import { FeedsAndSeoEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F69: Head Auto-Discovery Links (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F69.B1: Root path with trailing slash (/categoria/comandos/) parses category slug cleanly',
      async run() {
        const links = FeedsAndSeoEngine.getAutoDiscoveryLinks('/categoria/comandos/', 'laguialinux');
        const catLink = links.find(l => l.href.includes('comandos'));
        expect(catLink).toBeTruthy();
      }
    },
    {
      name: 'F69.B2: Non-category path (e.g. /contacto) only exposes master feeds',
      async run() {
        const links = FeedsAndSeoEngine.getAutoDiscoveryLinks('/contacto', 'laguialinux');
        expect(links.length).toBe(2);
        expect(links.some(l => l.href === '/feed.xml')).toBe(true);
      }
    },
    {
      name: 'F69.B3: Null or undefined path parameter defaults safely to master feeds',
      async run() {
        const links = FeedsAndSeoEngine.getAutoDiscoveryLinks(null, 'laguialinux');
        expect(links.length).toBe(2);
      }
    },
    {
      name: 'F69.B4: MIME types strictly conform to RFC standards',
      async run() {
        const links = FeedsAndSeoEngine.getAutoDiscoveryLinks('/', 'laguialinux');
        const validMimes = ['application/rss+xml', 'application/atom+xml'];
        for (const l of links) {
          expect(validMimes.includes(l.type)).toBe(true);
        }
      }
    },
    {
      name: 'F69.B5: Subcategory path generates clean category-scoped link',
      async run() {
        const links = FeedsAndSeoEngine.getAutoDiscoveryLinks('/categoria/almacenamiento/particionado', 'laguialinux');
        expect(links.some(l => l.href === '/almacenamiento/feed.xml')).toBe(true);
      }
    }
  ]
};
