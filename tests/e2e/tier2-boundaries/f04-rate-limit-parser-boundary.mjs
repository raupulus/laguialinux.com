import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F4: Rate Limit & Retry-After Parser (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F4.B1: Handles HTTP 429 when Retry-After header is missing entirely',
      async run({ client, mockServer }) {
        mockServer.registerHandler('GET', '/api/v2/test-rate-limit-no-header', (req, res) => {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde.',
            errors: { rate_limit: ['Límite superado.'] }
          }));
        });

        let error = null;
        try {
          await client.request('/test-rate-limit-no-header');
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy();
        expect(error.status).toBe(429);
        expect(error.isRateLimited).toBe(true);
        expect(error.retryAfterSeconds).toBeUndefined('retryAfterSeconds should be undefined when header missing');
      }
    },
    {
      name: 'F4.B2: Handles non-numeric / malformed Retry-After string gracefully',
      async run({ client, mockServer }) {
        mockServer.registerHandler('GET', '/api/v2/test-rate-limit-malformed', (req, res) => {
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Retry-After': 'invalid-seconds-value'
          });
          res.end(JSON.stringify({
            success: false,
            message: 'Demasiadas peticiones.',
            errors: {}
          }));
        });

        let error = null;
        try {
          await client.request('/test-rate-limit-malformed');
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy();
        expect(error.isRateLimited).toBe(true);
        expect(error.retryAfterSeconds).toBeUndefined('Malformed Retry-After should produce undefined rather than NaN');
      }
    },
    {
      name: 'F4.B3: Handles Retry-After with 0 seconds clamping to 0',
      async run({ client, mockServer }) {
        mockServer.registerHandler('GET', '/api/v2/test-rate-limit-zero', (req, res) => {
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Retry-After': '0'
          });
          res.end(JSON.stringify({ success: false, message: 'Espera.', errors: {} }));
        });

        let error = null;
        try {
          await client.request('/test-rate-limit-zero');
        } catch (err) {
          error = err;
        }

        expect(error.isRateLimited).toBe(true);
        expect(error.retryAfterSeconds).toBe(0);
      }
    },
    {
      name: 'F4.B4: Handles past date in HTTP-Date Retry-After clamping to 0',
      async run({ client, mockServer }) {
        mockServer.registerHandler('GET', '/api/v2/test-rate-limit-past-date', (req, res) => {
          const pastDate = new Date(Date.now() - 60000).toUTCString();
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Retry-After': pastDate
          });
          res.end(JSON.stringify({ success: false, message: 'Espera.', errors: {} }));
        });

        let error = null;
        try {
          await client.request('/test-rate-limit-past-date');
        } catch (err) {
          error = err;
        }

        expect(error.isRateLimited).toBe(true);
        expect(error.retryAfterSeconds).toBe(0, 'Past date must clamp to 0 seconds');
      }
    },
    {
      name: 'F4.B5: Handles extremely large Retry-After values (e.g. 86400 seconds / 24 hours)',
      async run({ client, mockServer }) {
        mockServer.registerHandler('GET', '/api/v2/test-rate-limit-large', (req, res) => {
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Retry-After': '86400'
          });
          res.end(JSON.stringify({ success: false, message: 'Bloqueado por 24h.', errors: {} }));
        });

        let error = null;
        try {
          await client.request('/test-rate-limit-large');
        } catch (err) {
          error = err;
        }

        expect(error.isRateLimited).toBe(true);
        expect(error.retryAfterSeconds).toBe(86400);
      }
    }
  ]
};
