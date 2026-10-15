import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F35: API Content Search (GET /contents?q=...)',
  tier: 1,
  tests: [
    {
      name: 'F35.1: Dispatches query to /platforms/laguialinux/contents?q=find and receives matching items',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { q: 'find' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        expect(response.data[0].slug).toContain('find');
        expect(response.data[0].title.toLowerCase()).toContain('find');
      }
    },
    {
      name: 'F35.2: Searches across content excerpts (e.g. "zram" or "intercambio")',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { q: 'intercambio' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        expect(response.data[0].excerpt.toLowerCase()).toContain('intercambio');
      }
    },
    {
      name: 'F35.3: Combines search query with category filter (category: "almacenamiento", q: "fdisk")',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { q: 'fdisk', category: 'almacenamiento' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBe(1);
        expect(response.data[0].slug).toBe('formateo-particionado-fdisk-mkfs');
      }
    },
    {
      name: 'F35.4: Returns empty data array with 200 OK when no contents match search query',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { q: 'termino-completamente-inexistente-xyz' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBe(0);
        expect(response.meta.total).toBe(0);
      }
    },
    {
      name: 'F35.5: Response meta pagination reflects total matching items and current page',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { q: 'guia', per_page: 2 }
        });

        expect(response.success).toBe(true);
        expect(response.meta.per_page).toBe(2);
        expect(response.meta.current_page).toBe(1);
        expect(response.data.length).toBeLessThanOrEqual(2);
      }
    }
  ]
};
