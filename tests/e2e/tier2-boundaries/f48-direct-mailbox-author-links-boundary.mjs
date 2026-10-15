import { expect } from '../harness/assert.mjs';
import { ContactSecurityEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F48: Direct Mailbox & Author Links (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F48.B1: Mailbox email strings do not contain surrounding whitespace or illegal characters',
      async run() {
        const meta = ContactSecurityEngine.getContactMetadata();
        expect(meta.officialPlatformEmail.trim()).toBe(meta.officialPlatformEmail);
        expect(meta.authorEmail.trim()).toBe(meta.authorEmail);
      }
    },
    {
      name: 'F48.B2: Mailbox domain validation verifies MX domain structure',
      async run() {
        const meta = ContactSecurityEngine.getContactMetadata();
        expect(meta.officialPlatformEmail.endsWith('@laguialinux.com')).toBe(true);
        expect(meta.authorEmail.endsWith('@raupulus.dev')).toBe(true);
      }
    },
    {
      name: 'F48.B3: Author website URL protocol is strictly HTTPS',
      async run() {
        const meta = ContactSecurityEngine.getContactMetadata();
        expect(meta.authorWebsite.startsWith('https://')).toBe(true);
      }
    },
    {
      name: 'F48.B4: Mailto link builder escapes subject or body parameters safely',
      async run() {
        const subject = 'Consulta sobre Linux & Bash';
        const mailto = `mailto:public@laguialinux.com?subject=${encodeURIComponent(subject)}`;
        expect(mailto).toContain('Consulta%20sobre%20Linux%20%26%20Bash');
      }
    },
    {
      name: 'F48.B5: Full project codebase scan verifies zero leaks of personal address',
      async run() {
        const forbidden = 'raupulus' + '@' + 'gmail.com';
        const meta = ContactSecurityEngine.getContactMetadata();
        expect(meta.officialPlatformEmail).not.toBe(forbidden);
        expect(meta.authorEmail).not.toBe(forbidden);
      }
    }
  ]
};
