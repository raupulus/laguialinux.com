import { expect } from '../harness/assert.mjs';
import { LegalAndInstitutionalEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F61: Open Source Friends Directory (/amigos - 18 Initiatives)',
  tier: 1,
  tests: [
    {
      name: 'F61.1: Contains exactly 18 Hispanic open-source initiatives in the master catalog',
      async run() {
        const allFriends = LegalAndInstitutionalEngine.getFriendsDirectory();
        expect(allFriends.length).toBe(18);
      }
    },
    {
      name: 'F61.2: Categorizes projects across 6 distinct categories (Podcasts, Blogs, YouTube, Telegram, Asociaciones, Distribuciones)',
      async run() {
        const allFriends = LegalAndInstitutionalEngine.getFriendsDirectory();
        const categories = [...new Set(allFriends.map(f => f.category))];

        expect(categories).toContain('Podcasts');
        expect(categories).toContain('Blogs');
        expect(categories).toContain('YouTube');
        expect(categories).toContain('Telegram');
        expect(categories).toContain('Asociaciones');
        expect(categories).toContain('Distribuciones');
      }
    },
    {
      name: 'F61.3: Filters projects by category pill (e.g. category: Podcasts)',
      async run() {
        const podcasts = LegalAndInstitutionalEngine.getFriendsDirectory('', 'Podcasts');
        expect(podcasts.length).toBeGreaterThanOrEqual(8);
        expect(podcasts.every(p => p.category === 'Podcasts')).toBe(true);
      }
    },
    {
      name: 'F61.4: Real-time search filters initiatives by name or description',
      async run() {
        const searchDebian = LegalAndInstitutionalEngine.getFriendsDirectory('Debian');
        expect(searchDebian.length).toBeGreaterThan(0);
        expect(searchDebian[0].name).toContain('Debian');

        const searchSalmorejo = LegalAndInstitutionalEngine.getFriendsDirectory('Salmorejo');
        expect(searchSalmorejo.length).toBe(1);
        expect(searchSalmorejo[0].name).toContain('Salmorejo Geek');
      }
    },
    {
      name: 'F61.5: External links enforce rel="noopener noreferrer" for security and privacy',
      async run() {
        const allFriends = LegalAndInstitutionalEngine.getFriendsDirectory();
        const allSecure = allFriends.every(f => f.rel === 'noopener noreferrer');
        expect(allSecure).toBe(true);
      }
    }
  ]
};
