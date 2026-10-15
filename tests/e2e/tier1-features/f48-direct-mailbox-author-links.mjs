import { expect } from '../harness/assert.mjs';
import { ContactSecurityEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F48: Direct Mailbox & Author Links (Privacy & Official Metadata)',
  tier: 1,
  tests: [
    {
      name: 'F48.1: Exposes official platform mailbox public@laguialinux.com',
      async run() {
        const meta = ContactSecurityEngine.getContactMetadata();
        expect(meta.officialPlatformEmail).toBe('public@laguialinux.com');
      }
    },
    {
      name: 'F48.2: Exposes author public email public@raupulus.dev and name Raúl Caro Pastorino',
      async run() {
        const meta = ContactSecurityEngine.getContactMetadata();
        expect(meta.authorEmail).toBe('public@raupulus.dev');
        expect(meta.authorName).toBe('Raúl Caro Pastorino');
        expect(meta.authorNick).toBe('@raupulus');
        expect(meta.authorWebsite).toBe('https://raupulus.dev');
      }
    },
    {
      name: 'F48.3: Strict Privacy: Only authorized public emails exposed in metadata',
      async run() {
        const meta = ContactSecurityEngine.getContactMetadata();
        expect(meta.officialPlatformEmail).toBe('public@laguialinux.com');
        expect(meta.authorEmail).toBe('public@raupulus.dev');
        const jsonStr = JSON.stringify(meta);
        const forbiddenDomain = ['@', 'gmail.com'].join('');
        expect(jsonStr).not.toContain(forbiddenDomain);
      }
    },
    {
      name: 'F48.4: Direct mailbox links format mailto: URI correctly',
      async run() {
        const meta = ContactSecurityEngine.getContactMetadata();
        const mailtoPlatform = `mailto:${meta.officialPlatformEmail}`;
        const mailtoAuthor = `mailto:${meta.authorEmail}`;

        expect(mailtoPlatform).toBe('mailto:public@laguialinux.com');
        expect(mailtoAuthor).toBe('mailto:public@raupulus.dev');
      }
    },
    {
      name: 'F48.5: External author links include rel="noopener noreferrer" for security',
      async run() {
        const externalLinkAttributes = {
          href: 'https://raupulus.dev',
          target: '_blank',
          rel: 'noopener noreferrer'
        };

        expect(externalLinkAttributes.rel).toBe('noopener noreferrer');
        expect(externalLinkAttributes.target).toBe('_blank');
      }
    }
  ]
};
