import { expect } from '../harness/assert.mjs';
import { LegalAndInstitutionalEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F58: Privacy Policy (/privacidad - GDPR / LOPDGDD Compliance)',
  tier: 1,
  tests: [
    {
      name: 'F58.1: GDPR compliance and data minimization policy verified',
      async run() {
        const privacy = LegalAndInstitutionalEngine.getPrivacyPolicyData();
        expect(privacy.gdprCompliant).toBe(true);
        expect(privacy.dataMinimization).toBe(true);
      }
    },
    {
      name: 'F58.2: Zero mandatory registration required for reading publications or using tools',
      async run() {
        const privacy = LegalAndInstitutionalEngine.getPrivacyPolicyData();
        expect(privacy.zeroMandatoryRegistration).toBe(true);
      }
    },
    {
      name: 'F58.3: Data protection contact mailbox points to public@laguialinux.com',
      async run() {
        const privacy = LegalAndInstitutionalEngine.getPrivacyPolicyData();
        expect(privacy.dpoEmail).toBe('public@laguialinux.com');
      }
    },
    {
      name: 'F58.4: Explicitly enumerates user rights under GDPR (Acceso, Rectificación, Supresión, etc.)',
      async run() {
        const privacy = LegalAndInstitutionalEngine.getPrivacyPolicyData();
        expect(privacy.rights).toContain('Acceso');
        expect(privacy.rights).toContain('Rectificación');
        expect(privacy.rights).toContain('Supresión');
        expect(privacy.rights).toContain('Oposición');
      }
    },
    {
      name: 'F58.5: Strict Privacy: Zero occurrences of private email in privacy documentation',
      async run() {
        const privacy = LegalAndInstitutionalEngine.getPrivacyPolicyData();
        const jsonStr = JSON.stringify(privacy);
        const forbiddenEmail = ['raupulus', 'gmail.com'].join('@');
        expect(jsonStr).not.toContain(forbiddenEmail);
      }
    }
  ]
};
