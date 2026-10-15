import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F35: API Content Search (GET /contents?q=...) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F35.B1: Handles URI special characters and accents in query string safely',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { q: 'gestión' }
        });

        expect(response.success).toBe(true);
        expect(Array.isArray(response.data)).toBe(true);
      }
    },
    {
      name: 'F35.B2: Handles symbols and SQL injection probe characters safely without error',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { q: "' OR 1=1 --" }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBe(0);
      }
    },
    {
      name: 'F35.B3: Queries with leading and trailing whitespace preserve search fidelity',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { q: '  find  ' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
      }
    },
    {
      name: 'F35.B4: Pagination with page > last_page returns empty data array',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { q: 'find', page: 999 }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBe(0);
      }
    },
    {
      name: 'F35.B5: Platform slug mismatch (e.g. invalid platform) produces 404 error envelope',
      async run({ client }) {
        try {
          await client.request('/platforms/unknown-platform/contents', {
            params: { q: 'linux' }
          });
          expect(false).toBe(true, 'Should have thrown 404');
        } catch (err) {
          expect(err.status).toBe(404);
          expect(err.message).toContain('no encontrada');
        }
      }
    }
  ]
};
