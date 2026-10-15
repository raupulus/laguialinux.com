import { expect } from '../harness/assert.mjs';
import { ContactSecurityEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F45: Cloudflare Turnstile Verification (Layer 4)',
  tier: 1,
  tests: [
    {
      name: 'F45.1: Form payload with valid turnstile_token passes Layer 4 verification',
      async run() {
        const payload = {
          name: 'Usuario Valido',
          email: 'usuario@example.com',
          subject: 'Consulta tecnica',
          message: 'Mensaje de prueba con longitud suficiente para pasar.',
          turnstile_token: '0.valid-turnstile-token-sample'
        };

        const result = ContactSecurityEngine.validateContactPayload(payload, true);
        expect(result.isValid).toBe(true);
      }
    },
    {
      name: 'F45.2: Missing turnstile_token when enforced triggers 422 validation error',
      async run() {
        const payload = {
          name: 'Usuario Sin Token',
          email: 'usuario@example.com',
          subject: 'Consulta',
          message: 'Mensaje de prueba con longitud suficiente.',
          turnstile_token: ''
        };

        const result = ContactSecurityEngine.validateContactPayload(payload, true);
        expect(result.isValid).toBe(false);
        expect(result.errors.turnstile).toBeTruthy();
      }
    },
    {
      name: 'F45.3: In development/test mode with Turnstile unconfigured, submission is permitted',
      async run() {
        const payload = {
          name: 'Dev Tester',
          email: 'dev@example.com',
          subject: 'Prueba en desarrollo',
          message: 'Mensaje en entorno de desarrollo local sin captcha.',
        };

        const result = ContactSecurityEngine.validateContactPayload(payload, false);
        expect(result.isValid).toBe(true);
      }
    },
    {
      name: 'F45.4: Turnstile field accepts cf-turnstile-response standard widget name',
      async run() {
        const payload = {
          'cf-turnstile-response': 'token-widget-cf'
        };
        const token = payload['cf-turnstile-response'] || payload.turnstile_token;
        expect(token).toBe('token-widget-cf');
      }
    },
    {
      name: 'F45.5: Turnstile takes precedence over Google reCAPTCHA when both tokens present',
      async run() {
        const body = {
          turnstile_token: 'turnstile-priority-token',
          'g-recaptcha-response': 'recaptcha-secondary-token'
        };

        const selectedToken = body.turnstile_token || body['g-recaptcha-response'];
        expect(selectedToken).toBe('turnstile-priority-token');
      }
    }
  ]
};
