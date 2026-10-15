import { expect } from '../harness/assert.mjs';
import { TaxonomyEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F9: Full Catalog Page (/guias)',
  tier: 1,
  tests: [
    {
      name: 'F9.1: Queries catalog contents with default pagination parameters (page=1, per_page=15)',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { page: 1, per_page: 15 }
        });

        expect(response.success).toBe(true);
        expect(response.meta.current_page).toBe(1);
        expect(response.meta.per_page).toBe(15);
        expect(response.data.length).toBeGreaterThan(0);
      }
    },
    {
      name: 'F9.2: Calculates correct pagination metadata and page boundaries',
      async run() {
        const meta = { total: 45, per_page: 15, current_page: 2, last_page: 3 };
        const pag = TaxonomyEngine.calculatePagination(meta);

        expect(pag.currentPage).toBe(2);
        expect(pag.lastPage).toBe(3);
        expect(pag.hasPrevious).toBe(true);
        expect(pag.hasNext).toBe(true);
        expect(pag.from).toBe(16);
        expect(pag.to).toBe(30);
        expect(pag.pagesRange.length).toBe(3);
      }
    },
    {
      name: 'F9.3: Filters catalog by content type (guide, blog)',
      async run({ client }) {
        const guidesRes = await client.request('/platforms/laguialinux/contents', {
          params: { type: 'guide' }
        });
        const blogsRes = await client.request('/platforms/laguialinux/contents', {
          params: { type: 'blog' }
        });

        for (const item of guidesRes.data) {
          expect(item.type.slug).toBe('guide');
        }
        for (const item of blogsRes.data) {
          expect(item.type.slug).toBe('blog');
        }
      }
    },
    {
      name: 'F9.4: Advances catalog to next page when page query parameter incremented',
      async run({ client }) {
        const page1 = await client.request('/platforms/laguialinux/contents', {
          params: { page: 1, per_page: 2 }
        });
        const page2 = await client.request('/platforms/laguialinux/contents', {
          params: { page: 2, per_page: 2 }
        });

        expect(page1.meta.current_page).toBe(1);
        expect(page2.meta.current_page).toBe(2);
        expect(page1.data[0].id).not.toBe(page2.data[0].id, 'Page 1 and Page 2 should not have same first item');
      }
    },
    {
      name: 'F9.5: Searches catalog by text query q in title and excerpt',
      async run({ client }) {
        const searchRes = await client.request('/platforms/laguialinux/contents', {
          params: { q: 'find' }
        });

        expect(searchRes.success).toBe(true);
        expect(searchRes.data.length).toBeGreaterThan(0);
        const firstMatch = searchRes.data[0];
        const matchTitleOrExcerpt = firstMatch.title.toLowerCase().includes('find') || firstMatch.excerpt.toLowerCase().includes('find');
        expect(matchTitleOrExcerpt).toBe(true);
      }
    }
  ]
};
