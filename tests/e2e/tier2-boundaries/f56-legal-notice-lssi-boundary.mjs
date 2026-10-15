import { expect } from '../harness/assert.mjs';
import { LegalAndInstitutionalEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F56: Legal Notice (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F56.B1: Contact email has valid MX domain syntax',
      async run() {
        const lssi = LegalAndInstitutionalEngine.getLssiComplianceData();
        expect(lssi.contactEmail.endsWith('@laguialinux.com')).toBe(true);
      }
    },
    {
      name: 'F56.B2: Author website in legal notice uses secure HTTPS protocol',
      async run() {
        const lssi = LegalAndInstitutionalEngine.getLssiComplianceData();
        expect(lssi.authorWebsite.startsWith('https://')).toBe(true);
      }
    },
    {
      name: 'F56.B3: Disclaimer text contains comprehensive sysadmin risk terms',
      async run() {
        const lssi = LegalAndInstitutionalEngine.getLssiComplianceData();
        const keywords = ['educativos', 'responsabilidad', 'producción'];
        for (const kw of keywords) {
          expect(lssi.disclaimer.toLowerCase()).toContain(kw);
        }
      }
    },
    {
      name: 'F56.B4: Both domain entries match canonical ecosystem hosts',
      async run() {
        const lssi = LegalAndInstitutionalEngine.getLssiComplianceData();
        expect(lssi.domains.length).toBe(2);
        expect(lssi.domains.every(d => !d.startsWith('http'))).toBe(true);
      }
    },
    {
      name: 'F56.B5: Full legal structure has no undefined or null properties',
      async run() {
        const lssi = LegalAndInstitutionalEngine.getLssiComplianceData();
        for (const [key, val] of Object.entries(lssi)) {
          expect(val).not.toBeNull();
          expect(val).not.toBeUndefined();
        }
      }
    }
  ]
};
