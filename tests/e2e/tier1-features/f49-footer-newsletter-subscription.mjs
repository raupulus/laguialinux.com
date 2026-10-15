import { expect } from '../harness/assert.mjs';
import { NewsletterAntiPrefetchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F49: Footer/Widget Newsletter Subscription',
  tier: 1,
  tests: [
    {
      name: 'F49.1: Validates subscriber email format before submitting',
      async run() {
        expect(NewsletterAntiPrefetchEngine.validateEmail('usuario@example.com')).toBe(true);
        expect(NewsletterAntiPrefetchEngine.validateEmail('invalid-email')).toBe(false);
        expect(NewsletterAntiPrefetchEngine.validateEmail('')).toBe(false);
      }
    },
    {
      name: 'F49.2: Submits subscription payload with platform_id (1 for guides, 2 for news)',
      async run({ client }) {
        const payload = NewsletterAntiPrefetchEngine.buildSubscriptionPayload('lector@example.com', 'laguialinux');
        expect(payload.platform_id).toBe(1);

        const res = await client.request('/newsletter/subscriptions', {
          method: 'POST',
          body: payload
        });

        expect(res.success).toBe(true);
        expect(res.message).toContain('Suscripcion creada');
      }
    },
    {
      name: 'F49.3: Submits news platform subscription with platform_id = 2',
      async run({ client }) {
        const payload = NewsletterAntiPrefetchEngine.buildSubscriptionPayload('noticias@example.com', 'news');
        expect(payload.platform_id).toBe(2);

        const res = await client.request('/newsletter/subscriptions', {
          method: 'POST',
          body: payload
        });

        expect(res.success).toBe(true);
      }
    },
    {
      name: 'F49.4: Missing email triggers 422 validation response with field errors',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions', {
            method: 'POST',
            body: { platform_id: 1 }
          });
          expect(false).toBe(true, 'Should have failed with 422');
        } catch (err) {
          expect(err.status).toBe(422);
          expect(err.errors.email).toBeTruthy();
        }
      }
    },
    {
      name: 'F49.5: Missing platform_id triggers 422 validation error',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions', {
            method: 'POST',
            body: { email: 'user@example.com' }
          });
          expect(false).toBe(true, 'Should have failed with 422');
        } catch (err) {
          expect(err.status).toBe(422);
          expect(err.errors.platform_id).toBeTruthy();
        }
      }
    }
  ]
};
