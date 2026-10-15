import { expect } from '../harness/assert.mjs';
import { NewsletterAntiPrefetchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F54: RFC 8058 One-Click Unsubscribe (List-Unsubscribe-Post)',
  tier: 1,
  tests: [
    {
      name: 'F54.1: Generates compliant List-Unsubscribe and List-Unsubscribe-Post email headers',
      async run() {
        const token = 'tok_rfc8058_headers';
        const headers = NewsletterAntiPrefetchEngine.generateRfc8058Headers(token, 'laguialinux.com');

        expect(headers['List-Unsubscribe']).toContain(`/newsletter/subscriptions/${token}/unsubscription`);
        expect(headers['List-Unsubscribe']).toMatch(/^<https:\/\/.*>$/);
        expect(headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
      }
    },
    {
      name: 'F54.2: Automated POST without request body successfully unregisters subscription',
      async run({ client }) {
        const token = 'tok_rfc_autounsub';
        const res = await client.request(`/newsletter/subscriptions/${token}/unsubscription`, {
          method: 'POST'
        });

        expect(res.success).toBe(true);
        expect(res.message).toBe('Suscripcion cancelada correctamente');
      }
    },
    {
      name: 'F54.3: Operates strictly without cookies, bearer auth or CSRF token requirement',
      async run({ client }) {
        // Pure unauthenticated client request with token in URL alone
        const res = await client.request('/newsletter/subscriptions/tok_stateless/unsubscription', {
          method: 'POST',
          headers: {}
        });

        expect(res.success).toBe(true);
      }
    },
    {
      name: 'F54.4: Invalid or unrecognized token returns 404 with error envelope message "Token inválido"',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions/invalid-token/unsubscription', {
            method: 'POST'
          });
          expect(false).toBe(true, 'Should fail with 404');
        } catch (err) {
          expect(err.status).toBe(404);
          expect(err.message).toBe('Token inválido');
        }
      }
    },
    {
      name: 'F54.5: Works correctly for news platform domain (news.laguialinux.com)',
      async run() {
        const token = 'tok_news_unsub';
        const headers = NewsletterAntiPrefetchEngine.generateRfc8058Headers(token, 'news.laguialinux.com');

        expect(headers['List-Unsubscribe']).toContain('https://news.laguialinux.com');
      }
    }
  ]
};
