import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F4: Rate Limit & Retry-After Parser',
  tier: 1,
  tests: [
    {
      name: 'F4.1: Detects HTTP 429 status and sets isRateLimited to true',
      async run({ client, mockServer }) {
        mockServer.forceRateLimit = true;
        mockServer.rateLimitRetryAfter = 45;

        let error = null;
        try {
          await client.request('/platforms/laguialinux/categories');
        } catch (err) {
          error = err;
        } finally {
          mockServer.forceRateLimit = false;
        }

        expect(error).toBeTruthy('Must throw error on 429');
        expect(error.status).toBe(429, 'Status must be 429');
        expect(error.isRateLimited).toBe(true, 'isRateLimited flag must be true');
      }
    },
    {
      name: 'F4.2: Extracts integer seconds from Retry-After header',
      async run({ client, mockServer }) {
        mockServer.forceRateLimit = true;
        mockServer.rateLimitRetryAfter = 120;

        let error = null;
        try {
          await client.request('/platforms/laguialinux/categories');
        } catch (err) {
          error = err;
        } finally {
          mockServer.forceRateLimit = false;
        }

        expect(error.retryAfterSeconds).toBe(120, 'retryAfterSeconds must match header value');
      }
    },
    {
      name: 'F4.3: Converts HTTP-Date in Retry-After header to relative remaining seconds',
      async run({ client, mockServer }) {
        mockServer.registerHandler('GET', '/api/v2/test-rate-limit-date', (req, res) => {
          // Set date 30 seconds into the future
          const futureDate = new Date(Date.now() + 30000).toUTCString();
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Retry-After': futureDate,
          });
          res.end(JSON.stringify({
            success: false,
            message: 'Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde.',
            errors: { rate_limit: ['Límite temporal alcanzado.'] }
          }));
        });

        let error = null;
        try {
          await client.request('/test-rate-limit-date');
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy('Must catch 429 with date header');
        expect(error.isRateLimited).toBe(true);
        expect(error.retryAfterSeconds).toBeGreaterThan(0, 'retryAfterSeconds must be > 0');
        expect(error.retryAfterSeconds).toBeLessThanOrEqual(31, 'retryAfterSeconds should be around ~30s');
      }
    },
    {
      name: 'F4.4: Preserves backend rate limit error message',
      async run({ client, mockServer }) {
        mockServer.forceRateLimit = true;
        let error = null;
        try {
          await client.request('/platforms/laguialinux/categories');
        } catch (err) {
          error = err;
        } finally {
          mockServer.forceRateLimit = false;
        }

        expect(error.message).toBe('Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde.');
      }
    },
    {
      name: 'F4.5: Non-429 errors have isRateLimited set to false and undefined retryAfterSeconds',
      async run({ client }) {
        let error = null;
        try {
          await client.request('/platforms/non-existent-404');
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy();
        expect(error.status).toBe(404);
        expect(error.isRateLimited).toBe(false, '404 must not be flagged as rate limited');
        expect(error.retryAfterSeconds).toBeUndefined('retryAfterSeconds must be undefined for 404');
      }
    }
  ]
};
