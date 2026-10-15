import { expect } from '../harness/assert.mjs';
import { TaxonomyEngine } from '../harness/client-engine.mjs';
import { DEFAULT_CATEGORIES } from '../../../utils/categoriesData.ts';

export default {
  feature: 'F8: Mega-Menu Dropdown (CategoryMenu.vue)',
  tier: 1,
  tests: [
    {
      name: 'F8.1: Renders root categories in primary column with contents count badge',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/categories');
        const menu = TaxonomyEngine.transformMegaMenu(response.data);

        expect(menu.rootCategories.length).toBeGreaterThan(0);
        expect(menu.rootCategories[0].slug).toBe('comandos');
        expect(menu.rootCategories[0].contents_count).toBeGreaterThan(0);
        expect(menu.rootCategories[0].isActive).toBe(true);
      }
    },
    {
      name: 'F8.2: Displays subcategories associated with active root category in secondary column',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/categories');
        const menu = TaxonomyEngine.transformMegaMenu(response.data, 'comandos');

        expect(menu.activeCategory.slug).toBe('comandos');
        expect(menu.subcategories.length).toBe(3);
        expect(menu.subcategories[0].slug).toBe('archivos-directorios');
        expect(menu.subcategories[0].parent).toBe('comandos');
      }
    },
    {
      name: 'F8.3: Switching active category dynamically updates displayed subcategories',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/categories');
        const menuAlmacenamiento = TaxonomyEngine.transformMegaMenu(response.data, 'almacenamiento');

        expect(menuAlmacenamiento.activeCategory.slug).toBe('almacenamiento');
        expect(menuAlmacenamiento.subcategories[0].slug).toBe('particionado-formateo');
        expect(menuAlmacenamiento.subcategories[0].parent).toBe('almacenamiento');
      }
    },
    {
      name: 'F8.4: Renders empty state message when active category has no subcategories',
      async run({ client }) {
        const response = await client.request('/platforms/news/categories');
        const menuNews = TaxonomyEngine.transformMegaMenu(response.data, 'distribuciones');

        expect(menuNews.activeCategory.slug).toBe('distribuciones');
        expect(menuNews.subcategories.length).toBe(0, 'News category has 0 subcategories');
      }
    },
    {
      name: 'F8.5: Fallback to static DEFAULT_CATEGORIES matches official ecosystem hierarchy',
      async run() {
        expect(DEFAULT_CATEGORIES).toBeTruthy();
        expect(DEFAULT_CATEGORIES.laguialinux).toBeTruthy('laguialinux fallback must exist');
        expect(DEFAULT_CATEGORIES.news).toBeTruthy('news fallback must exist');

        const guidesRoots = DEFAULT_CATEGORIES.laguialinux.map(c => c.slug);
        expect(guidesRoots).toContain('comandos');
        expect(guidesRoots).toContain('almacenamiento');
        expect(guidesRoots).toContain('redes');
        expect(guidesRoots).toContain('seguridad');
      }
    }
  ]
};
