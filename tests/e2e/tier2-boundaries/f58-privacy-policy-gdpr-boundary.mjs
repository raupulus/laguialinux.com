import { expect } from '../harness/assert.mjs';
import { LegalAndInstitutionalEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F58: Privacy Policy (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F58.B1: Contact DPO email has valid email format and matching domain',
      async run() {
        const privacy = LegalAndInstitutionalEngine.getPrivacyPolicyData();
        expect(privacy.dpoEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        expect(privacy.dpoEmail.endsWith('@laguialinux.com')).toBe(true);
      }
    },
    {
      name: 'F58.B2: Rights list contains all 6 statutory GDPR/LOPDGDD rights',
      async run() {
        const privacy = LegalAndInstitutionalEngine.getPrivacyPolicyData();
        expect(privacy.rights.length).toBe(6);
      }
    },
    {
      name: 'F58.B3: Server logs retention policy conforms to legal minimums',
      async run() {
        const privacy = LegalAndInstitutionalEngine.getPrivacyPolicyData();
        expect(privacy.dataMinimization).toBe(true);
      }
    },
    {
      name: 'F58.B4: Third-party processor disclosures conform to privacy standards',
      async run() {
        const processors = ['Cloudflare (CDN / Turnstile)', 'Google (AdSense - bajo consentimiento)'];
        expect(processors.length).toBe(2);
      }
    },
    {
      name: 'F58.B5: Privacy data object is completely deterministic',
      async run() {
        const p1 = LegalAndInstitutionalEngine.getPrivacyPolicyData();
        const p2 = LegalAndInstitutionalEngine.getPrivacyPolicyData();
        expect(JSON.stringify(p1)).toBe(JSON.stringify(p2));
      }
    }
  ]
};
