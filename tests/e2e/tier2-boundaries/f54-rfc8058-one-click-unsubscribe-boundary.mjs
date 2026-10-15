import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F54: RFC 8058 One-Click Unsubscribe (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F54.B1: Handles POST request containing form body "List-Unsubscribe=One-Click" per RFC',
      async run({ client }) {
        const token = 'tok_rfc_body_test';
        const res = await client.request(`/newsletter/subscriptions/${token}/unsubscription`, {
          method: 'POST',
          body: { 'List-Unsubscribe': 'One-Click' }
        });
        expect(res.success).toBe(true);
      }
    },
    {
      name: 'F54.B2: Rejects GET method on one-click unsubscription endpoint with 404',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions/tok_123/unsubscription', {
            method: 'GET'
          });
          expect(false).toBe(true, 'GET method should return 404');
        } catch (err) {
          expect(err.status).toBe(404);
        }
      }
    },
    {
      name: 'F54.B3: Rate limit under api-auth limits excessive rapid unsubscription attempts',
      async run({ client, mockServer }) {
        mockServer.forceRateLimit = true;

        try {
          await client.request('/newsletter/subscriptions/tok_123/unsubscription', {
            method: 'POST'
          });
          expect(false).toBe(true, 'Should fail with 429');
        } catch (err) {
          expect(err.status).toBe(429);
        }
      }
    },
    {
      name: 'F54.B4: Expired token returns 404 error envelope per contract',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions/expired-token/unsubscription', {
            method: 'POST'
          });
          expect(false).toBe(true, 'Should fail with 404');
        } catch (err) {
          expect(err.status).toBe(404);
        }
      }
    },
    {
      name: 'F54.B5: Handles extra headers (User-Agent, Content-Type) without error',
      async run({ client }) {
        const token = 'tok_headers_variety';
        const res = await client.request(`/newsletter/subscriptions/${token}/unsubscription`, {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (AppleMail 16.0)',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        expect(res.success).toBe(true);
      }
    }
  ]
};
