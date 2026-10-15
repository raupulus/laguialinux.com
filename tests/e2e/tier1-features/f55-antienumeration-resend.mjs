import { expect } from '../harness/assert.mjs';
import { NewsletterAntiPrefetchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F55: Anti-Enumeration Verification Resend',
  tier: 1,
  tests: [
    {
      name: 'F55.1: Resends verification email returning constant neutral message',
      async run({ client }) {
        const payload = { email: 'subscriber@example.com', platform_id: 1 };
        const res = await client.request('/newsletter/subscriptions/verification', {
          method: 'POST',
          body: payload
        });

        expect(res.success).toBe(true);
        expect(res.message).toBe('Si la dirección está suscrita y pendiente de verificar, se ha enviado el correo.');
      }
    },
    {
      name: 'F55.2: Non-existent email returns identical neutral 200 response (prevents enumeration)',
      async run({ client }) {
        const payload = { email: 'nonexistent-user@example.com', platform_id: 1 };
        const res = await client.request('/newsletter/subscriptions/verification', {
          method: 'POST',
          body: payload
        });

        expect(res.success).toBe(true);
        expect(res.message).toBe(NewsletterAntiPrefetchEngine.getNeutralVerificationMessage());
      }
    },
    {
      name: 'F55.3: Already verified email returns identical neutral 200 response',
      async run({ client }) {
        const payload = { email: 'already-verified@example.com', platform_id: 1 };
        const res = await client.request('/newsletter/subscriptions/verification', {
          method: 'POST',
          body: payload
        });

        expect(res.success).toBe(true);
        expect(res.message).toBe(NewsletterAntiPrefetchEngine.getNeutralVerificationMessage());
      }
    },
    {
      name: 'F55.4: Missing email format triggers 422 validation error',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions/verification', {
            method: 'POST',
            body: { email: 'not-an-email', platform_id: 1 }
          });
          expect(false).toBe(true, 'Should fail with 422');
        } catch (err) {
          expect(err.status).toBe(422);
          expect(err.errors.email).toBeTruthy();
        }
      }
    },
    {
      name: 'F55.5: Missing platform_id triggers 422 validation error',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions/verification', {
            method: 'POST',
            body: { email: 'user@example.com' }
          });
          expect(false).toBe(true, 'Should fail with 422');
        } catch (err) {
          expect(err.status).toBe(422);
        }
      }
    }
  ]
};
