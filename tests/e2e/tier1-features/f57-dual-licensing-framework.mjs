import { expect } from '../harness/assert.mjs';
import { LegalAndInstitutionalEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F57: Dual Licensing Framework (AGPLv3 + CC BY-SA 4.0)',
  tier: 1,
  tests: [
    {
      name: 'F57.1: Software platform code is licensed under GNU AGPLv3',
      async run() {
        const lic = LegalAndInstitutionalEngine.getDualLicenseData();
        expect(lic.codeLicense).toBe('GNU AGPLv3');
      }
    },
    {
      name: 'F57.2: Editorial and guide contents are licensed under Creative Commons CC BY-SA 4.0',
      async run() {
        const lic = LegalAndInstitutionalEngine.getDualLicenseData();
        expect(lic.contentLicense).toBe('CC BY-SA 4.0');
      }
    },
    {
      name: 'F57.3: Canonical footer license notice matches exact specification string',
      async run() {
        const lic = LegalAndInstitutionalEngine.getDualLicenseData();
        expect(lic.canonicalFooterNotice).toBe('Código bajo GNU AGPLv3 · Contenidos bajo CC BY-SA 4.0');
      }
    },
    {
      name: 'F57.4: Preserves mandatory attribution requirement to Raúl Caro Pastorino (@raupulus)',
      async run() {
        const lic = LegalAndInstitutionalEngine.getDualLicenseData();
        expect(lic.authorAttribution).toContain('Raúl Caro Pastorino');
        expect(lic.authorAttribution).toContain('@raupulus');
        expect(lic.authorAttribution).toContain('https://raupulus.dev');
      }
    },
    {
      name: 'F57.5: Enforces AGPLv3 Section 13 remote network copyleft requirement',
      async run() {
        const lic = LegalAndInstitutionalEngine.getDualLicenseData();
        expect(lic.copyleftNetworkSection13).toBe(true);
      }
    }
  ]
};
