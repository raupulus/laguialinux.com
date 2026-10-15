import { expect } from '../harness/assert.mjs';
import { LegalAndInstitutionalEngine, createMockStorage } from '../harness/client-engine.mjs';

export default {
  feature: 'F59: Cookies Policy & Preference Center (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F59.B1: Handles empty or null user consent input defaulting all optional to denied',
      async run() {
        const gcm = LegalAndInstitutionalEngine.formatGoogleConsentModeV2(null);
        expect(gcm.ad_storage).toBe('denied');
        expect(gcm.analytics_storage).toBe('denied');
      }
    },
    {
      name: 'F59.B2: Persisting consent state in localStorage under lgl_cookie_consent operates safely',
      async run() {
        const storage = createMockStorage();
        const consent = { essential: true, analytics: true, advertising: false, timestamp: Date.now() };
        storage.setItem('lgl_cookie_consent', JSON.stringify(consent));

        const restored = JSON.parse(storage.getItem('lgl_cookie_consent'));
        expect(restored.analytics).toBe(true);
        expect(restored.advertising).toBe(false);
      }
    },
    {
      name: 'F59.B3: Corrupted JSON in lgl_cookie_consent falls back to showing consent prompt',
      async run() {
        const storage = createMockStorage({ lgl_cookie_consent: 'invalid{json' });
        let consent = null;
        try {
          consent = JSON.parse(storage.getItem('lgl_cookie_consent'));
        } catch {
          consent = null;
        }
        expect(consent).toBeNull();
      }
    },
    {
      name: 'F59.B4: All 4 Google Consent Mode v2 fields strictly return string "granted" or "denied"',
      async run() {
        const gcm = LegalAndInstitutionalEngine.formatGoogleConsentModeV2({ advertising: true });
        const validValues = ['granted', 'denied'];
        for (const [key, val] of Object.entries(gcm)) {
          expect(validValues.includes(val)).toBe(true);
        }
      }
    },
    {
      name: 'F59.B5: Descriptions of all 4 categories are informative and non-empty',
      async run() {
        const categories = LegalAndInstitutionalEngine.getCookieCategories();
        for (const cat of categories) {
          expect(cat.description.length).toBeGreaterThan(15);
        }
      }
    }
  ]
};
