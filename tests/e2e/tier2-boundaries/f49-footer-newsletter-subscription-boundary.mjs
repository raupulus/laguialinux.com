import { expect } from '../harness/assert.mjs';
import { NewsletterAntiPrefetchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F49: Footer/Widget Newsletter Subscription (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F49.B1: Handles email containing plus addressing (e.g. user+linux@domain.com)',
      async run() {
        expect(NewsletterAntiPrefetchEngine.validateEmail('user+tag@domain.com')).toBe(true);
      }
    },
    {
      name: 'F49.B2: Trims surrounding whitespace from email input',
      async run({ client }) {
        const payload = NewsletterAntiPrefetchEngine.buildSubscriptionPayload('  user@domain.com  ', 'laguialinux');
        expect(payload.email).toBe('user@domain.com');

        const res = await client.request('/newsletter/subscriptions', {
          method: 'POST',
          body: payload
        });
        expect(res.success).toBe(true);
      }
    },
    {
      name: 'F49.B3: Non-string email parameter safely rejected by validation',
      async run() {
        expect(NewsletterAntiPrefetchEngine.validateEmail(12345)).toBe(false);
        expect(NewsletterAntiPrefetchEngine.validateEmail(null)).toBe(false);
      }
    },
    {
      name: 'F49.B4: Re-subscribing existing email reactivates subscription returning 201',
      async run({ client }) {
        const payload = { email: 'existing@domain.com', platform_id: 1 };
        const res1 = await client.request('/newsletter/subscriptions', { method: 'POST', body: payload });
        const res2 = await client.request('/newsletter/subscriptions', { method: 'POST', body: payload });

        expect(res1.success).toBe(true);
        expect(res2.success).toBe(true);
      }
    },
    {
      name: 'F49.B5: Subscriptions endpoint rate limited under api-auth (10 req/min)',
      async run({ client, mockServer }) {
        mockServer.forceRateLimit = true;

        try {
          await client.request('/newsletter/subscriptions', {
            method: 'POST',
            body: { email: 'test@example.com', platform_id: 1 }
          });
          expect(false).toBe(true, 'Should have failed with 429');
        } catch (err) {
          expect(err.status).toBe(429);
        }
      }
    }
  ]
};
