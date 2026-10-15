import { expect } from '../harness/assert.mjs';
import { TaxonomyEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F5: Root Category Explorer (/categoria/[slug])',
  tier: 1,
  tests: [
    {
      name: 'F5.1: Resolves root category metadata by slug with name, description, and icon',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/categories');
        const root = response.data.find(c => c.slug === 'comandos');

        expect(root).toBeTruthy('Root category comandos must exist');
        expect(root.name).toBe('Comandos y Chuletas');
        expect(root.icon).toBe('terminal');
        expect(root.contents_count).toBe(52);
        expect(root.subcategories.length).toBeGreaterThan(0);
      }
    },
    {
      name: 'F5.2: Aggregates contents under root category including all child subcategories',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { category: 'comandos' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);

        // Verify items belong to 'comandos' or any of its subcategories
        const allMatchCategory = response.data.every(
          item => item.category_slug === 'comandos' || ['archivos-directorios', 'administracion-usuarios', 'gestion-paquetes'].includes(item.subcategory_slug)
        );
        expect(allMatchCategory).toBe(true, 'All contents must belong to root category or its subcategories');
      }
    },
    {
      name: 'F5.3: Category breadcrumbs build correct 2-level hierarchy',
      async run() {
        const category = { slug: 'comandos', name: 'Comandos y Chuletas' };
        const crumbs = TaxonomyEngine.buildBreadcrumbs(category);

        expect(crumbs.length).toBe(2);
        expect(crumbs[0].label).toBe('Inicio');
        expect(crumbs[0].path).toBe('/');
        expect(crumbs[1].label).toBe('Comandos y Chuletas');
        expect(crumbs[1].path).toBe('/categoria/comandos');
      }
    },
    {
      name: 'F5.4: Preserves category filter when applying sort query parameter',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { category: 'comandos', sort: 'recientes' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        expect(response.data[0].category_slug).toBe('comandos');
      }
    },
    {
      name: 'F5.5: Non-existent category slug returns empty collection in content search',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { category: 'categoria-inexistente-123' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBe(0, 'Unmatched category must return 0 items');
        expect(response.meta.total).toBe(0, 'meta.total must be 0');
      }
    }
  ]
};
