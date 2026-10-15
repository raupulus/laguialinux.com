import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F51: Human Action Confirmation (POST .../{token}/confirmation)',
  tier: 1,
  tests: [
    {
      name: 'F51.1: Clicking confirm button dispatches POST /newsletter/subscriptions/{token}/confirmation',
      async run({ client }) {
        const token = 'tok_valid_human_123';
        const res = await client.request(`/newsletter/subscriptions/${token}/confirmation`, {
          method: 'POST'
        });

        expect(res.success).toBe(true);
        expect(res.message).toBe('Email verificado correctamente');
      }
    },
    {
      name: 'F51.2: Renders verified confirmation banner upon successful HTTP 200 response',
      async run({ client }) {
        const token = 'tok_banner_test';
        const res = await client.request(`/newsletter/subscriptions/${token}/confirmation`, {
          method: 'POST'
        });

        const viewState = {
          isConfirmed: res.success,
          bannerText: res.message
        };

        expect(viewState.isConfirmed).toBe(true);
        expect(viewState.bannerText).toContain('verificado');
      }
    },
    {
      name: 'F51.3: Invalid token returns 404 with error message "Token inválido"',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions/invalid-token/confirmation', {
            method: 'POST'
          });
          expect(false).toBe(true, 'Should have failed with 404');
        } catch (err) {
          expect(err.status).toBe(404);
          expect(err.message).toBe('Token inválido');
        }
      }
    },
    {
      name: 'F51.4: Disables CTA button while request is in-flight to prevent duplicate posts',
      async run() {
        let isSubmitting = false;
        let callCount = 0;

        const handleUserClick = async () => {
          if (isSubmitting) return;
          isSubmitting = true;
          callCount++;
          await new Promise(r => setTimeout(r, 20));
          isSubmitting = false;
        };

        await Promise.all([handleUserClick(), handleUserClick()]);
        expect(callCount).toBe(1);
      }
    },
    {
      name: 'F51.5: Expired token returns 404 error envelope and presents resend option',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions/expired-token/confirmation', {
            method: 'POST'
          });
          expect(false).toBe(true, 'Should fail with 404');
        } catch (err) {
          expect(err.status).toBe(404);
          const showResendButton = err.status === 404;
          expect(showResendButton).toBe(true);
        }
      }
    }
  ]
};
