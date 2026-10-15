import { expect } from '../harness/assert.mjs';
import { LegalAndInstitutionalEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F57: Dual Licensing Framework (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F57.B1: Canonical footer string uses middle dot separator character (·)',
      async run() {
        const lic = LegalAndInstitutionalEngine.getDualLicenseData();
        expect(lic.canonicalFooterNotice).toContain(' · ');
      }
    },
    {
      name: 'F57.B2: CC BY-SA 4.0 version number and international designation are exact',
      async run() {
        const lic = LegalAndInstitutionalEngine.getDualLicenseData();
        expect(lic.contentLicense).toBe('CC BY-SA 4.0');
      }
    },
    {
      name: 'F57.B3: AGPLv3 abbreviation matches standard GNU nomenclature',
      async run() {
        const lic = LegalAndInstitutionalEngine.getDualLicenseData();
        expect(lic.codeLicense).toBe('GNU AGPLv3');
      }
    },
    {
      name: 'F57.B4: Attribution string does not contain forbidden personal email',
      async run() {
        const lic = LegalAndInstitutionalEngine.getDualLicenseData();
        const forbiddenEmail = ['raupulus', 'gmail.com'].join('@');
        expect(lic.authorAttribution).not.toContain(forbiddenEmail);
      }
    },
    {
      name: 'F57.B5: Licensing data remains immutable across multiple evaluations',
      async run() {
        const l1 = LegalAndInstitutionalEngine.getDualLicenseData();
        const l2 = LegalAndInstitutionalEngine.getDualLicenseData();
        expect(JSON.stringify(l1)).toBe(JSON.stringify(l2));
      }
    }
  ]
};
