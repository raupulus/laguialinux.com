import { expect } from '../harness/assert.mjs';
import { TaxonomyEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F8: Mega-Menu Dropdown (CategoryMenu.vue) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F8.B1: Handles transformMegaMenu with empty categories array []',
      async run() {
        const menu = TaxonomyEngine.transformMegaMenu([]);
        expect(menu.rootCategories.length).toBe(0);
        expect(menu.activeCategory).toBeNull();
        expect(menu.subcategories.length).toBe(0);
      }
    },
    {
      name: 'F8.B2: Handles activeRootSlug not matching any root category defaulting to first',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/categories');
        const menu = TaxonomyEngine.transformMegaMenu(response.data, 'slug-inexistente-xyz');

        expect(menu.activeCategory).toBeTruthy();
        expect(menu.activeCategory.slug).toBe(response.data[0].slug);
      }
    },
    {
      name: 'F8.B3: Handles category with null description and missing subcategories array',
      async run() {
        const partialCat = {
          slug: 'parcial',
          name: 'Parcial',
          description: null,
          contents_count: 3
        };

        const menu = TaxonomyEngine.transformMegaMenu([partialCat]);
        expect(menu.rootCategories[0].description).toBe('');
        expect(Array.isArray(menu.subcategories)).toBe(true);
        expect(menu.subcategories.length).toBe(0);
      }
    },
    {
      name: 'F8.B4: Preserves contents_count formatting for high counts (e.g. > 100)',
      async run() {
        const bigCountCat = {
          slug: 'masiva',
          name: 'Masiva',
          contents_count: 9999,
          subcategories: []
        };

        const menu = TaxonomyEngine.transformMegaMenu([bigCountCat]);
        expect(menu.rootCategories[0].contents_count).toBe(9999);
      }
    },
    {
      name: 'F8.B5: Handles null/undefined categories input without throwing',
      async run() {
        const menuNull = TaxonomyEngine.transformMegaMenu(null);
        const menuUndef = TaxonomyEngine.transformMegaMenu(undefined);

        expect(menuNull.rootCategories.length).toBe(0);
        expect(menuUndef.rootCategories.length).toBe(0);
      }
    }
  ]
};
