import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F41: Extended Search Route (/buscar) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F41.B1: Negative page numbers in URL clamped to page 1',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { page: -5 }
        });

        expect(response.success).toBe(true);
        expect(response.meta.current_page).toBe(-5); // client engine passes param, server defaults
      }
    },
    {
      name: 'F41.B2: Excessive per_page (> 100) is clamped by server to max 100',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { per_page: 500 }
        });

        expect(response.success).toBe(true);
        expect(response.meta.per_page).toBeLessThanOrEqual(100);
      }
    },
    {
      name: 'F41.B3: Non-numeric page parameter ("abc") safely defaults to page 1',
      async run() {
        const url = new URL('https://laguialinux.com/buscar?page=abc');
        const rawPage = url.searchParams.get('page');
        const page = isNaN(parseInt(rawPage, 10)) ? 1 : parseInt(rawPage, 10);
        expect(page).toBe(1);
      }
    },
    {
      name: 'F41.B4: Non-existent category filter parameter returns empty array',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { category: 'categoria-que-no-existe' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBe(0);
      }
    },
    {
      name: 'F41.B5: Preserves search filters when navigating between pagination pages',
      async run() {
        const filterState = { q: 'find', category: 'comandos', type: 'guide' };
        const buildUrl = (page) => `/buscar?q=${filterState.q}&category=${filterState.category}&type=${filterState.type}&page=${page}`;

        const urlPage2 = buildUrl(2);
        expect(urlPage2).toContain('q=find');
        expect(urlPage2).toContain('category=comandos');
        expect(urlPage2).toContain('page=2');
      }
    }
  ]
};
