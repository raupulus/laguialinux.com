import { expect } from '../harness/assert.mjs';
import { TaxonomyEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F6: Subcategory Pills Filter (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F6.B1: Handles root category with 0 subcategories (empty array)',
      async run() {
        const catWithoutSubs = {
          slug: 'redes',
          name: 'Redes',
          contents_count: 18,
          subcategories: []
        };

        const pills = TaxonomyEngine.generateSubcategoryPills(catWithoutSubs);
        expect(pills.length).toBe(1);
        expect(pills[0].slug).toBe('all');
        expect(pills[0].isActive).toBe(true);
      }
    },
    {
      name: 'F6.B2: Handles subcategory with contents_count = 0 retaining pill display with 0 badge',
      async run() {
        const catWithZeroSub = {
          slug: 'test',
          name: 'Test',
          contents_count: 10,
          subcategories: [
            { slug: 'zero-sub', name: 'Zero Sub', contents_count: 0, parent: 'test' }
          ]
        };

        const pills = TaxonomyEngine.generateSubcategoryPills(catWithZeroSub);
        expect(pills.length).toBe(2);
        expect(pills[1].contents_count).toBe(0);
        expect(pills[1].name).toBe('Zero Sub');
      }
    },
    {
      name: 'F6.B3: Selecting subcategory with non-existent slug defaults active state safely',
      async run() {
        const cat = {
          slug: 'comandos',
          name: 'Comandos',
          contents_count: 50,
          subcategories: [
            { slug: 'sub-1', name: 'Sub 1', contents_count: 10, parent: 'comandos' }
          ]
        };

        const pills = TaxonomyEngine.generateSubcategoryPills(cat, 'non-existent-sub');
        // 'all' is inactive, 'sub-1' is inactive because non-existent-sub was requested
        expect(pills[0].isActive).toBe(false);
        expect(pills[1].isActive).toBe(false);
      }
    },
    {
      name: 'F6.B4: Handles root category with undefined/null subcategories property gracefully',
      async run() {
        const catNullSubs = {
          slug: 'broken-cat',
          name: 'Broken Cat',
          contents_count: 5,
          subcategories: null
        };

        const pills = TaxonomyEngine.generateSubcategoryPills(catNullSubs);
        expect(pills.length).toBe(1);
        expect(pills[0].slug).toBe('all');
      }
    },
    {
      name: 'F6.B5: Preserves active pill state when other query params change (e.g. sort, page)',
      async run({ client }) {
        const queryWithSort = { category: 'archivos-directorios', sort: '-created_at', page: 1 };
        const response = await client.request('/platforms/laguialinux/contents', {
          params: queryWithSort
        });

        expect(response.success).toBe(true);
        for (const item of response.data) {
          expect(item.subcategory_slug).toBe('archivos-directorios');
        }
      }
    }
  ]
};
