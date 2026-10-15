import { expect } from '../harness/assert.mjs';
import { LegalAndInstitutionalEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F59: Cookies Policy & Preference Center (/cookies)',
  tier: 1,
  tests: [
    {
      name: 'F59.1: Defines 4 distinct cookie categories (essential, analytics, preferences, advertising)',
      async run() {
        const categories = LegalAndInstitutionalEngine.getCookieCategories();
        expect(categories.length).toBe(4);

        const ids = categories.map(c => c.id);
        expect(ids).toContain('essential');
        expect(ids).toContain('analytics');
        expect(ids).toContain('preferences');
        expect(ids).toContain('advertising');
      }
    },
    {
      name: 'F59.2: Essential cookies are mandatory and non-toggleable (required: true)',
      async run() {
        const categories = LegalAndInstitutionalEngine.getCookieCategories();
        const essential = categories.find(c => c.id === 'essential');
        expect(essential.required).toBe(true);

        const advertising = categories.find(c => c.id === 'advertising');
        expect(advertising.required).toBe(false);
      }
    },
    {
      name: 'F59.3: Formats Google Consent Mode v2 granted payload when advertising and analytics accepted',
      async run() {
        const consent = { analytics: true, advertising: true };
        const gcm = LegalAndInstitutionalEngine.formatGoogleConsentModeV2(consent);

        expect(gcm.ad_storage).toBe('granted');
        expect(gcm.analytics_storage).toBe('granted');
        expect(gcm.ad_user_data).toBe('granted');
        expect(gcm.ad_personalization).toBe('granted');
      }
    },
    {
      name: 'F59.4: Formats Google Consent Mode v2 denied payload when user rejects optional cookies',
      async run() {
        const consent = { analytics: false, advertising: false };
        const gcm = LegalAndInstitutionalEngine.formatGoogleConsentModeV2(consent);

        expect(gcm.ad_storage).toBe('denied');
        expect(gcm.analytics_storage).toBe('denied');
        expect(gcm.ad_user_data).toBe('denied');
        expect(gcm.ad_personalization).toBe('denied');
      }
    },
    {
      name: 'F59.5: Supports granular partial consent (analytics granted, advertising denied)',
      async run() {
        const partialConsent = { analytics: true, advertising: false };
        const gcm = LegalAndInstitutionalEngine.formatGoogleConsentModeV2(partialConsent);

        expect(gcm.analytics_storage).toBe('granted');
        expect(gcm.ad_storage).toBe('denied');
      }
    }
  ]
};
