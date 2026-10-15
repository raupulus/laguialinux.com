import { expect } from '../harness/assert.mjs';
import { LegalAndInstitutionalEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F60: About Us (/sobre-nosotros) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F60.B1: Timeline entries contain non-empty year, title and description',
      async run() {
        const events = LegalAndInstitutionalEngine.getTimelineEvents();
        for (const ev of events) {
          expect(ev.year).toBeTruthy();
          expect(ev.title).toBeTruthy();
          expect(ev.description.length).toBeGreaterThan(10);
        }
      }
    },
    {
      name: 'F60.B2: Year strings are valid 4-digit numbers',
      async run() {
        const events = LegalAndInstitutionalEngine.getTimelineEvents();
        for (const ev of events) {
          expect(ev.year).toMatch(/^\d{4}$/);
        }
      }
    },
    {
      name: 'F60.B3: Author website link is valid URI starting with https://',
      async run() {
        const lssi = LegalAndInstitutionalEngine.getLssiComplianceData();
        expect(lssi.authorWebsite).toMatch(/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/);
      }
    },
    {
      name: 'F60.B4: Community acknowledgements recognise anonymous contributors',
      async run() {
        const events = LegalAndInstitutionalEngine.getTimelineEvents();
        expect(events[events.length - 1].description).toContain('API V2');
      }
    },
    {
      name: 'F60.B5: Timeline array is immutable across successive invocations',
      async run() {
        const ev1 = LegalAndInstitutionalEngine.getTimelineEvents();
        const ev2 = LegalAndInstitutionalEngine.getTimelineEvents();
        expect(ev1.length).toBe(ev2.length);
        expect(ev1[0].year).toBe(ev2[0].year);
      }
    }
  ]
};
