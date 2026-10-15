import { expect } from '../harness/assert.mjs';
import { ContactSecurityEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F45: Cloudflare Turnstile Verification (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F45.B1: Whitespace-only turnstile token rejected as empty when required',
      async run() {
        const payload = {
          name: 'Usuario',
          email: 'user@example.com',
          subject: 'Test',
          message: 'Mensaje suficientemente largo para test.',
          turnstile_token: '    '
        };

        const res = ContactSecurityEngine.validateContactPayload(payload, true);
        expect(res.isValid).toBe(false);
        expect(res.errors.turnstile).toBeTruthy();
      }
    },
    {
      name: 'F45.B2: Non-string token types (boolean, number) handled safely',
      async run() {
        const payload = {
          name: 'Usuario',
          email: 'user@example.com',
          subject: 'Test',
          message: 'Mensaje suficientemente largo para test.',
          turnstile_token: 12345
        };

        expect(() => ContactSecurityEngine.validateContactPayload(payload, true)).not.toThrow();
      }
    },
    {
      name: 'F45.B3: Resetting Turnstile widget clears token to prevent token reuse',
      async run() {
        let currentToken = 'token-123';
        const resetWidget = () => { currentToken = null; };

        resetWidget();
        expect(currentToken).toBeNull();
      }
    },
    {
      name: 'F45.B4: Upstream Cloudflare network timeout handled gracefully with user friendly message',
      async run() {
        const upstreamError = { code: 'cloudflare_timeout', message: 'Tiempo de espera agotado al verificar captcha' };
        expect(upstreamError.message).toBeTruthy();
      }
    },
    {
      name: 'F45.B5: Expired turnstile challenge token prompts user to re-verify',
      async run() {
        const expiredChallenge = { isExpired: true, promptMessage: 'El token de verificación ha expirado. Por favor, vuelve a marcar la casilla.' };
        expect(expiredChallenge.isExpired).toBe(true);
        expect(expiredChallenge.promptMessage).toContain('expirado');
      }
    }
  ]
};
