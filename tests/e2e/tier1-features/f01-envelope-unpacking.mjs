import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F1: Standard API Envelope Unpacking',
  tier: 1,
  tests: [
    {
      name: 'F1.1: Unpacks standard 200 success envelope with data object',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux');
        expect(response.success).toBe(true, 'success must be boolean true');
        expect(typeof response.message).toBe('string', 'message must be string');
        expect(response.data).toBeTruthy('data payload must exist');
        expect(response.data.slug).toBe('laguialinux', 'data.slug must match platform');
        expect(response.errors).toBeUndefined('errors should not be present on success');
      }
    },
    {
      name: 'F1.2: Unpacks standard paginated collection with meta object',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { page: 1, per_page: 2 }
        });
        expect(response.success).toBe(true, 'success must be true');
        expect(Array.isArray(response.data)).toBe(true, 'data must be array for collections');
        expect(response.meta).toBeTruthy('meta must exist in paginated responses');
        expect(response.meta.total).toBeGreaterThanOrEqual(0, 'meta.total must be >= 0');
        expect(response.meta.per_page).toBe(2, 'meta.per_page must match requested limit');
        expect(response.meta.current_page).toBe(1, 'meta.current_page must match requested page');
        expect(response.meta.last_page).toBeGreaterThanOrEqual(1, 'meta.last_page must be >= 1');
      }
    },
    {
      name: 'F1.3: Normalizes HTTP 422 validation failure envelope with errors map',
      async run({ client, mockServer }) {
        mockServer.registerHandler('POST', '/api/v2/contact-validate', (req, res) => {
          res.writeHead(422, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Los datos proporcionados no son válidos.',
            data: null,
            errors: {
              email: ['El campo email ya está en uso.'],
              message: ['El mensaje es obligatorio.']
            }
          }));
        });

        let error = null;
        try {
          await client.request('/contact-validate', {
            method: 'POST',
            body: { email: 'test@example.com' }
          });
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy('Must throw on 422 validation error');
        expect(error.status).toBe(422, 'Normalized status must be 422');
        expect(error.message).toBe('Los datos proporcionados no son válidos.', 'Message must match backend');
        expect(error.errors.email[0]).toBe('El campo email ya está en uso.', 'Field error email must be extracted');
        expect(error.errors.message[0]).toBe('El mensaje es obligatorio.', 'Field error message must be extracted');
      }
    },
    {
      name: 'F1.4: Handles HTTP 204 No Content with synthetic success envelope',
      async run({ client, mockServer }) {
        mockServer.registerHandler('DELETE', '/api/v2/test-resource', (req, res) => {
          res.writeHead(204);
          res.end();
        });

        const response = await client.request('/test-resource', { method: 'DELETE' });
        expect(response.success).toBe(true, 'Synthetic envelope success must be true');
        expect(response.message).toBe('Operación completada', 'Synthetic message must state completion');
        expect(response.data).toBeNull('Data must be null for 204');
      }
    },
    {
      name: 'F1.5: Normalizes HTTP 404 resource not found with backend message',
      async run({ client }) {
        let error = null;
        try {
          await client.request('/platforms/plataforma-inexistente');
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy('Must throw NormalizedApiError on 404');
        expect(error.status).toBe(404, 'Status must be 404');
        expect(error.message).toBe('Plataforma no encontrada', 'Message must match exact backend 404 message');
        expect(error.isNetworkError).toBe(false, 'Should not be marked as network error');
      }
    }
  ]
};
