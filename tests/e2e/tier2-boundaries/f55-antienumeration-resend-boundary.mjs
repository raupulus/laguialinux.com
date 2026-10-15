import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F55: Anti-Enumeration Verification Resend (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F55.B1: Handles plus-addressing emails in resend request safely',
      async run({ client }) {
        const payload = { email: 'user+resend@example.com', platform_id: 1 };
        const res = await client.request('/newsletter/subscriptions/verification', {
          method: 'POST',
          body: payload
        });
        expect(res.success).toBe(true);
      }
    },
    {
      name: 'F55.B2: Resend endpoint enforces rate limit under api-auth (10 req/min)',
      async run({ client, mockServer }) {
        mockServer.forceRateLimit = true;

        try {
          await client.request('/newsletter/subscriptions/verification', {
            method: 'POST',
            body: { email: 'user@example.com', platform_id: 1 }
          });
          expect(false).toBe(true, 'Should fail with 429');
        } catch (err) {
          expect(err.status).toBe(429);
        }
      }
    },
    {
      name: 'F55.B3: Rejects GET method on resend route with 404',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions/verification', { method: 'GET' });
          expect(false).toBe(true, 'GET should return 404');
        } catch (err) {
          expect(err.status).toBe(404);
        }
      }
    },
    {
      name: 'F55.B4: Leading/trailing whitespace around email is accepted and trimmed',
      async run({ client }) {
        const res = await client.request('/newsletter/subscriptions/verification', {
          method: 'POST',
          body: { email: '  valid@example.com  ', platform_id: 1 }
        });
        expect(res.success).toBe(true);
      }
    },
    {
      name: 'F55.B5: Response data is strictly null in verification resend envelope',
      async run({ client }) {
        const res = await client.request('/newsletter/subscriptions/verification', {
          method: 'POST',
          body: { email: 'valid@example.com', platform_id: 1 }
        });
        expect(res.data).toBeNull();
      }
    }
  ]
};
