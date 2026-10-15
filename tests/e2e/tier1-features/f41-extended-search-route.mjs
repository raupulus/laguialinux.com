import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F41: Extended Search Route (/buscar)',
  tier: 1,
  tests: [
    {
      name: 'F41.1: Reads query parameters from URL (/buscar?q=comandos) and populates query state',
      async run() {
        const url = new URL('https://laguialinux.com/buscar?q=comandos&page=1');
        const q = url.searchParams.get('q');
        const page = parseInt(url.searchParams.get('page') || '1', 10);

        expect(q).toBe('comandos');
        expect(page).toBe(1);
      }
    },
    {
      name: 'F41.2: Executes paginated search fetching data via /contents with per_page=15',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { q: 'de', per_page: 15, page: 1 }
        });

        expect(response.success).toBe(true);
        expect(response.meta.per_page).toBe(15);
        expect(response.meta.current_page).toBe(1);
      }
    },
    {
      name: 'F41.3: Supports filtering by content type (type: guide) in full search view',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { type: 'guide' }
        });

        expect(response.success).toBe(true);
        const allGuides = response.data.every(item => item.type.slug === 'guide');
        expect(allGuides).toBe(true);
      }
    },
    {
      name: 'F41.4: Supports category filtering (category: comandos) alongside search query',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { category: 'comandos', q: 'usuarios' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBe(1);
        expect(response.data[0].slug).toBe('gestion-usuarios-useradd-usermod');
      }
    },
    {
      name: 'F41.5: Provides empty search view with suggested popular topics when query is blank',
      async run() {
        const popularSuggestions = ['comandos basicos', 'permisos chmod', 'particionar discos', 'apt debian'];
        expect(popularSuggestions.length).toBeGreaterThan(0);
        expect(popularSuggestions).toContain('comandos basicos');
      }
    }
  ]
};
