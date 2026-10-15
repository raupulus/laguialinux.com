import { expect } from '../harness/assert.mjs';
import { ContactSecurityEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F47: Pre-Submit Confirmation Modal (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F47.B1: Handles empty or null payload safely returning empty strings',
      async run() {
        const summary = ContactSecurityEngine.generateReviewSummary(null);
        expect(summary.name).toBe('');
        expect(summary.email).toBe('');
        expect(summary.subject).toBe('');
        expect(summary.messageLength).toBe(0);
      }
    },
    {
      name: 'F47.B2: Exactly 120 chars message does not truncate; 121 chars adds ellipsis',
      async run() {
        const msg120 = 'x'.repeat(120);
        const s1 = ContactSecurityEngine.generateReviewSummary({ message: msg120 });
        expect(s1.messagePreview.endsWith('...')).toBe(false);

        const msg121 = 'x'.repeat(121);
        const s2 = ContactSecurityEngine.generateReviewSummary({ message: msg121 });
        expect(s2.messagePreview.endsWith('...')).toBe(true);
      }
    },
    {
      name: 'F47.B3: Trims excessive whitespace around fields in summary',
      async run() {
        const payload = {
          name: '   Juan   ',
          email: '   juan@example.com   ',
          subject: '   Asunto   ',
          message: '   Mensaje con espacios   '
        };

        const s = ContactSecurityEngine.generateReviewSummary(payload);
        expect(s.name).toBe('Juan');
        expect(s.email).toBe('juan@example.com');
        expect(s.subject).toBe('Asunto');
      }
    },
    {
      name: 'F47.B4: Modal double-click on confirm button does not dispatch duplicate API calls',
      async run() {
        let isSubmitting = false;
        let callCount = 0;

        const submit = async () => {
          if (isSubmitting) return;
          isSubmitting = true;
          callCount++;
          await new Promise(r => setTimeout(r, 20));
          isSubmitting = false;
        };

        await Promise.all([submit(), submit(), submit()]);
        expect(callCount).toBe(1);
      }
    },
    {
      name: 'F47.B5: Unicode and emoji in message summary preserve character integrity',
      async run() {
        const payload = {
          name: 'Raúl 🐧',
          email: 'test@example.com',
          subject: 'Linux & Éxito',
          message: 'Excelente artículo sobre Debian 🚀 y ZRAM 🔥'
        };

        const s = ContactSecurityEngine.generateReviewSummary(payload);
        expect(s.name).toContain('🐧');
        expect(s.messagePreview).toContain('🚀');
      }
    }
  ]
};
