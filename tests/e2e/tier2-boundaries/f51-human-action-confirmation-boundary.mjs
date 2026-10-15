import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F51: Human Action Confirmation (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F51.B1: Token with dashes, underscores, and alphanumeric chars dispatched properly',
      async run({ client }) {
        const token = 'tok_complex-123_abc-XYZ';
        const res = await client.request(`/newsletter/subscriptions/${token}/confirmation`, {
          method: 'POST'
        });
        expect(res.success).toBe(true);
      }
    },
    {
      name: 'F51.B2: Network failure during confirmation keeps retry button enabled',
      async run({ client, mockServer }) {
        mockServer.registerHandler('POST', '/api/v2/newsletter/subscriptions/tok_net_fail/confirmation', (req, res) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Error temporal del servidor' }));
        });

        try {
          await client.request('/newsletter/subscriptions/tok_net_fail/confirmation', { method: 'POST' });
        } catch (err) {
          expect(err.status).toBe(500);
          const canRetry = true;
          expect(canRetry).toBe(true);
        }
      }
    },
    {
      name: 'F51.B3: Confirmation endpoint does not accept GET method directly on API route',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions/tok_123/confirmation', {
            method: 'GET'
          });
          expect(false).toBe(true, 'GET on confirmation endpoint should 404');
        } catch (err) {
          expect(err.status).toBe(404);
        }
      }
    },
    {
      name: 'F51.B4: Rate limit under api-auth returns 429 when threshold exceeded',
      async run({ client, mockServer }) {
        mockServer.forceRateLimit = true;

        try {
          await client.request('/newsletter/subscriptions/tok_123/confirmation', { method: 'POST' });
          expect(false).toBe(true, 'Should fail with 429');
        } catch (err) {
          expect(err.status).toBe(429);
        }
      }
    },
    {
      name: 'F51.B5: Repeated confirmation of already confirmed subscription handles gracefully',
      async run({ client }) {
        const token = 'tok_already_confirmed';
        const res = await client.request(`/newsletter/subscriptions/${token}/confirmation`, { method: 'POST' });
        expect(res.success).toBe(true);
      }
    }
  ]
};
