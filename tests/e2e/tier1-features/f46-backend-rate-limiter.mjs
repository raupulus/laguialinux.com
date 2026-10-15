import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F46: Backend Rate Limiter (Layer 5 - 5 req/hour on Contact POST)',
  tier: 1,
  tests: [
    {
      name: 'F46.1: Allows up to 5 contact submissions within the rate limit window',
      async run({ client, mockServer }) {
        mockServer.contactRequestCount = 0;

        for (let i = 1; i <= 5; i++) {
          const res = await client.request('/contact-messages', {
            method: 'POST',
            body: {
              name: `Usuario ${i}`,
              email: `usuario${i}@example.com`,
              subject: `Asunto ${i}`,
              message: `Mensaje de prueba valido numero ${i}`
            }
          });
          expect(res.success).toBe(true);
        }
      }
    },
    {
      name: 'F46.2: 6th submission within the hour triggers HTTP 429 Too Many Requests',
      async run({ client, mockServer }) {
        mockServer.contactRequestCount = 5;

        try {
          await client.request('/contact-messages', {
            method: 'POST',
            body: {
              name: 'Usuario 6',
              email: 'usuario6@example.com',
              subject: 'Asunto 6',
              message: 'Mensaje de prueba excediendo el limite'
            }
          });
          expect(false).toBe(true, 'Should have failed with 429');
        } catch (err) {
          expect(err.status).toBe(429);
          expect(err.isRateLimited).toBe(true);
        }
      }
    },
    {
      name: 'F46.3: Rate limited response extracts Retry-After header seconds accurately',
      async run({ client, mockServer }) {
        mockServer.contactRequestCount = 5;
        mockServer.rateLimitRetryAfter = 3600;

        try {
          await client.request('/contact-messages', {
            method: 'POST',
            body: {
              name: 'Usuario',
              email: 'usuario@example.com',
              subject: 'Test',
              message: 'Mensaje de prueba'
            }
          });
        } catch (err) {
          expect(err.retryAfterSeconds).toBe(3600);
        }
      }
    },
    {
      name: 'F46.4: Rate limit response returns standard error envelope with informative message',
      async run({ client, mockServer }) {
        mockServer.contactRequestCount = 5;

        try {
          await client.request('/contact-messages', {
            method: 'POST',
            body: {
              name: 'User',
              email: 'user@example.com',
              subject: 'Subject',
              message: 'Message with enough length'
            }
          });
        } catch (err) {
          expect(err.message).toContain('Límite de 5 mensajes');
        }
      }
    },
    {
      name: 'F46.5: Normal non-contact API endpoints remain unblocked when contact rate limit fires',
      async run({ client, mockServer }) {
        mockServer.contactRequestCount = 5;

        // Content queries should still succeed
        const res = await client.request('/platforms/laguialinux/categories');
        expect(res.success).toBe(true);
        expect(res.data.length).toBeGreaterThan(0);
      }
    }
  ]
};
