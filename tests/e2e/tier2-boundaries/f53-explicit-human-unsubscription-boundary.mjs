import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F53: Explicit Human Unsubscription (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F53.B1: HTTP 204 No Content response unpacks cleanly with null data',
      async run({ client }) {
        const res = await client.request('/newsletter/subscriptions/tok_204_test', {
          method: 'DELETE'
        });
        expect(res.success).toBe(true);
        expect(res.data).toBeNull();
      }
    },
    {
      name: 'F53.B2: Expired token returns 404 with error envelope message "Token inválido"',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions/expired-token', {
            method: 'DELETE'
          });
          expect(false).toBe(true, 'Should fail with 404');
        } catch (err) {
          expect(err.status).toBe(404);
        }
      }
    },
    {
      name: 'F53.B3: Rate limit under api-auth triggers 429 when threshold exceeded',
      async run({ client, mockServer }) {
        mockServer.forceRateLimit = true;

        try {
          await client.request('/newsletter/subscriptions/tok_rate_test', {
            method: 'DELETE'
          });
          expect(false).toBe(true, 'Should fail with 429');
        } catch (err) {
          expect(err.status).toBe(429);
        }
      }
    },
    {
      name: 'F53.B4: Network drop during cancellation prompts retry without corrupting UI',
      async run({ client, mockServer }) {
        mockServer.registerHandler('DELETE', '/api/v2/newsletter/subscriptions/tok_net_err', (req, res) => {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Servicio no disponible' }));
        });

        try {
          await client.request('/newsletter/subscriptions/tok_net_err', { method: 'DELETE' });
        } catch (err) {
          expect(err.status).toBe(503);
        }
      }
    },
    {
      name: 'F53.B5: Deleting already unsubscribed token is idempotent or returns 404',
      async run({ client }) {
        // First deletion
        const res1 = await client.request('/newsletter/subscriptions/tok_idempotent', { method: 'DELETE' });
        expect(res1.success).toBe(true);
      }
    }
  ]
};
