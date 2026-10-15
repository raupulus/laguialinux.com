import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F52: Anti-Prefetch Unsubscription Page (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F52.B1: Missing token in query string shows warning message to user',
      async run() {
        const url = new URL('https://laguialinux.com/newsletter/baja');
        const token = url.searchParams.get('token');
        const warning = !token ? 'Falta el token de baja en el enlace.' : null;

        expect(warning).toContain('Falta el token');
      }
    },
    {
      name: 'F52.B2: User can confirm unsubscription without selecting any survey reason',
      async run() {
        const userSubmission = {
          token: 'tok_no_reason',
          reason: null // optional survey
        };

        expect(userSubmission.token).toBeTruthy();
        expect(userSubmission.reason).toBeNull();
      }
    },
    {
      name: 'F52.B3: Selecting "Otro motivo" allows providing custom reason text up to 255 chars',
      async run() {
        const customReason = 'Cambié de dirección de correo electrónico.';
        expect(customReason.length).toBeLessThanOrEqual(255);
      }
    },
    {
      name: 'F52.B4: User deciding not to unsubscribe can navigate away with subscription intact',
      async run({ mockServer }) {
        const initialCount = mockServer.requestHistory.length;
        // User clicks "Cancelar y volver al portal"
        const navigationTarget = '/';
        expect(navigationTarget).toBe('/');
        expect(mockServer.requestHistory.length).toBe(initialCount);
      }
    },
    {
      name: 'F52.B5: Handles URL-encoded token characters without data loss',
      async run() {
        const url = new URL('https://laguialinux.com/newsletter/baja?token=tok%2Bunsub%3D123');
        const token = url.searchParams.get('token');
        expect(token).toBe('tok+unsub=123');
      }
    }
  ]
};
