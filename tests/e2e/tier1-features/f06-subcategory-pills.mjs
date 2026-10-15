import { expect } from '../harness/assert.mjs';
import { TaxonomyEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F6: Subcategory Pills Filter',
  tier: 1,
  tests: [
    {
      name: 'F6.1: Generates "Todas" pill as first element with total root count',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/categories');
        const root = response.data.find(c => c.slug === 'comandos');
        const pills = TaxonomyEngine.generateSubcategoryPills(root);

        expect(pills.length).toBeGreaterThan(1);
        expect(pills[0].slug).toBe('all');
        expect(pills[0].name).toBe('Todas');
        expect(pills[0].contents_count).toBe(root.contents_count);
        expect(pills[0].isActive).toBe(true);
      }
    },
    {
      name: 'F6.2: Includes all child subcategories as subsequent pill elements',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/categories');
        const root = response.data.find(c => c.slug === 'comandos');
        const pills = TaxonomyEngine.generateSubcategoryPills(root, 'archivos-directorios');

        expect(pills[0].isActive).toBe(false, '"Todas" should be inactive when subcategory selected');
        const subPill = pills.find(p => p.slug === 'archivos-directorios');
        expect(subPill).toBeTruthy();
        expect(subPill.isActive).toBe(true, 'Target subcategory pill must be active');
        expect(subPill.contents_count).toBe(14);
      }
    },
    {
      name: 'F6.3: Filters contents strictly by subcategory slug when subcategory is active',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { category: 'archivos-directorios' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        for (const item of response.data) {
          expect(item.subcategory_slug).toBe('archivos-directorios', 'All items must belong to selected subcategory');
        }
      }
    },
    {
      name: 'F6.4: Breadcrumbs dynamically append active subcategory step',
      async run() {
        const cat = { slug: 'comandos', name: 'Comandos' };
        const subcat = { slug: 'archivos-directorios', name: 'Archivos y Directorios' };
        const crumbs = TaxonomyEngine.buildBreadcrumbs(cat, subcat);

        expect(crumbs.length).toBe(3);
        expect(crumbs[2].label).toBe('Archivos y Directorios');
        expect(crumbs[2].path).toBe('/categoria/comandos?subcategoria=archivos-directorios');
      }
    },
    {
      name: 'F6.5: Selecting Todas restores full root category query',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { category: 'comandos' }
        });

        const subcategoriesPresent = new Set(response.data.map(i => i.subcategory_slug));
        expect(subcategoriesPresent.size).toBeGreaterThan(1, 'All category query must span multiple subcategories');
      }
    }
  ]
};
