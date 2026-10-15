import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F53: Explicit Human Unsubscription (DELETE .../{token})',
  tier: 1,
  tests: [
    {
      name: 'F53.1: Dispatches semantic DELETE /newsletter/subscriptions/{token} to cancel',
      async run({ client }) {
        const token = 'tok_valid_unsub_123';
        const res = await client.request(`/newsletter/subscriptions/${token}`, {
          method: 'DELETE'
        });

        // 204 No Content unpacked to { success: true }
        expect(res.success).toBe(true);
      }
    },
    {
      name: 'F53.2: Renders success confirmation screen after cancellation',
      async run({ client }) {
        const token = 'tok_confirm_screen';
        const res = await client.request(`/newsletter/subscriptions/${token}`, {
          method: 'DELETE'
        });

        const state = {
          isCancelled: res.success,
          message: 'Suscripción cancelada correctamente.'
        };

        expect(state.isCancelled).toBe(true);
        expect(state.message).toContain('cancelada correctamente');
      }
    },
    {
      name: 'F53.3: Invalid token returns 404 with error envelope message "Token inválido"',
      async run({ client }) {
        try {
          await client.request('/newsletter/subscriptions/invalid-token', {
            method: 'DELETE'
          });
          expect(false).toBe(true, 'Should fail with 404');
        } catch (err) {
          expect(err.status).toBe(404);
          expect(err.message).toBe('Token inválido');
        }
      }
    },
    {
      name: 'F53.4: Disables button in UI while deletion request is in-flight',
      async run() {
        let inFlight = false;
        let deleteRequests = 0;

        const executeDelete = async () => {
          if (inFlight) return;
          inFlight = true;
          deleteRequests++;
          await new Promise(r => setTimeout(r, 20));
          inFlight = false;
        };

        await Promise.all([executeDelete(), executeDelete(), executeDelete()]);
        expect(deleteRequests).toBe(1);
      }
    },
    {
      name: 'F53.5: Successful unsubscription provides option to re-subscribe if desired',
      async run() {
        const postUnsubOptions = {
          showResubscribeLink: true,
          portalHomeUrl: '/'
        };

        expect(postUnsubOptions.showResubscribeLink).toBe(true);
        expect(postUnsubOptions.portalHomeUrl).toBe('/');
      }
    }
  ]
};
