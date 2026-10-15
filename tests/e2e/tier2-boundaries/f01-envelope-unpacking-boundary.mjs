import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F1: Standard API Envelope Unpacking (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F1.B1: Handles null data payload with success: true without throwing',
      async run({ client, mockServer }) {
        mockServer.registerHandler('GET', '/api/v2/test-null-data', (req, res) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Sin contenido asociado',
            data: null
          }));
        });

        const response = await client.request('/test-null-data');
        expect(response.success).toBe(true);
        expect(response.data).toBeNull();
        expect(response.message).toBe('Sin contenido asociado');
      }
    },
    {
      name: 'F1.B2: Handles empty string message in response envelope',
      async run({ client, mockServer }) {
        mockServer.registerHandler('GET', '/api/v2/test-empty-message', (req, res) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: '',
            data: { id: 1 }
          }));
        });

        const response = await client.request('/test-empty-message');
        expect(response.success).toBe(true);
        expect(response.message).toBe('');
        expect(response.data.id).toBe(1);
      }
    },
    {
      name: 'F1.B3: Normalizes non-JSON HTML error response (e.g. 502 Bad Gateway)',
      async run({ client, mockServer }) {
        mockServer.registerHandler('GET', '/api/v2/test-bad-gateway', (req, res) => {
          res.writeHead(502, { 'Content-Type': 'text/html' });
          res.end('<html><head><title>502 Bad Gateway</title></head><body><h1>Bad Gateway</h1></body></html>');
        });

        let error = null;
        try {
          await client.request('/test-bad-gateway');
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy();
        expect(error.status).toBe(502);
        expect(error.message).toContain('502');
      }
    },
    {
      name: 'F1.B4: Normalizes network connection failure (status 0) into friendly Spanish offline message',
      async run({ client }) {
        // Query an unreachable port to simulate offline / network error
        const deadClient = new client.constructor({
          baseUrl: 'http://127.0.0.1:59999/api/v2'
        });

        let error = null;
        try {
          await deadClient.request('/platforms/laguialinux');
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy();
        expect(error.status).toBe(0);
        expect(error.isNetworkError).toBe(true);
        expect(error.message).toContain('No se pudo conectar con el servidor');
      }
    },
    {
      name: 'F1.B5: Handles empty array data with total=0 in paginated response',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { category: 'non-existent-category' }
        });

        expect(response.success).toBe(true);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBe(0);
        expect(response.meta.total).toBe(0);
        expect(response.meta.from).toBeNull();
        expect(response.meta.to).toBeNull();
      }
    }
  ]
};
