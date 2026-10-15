import { expect } from '../harness/assert.mjs';
import { LegalAndInstitutionalEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F60: About Us (/sobre-nosotros - Historical Timeline & Author Profile)',
  tier: 1,
  tests: [
    {
      name: 'F60.1: Chronological timeline spans 2001 through 2026 milestone history',
      async run() {
        const events = LegalAndInstitutionalEngine.getTimelineEvents();
        expect(events.length).toBeGreaterThanOrEqual(4);
        expect(events[0].year).toBe('2001');
        expect(events[events.length - 1].year).toBe('2026');
      }
    },
    {
      name: 'F60.2: Author profile identifies Raúl Caro Pastorino with official links',
      async run() {
        const lssi = LegalAndInstitutionalEngine.getLssiComplianceData();
        expect(lssi.owner).toBe('Raúl Caro Pastorino');
        expect(lssi.authorNick).toBe('@raupulus');
        expect(lssi.authorWebsite).toBe('https://raupulus.dev');
        expect(lssi.authorEmail).toBe('public@raupulus.dev');
      }
    },
    {
      name: 'F60.3: Strict Privacy: Zero occurrences of private email in timeline and about data',
      async run() {
        const events = LegalAndInstitutionalEngine.getTimelineEvents();
        const str = JSON.stringify(events);
        const forbiddenEmail = ['raupulus', 'gmail.com'].join('@');
        expect(str).not.toContain(forbiddenEmail);
      }
    },
    {
      name: 'F60.4: Highlights project mission of independent sysadmin education and open source',
      async run() {
        const events = LegalAndInstitutionalEngine.getTimelineEvents();
        const hasMission = events.some(e => e.description.includes('Debian') || e.description.includes('GNU/Linux'));
        expect(hasMission).toBe(true);
      }
    },
    {
      name: 'F60.5: Timeline events sorted in ascending chronological order',
      async run() {
        const events = LegalAndInstitutionalEngine.getTimelineEvents();
        for (let i = 0; i < events.length - 1; i++) {
          const y1 = parseInt(events[i].year, 10);
          const y2 = parseInt(events[i + 1].year, 10);
          expect(y1).toBeLessThanOrEqual(y2);
        }
      }
    }
  ]
};
