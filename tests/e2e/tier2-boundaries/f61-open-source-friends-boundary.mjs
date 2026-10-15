import { expect } from '../harness/assert.mjs';
import { LegalAndInstitutionalEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F61: Open Source Friends Directory (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F61.B1: Case-insensitive query matches regardless of uppercase/lowercase',
      async run() {
        const lower = LegalAndInstitutionalEngine.getFriendsDirectory('arch');
        const upper = LegalAndInstitutionalEngine.getFriendsDirectory('ARCH');
        expect(lower.length).toBe(upper.length);
        expect(lower.length).toBeGreaterThan(0);
      }
    },
    {
      name: 'F61.B2: Non-matching search query returns empty array without error',
      async run() {
        const res = LegalAndInstitutionalEngine.getFriendsDirectory('nonexistent-open-source-project-xyz');
        expect(res.length).toBe(0);
      }
    },
    {
      name: 'F61.B3: Non-existent category filter returns empty array',
      async run() {
        const res = LegalAndInstitutionalEngine.getFriendsDirectory('', 'CategoriaInexistente');
        expect(res.length).toBe(0);
      }
    },
    {
      name: 'F61.B4: Leading/trailing whitespace in search query is trimmed',
      async run() {
        const res = LegalAndInstitutionalEngine.getFriendsDirectory('   Debian   ');
        expect(res.length).toBeGreaterThan(0);
      }
    },
    {
      name: 'F61.B5: All 18 projects have valid HTTPS URLs starting with https://',
      async run() {
        const friends = LegalAndInstitutionalEngine.getFriendsDirectory();
        for (const item of friends) {
          expect(item.url.startsWith('https://')).toBe(true);
        }
      }
    }
  ]
};
