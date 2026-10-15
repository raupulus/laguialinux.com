import { expect } from '../harness/assert.mjs';
import { TaxonomyEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F5: Root Category Explorer (/categoria/[slug]) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F5.B1: Handles root category with contents_count = 0 gracefully',
      async run() {
        const emptyCat = {
          slug: 'vacia',
          name: 'Categoría Vacía',
          contents_count: 0,
          subcategories: []
        };

        const pills = TaxonomyEngine.generateSubcategoryPills(emptyCat);
        expect(pills.length).toBe(1);
        expect(pills[0].contents_count).toBe(0);
        expect(pills[0].name).toBe('Todas');
      }
    },
    {
      name: 'F5.B2: Handles category with null/missing icon and color using platform fallbacks',
      async run() {
        const rawCat = {
          slug: 'sin-iconos',
          name: 'Sin Iconos',
          icon: null,
          color: null,
          contents_count: 5,
          subcategories: []
        };

        const menu = TaxonomyEngine.transformMegaMenu([rawCat]);
        expect(menu.rootCategories[0].icon).toBe('folder', 'Default fallback icon should be folder');
      }
    },
    {
      name: 'F5.B3: Decodes URL-encoded category slug with special characters (e.g. optimizaci%C3%B3n)',
      async run() {
        const encodedSlug = encodeURIComponent('optimización');
        const decoded = decodeURIComponent(encodedSlug);
        expect(decoded).toBe('optimización');

        const cat = { slug: decoded, name: 'Optimización' };
        const crumbs = TaxonomyEngine.buildBreadcrumbs(cat);
        expect(crumbs[1].path).toBe('/categoria/optimización');
      }
    },
    {
      name: 'F5.B4: Handles extremely long category slug without breaking route resolution',
      async run() {
        const longSlug = 'categoria-super-larga-con-muchos-caracteres-y-detalles-tecnicos-avanzados-2026';
        const cat = { slug: longSlug, name: 'Super Larga' };
        const crumbs = TaxonomyEngine.buildBreadcrumbs(cat);

        expect(crumbs[1].path).toBe(`/categoria/${longSlug}`);
      }
    },
    {
      name: 'F5.B5: Query with both valid category and invalid subcategory returns empty list',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { category: 'subcategoria-inexistente-en-comandos' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBe(0);
        expect(response.meta.total).toBe(0);
      }
    }
  ]
};
