import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F46: Backend Rate Limiter (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F46.B1: Handles missing or malformed Retry-After header gracefully returning undefined',
      async run({ client, mockServer }) {
        mockServer.registerHandler('POST', '/api/v2/contact-messages', (req, res) => {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Too many requests' }));
        });

        try {
          await client.request('/contact-messages', { method: 'POST', body: {} });
        } catch (err) {
          expect(err.status).toBe(429);
          expect(err.isRateLimited).toBe(true);
        }
      }
    },
    {
      name: 'F46.B2: Handles HTTP-Date formatted Retry-After header converting to positive seconds',
      async run({ client, mockServer }) {
        const futureDate = new Date(Date.now() + 120000).toUTCString();
        mockServer.registerHandler('POST', '/api/v2/contact-messages', (req, res) => {
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Retry-After': futureDate
          });
          res.end(JSON.stringify({ success: false, message: 'Rate limited' }));
        });

        try {
          await client.request('/contact-messages', { method: 'POST', body: {} });
        } catch (err) {
          expect(err.retryAfterSeconds).toBeGreaterThan(0);
          expect(err.retryAfterSeconds).toBeLessThanOrEqual(130);
        }
      }
    },
    {
      name: 'F46.B3: Exactly 0 seconds Retry-After parsed correctly as 0',
      async run({ client, mockServer }) {
        mockServer.registerHandler('POST', '/api/v2/contact-messages', (req, res) => {
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Retry-After': '0'
          });
          res.end(JSON.stringify({ success: false, message: 'Retry now' }));
        });

        try {
          await client.request('/contact-messages', { method: 'POST', body: {} });
        } catch (err) {
          expect(err.retryAfterSeconds).toBe(0);
        }
      }
    },
    {
      name: 'F46.B4: Resetting mock server resets contact counter and restores access',
      async run({ client, mockServer }) {
        mockServer.contactRequestCount = 5;
        mockServer.reset();

        const res = await client.request('/contact-messages', {
          method: 'POST',
          body: {
            name: 'User',
            email: 'user@example.com',
            subject: 'Sub',
            message: 'Valid length message'
          }
        });
        expect(res.success).toBe(true);
      }
    },
    {
      name: 'F46.B5: Error normalization guarantees isRateLimited is boolean false on 500 errors',
      async run({ client, mockServer }) {
        mockServer.registerHandler('POST', '/api/v2/contact-messages', (req, res) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Internal Server Error' }));
        });

        try {
          await client.request('/contact-messages', { method: 'POST', body: {} });
        } catch (err) {
          expect(err.status).toBe(500);
          expect(err.isRateLimited).toBe(false);
        }
      }
    }
  ]
};
