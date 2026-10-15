import { expect } from '../harness/assert.mjs';
import { LegalAndInstitutionalEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F56: Legal Notice (/aviso-legal - LSSI-CE Article 10 Compliance)',
  tier: 1,
  tests: [
    {
      name: 'F56.1: Discloses owner identity Raúl Caro Pastorino and official contact email',
      async run() {
        const lssi = LegalAndInstitutionalEngine.getLssiComplianceData();
        expect(lssi.owner).toBe('Raúl Caro Pastorino');
        expect(lssi.contactEmail).toBe('public@laguialinux.com');
        expect(lssi.authorNick).toBe('@raupulus');
      }
    },
    {
      name: 'F56.2: Includes sysadmin technical disclaimer for command execution liability',
      async run() {
        const lssi = LegalAndInstitutionalEngine.getLssiComplianceData();
        expect(lssi.disclaimer).toBeTruthy();
        expect(lssi.disclaimer).toContain('educativos');
        expect(lssi.disclaimer).toContain('responsabilidad');
      }
    },
    {
      name: 'F56.3: Identifies registered domains laguialinux.com and news.laguialinux.com',
      async run() {
        const lssi = LegalAndInstitutionalEngine.getLssiComplianceData();
        expect(lssi.domains).toContain('laguialinux.com');
        expect(lssi.domains).toContain('news.laguialinux.com');
      }
    },
    {
      name: 'F56.4: Strict Privacy: Only authorized official emails present in legal data',
      async run() {
        const lssi = LegalAndInstitutionalEngine.getLssiComplianceData();
        expect(lssi.contactEmail).toBe('public@laguialinux.com');
        expect(lssi.authorEmail).toBe('public@raupulus.dev');
        const str = JSON.stringify(lssi);
        const forbiddenDomain = ['@', 'gmail.com'].join('');
        expect(str).not.toContain(forbiddenDomain);
      }
    },
    {
      name: 'F56.5: LSSI-CE Article 10 compliance flag verified',
      async run() {
        const lssi = LegalAndInstitutionalEngine.getLssiComplianceData();
        expect(lssi.article10Compliant).toBe(true);
      }
    }
  ]
};
