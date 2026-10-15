import { expect } from '../harness/assert.mjs';
import { NewsReaderEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F25: Noticias Relacionadas (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F25.B1: Handles request when all articles in catalog share the same slug',
      async run() {
        const list = [{ slug: 'news-a', title: 'A' }, { slug: 'news-a', title: 'Duplicate' }];
        const related = NewsReaderEngine.findRelatedArticles(list, 'news-a');

        expect(related.length).toBe(0);
      }
    },
    {
      name: 'F25.B2: Handles articles with null category or missing tags array',
      async run() {
        const rawArticles = [
          { slug: 'main', category: null, tags: null },
          { slug: 'second', category: null, tags: null }
        ];

        const related = NewsReaderEngine.findRelatedArticles(rawArticles, 'main');
        expect(related.length).toBe(1);
        expect(related[0].slug).toBe('second');
      }
    },
    {
      name: 'F25.B3: Handles limit = 0 returning empty array',
      async run() {
        const list = [{ slug: 'a', category: { slug: 'c' } }, { slug: 'b', category: { slug: 'c' } }];
        const related = NewsReaderEngine.findRelatedArticles(list, 'a', 0);

        expect(related.length).toBe(0);
      }
    },
    {
      name: 'F25.B4: Handles limit exceeding total available articles (returns all remaining)',
      async run() {
        const list = [
          { slug: 'current', category: { slug: 'k' } },
          { slug: 'one', category: { slug: 'k' } },
          { slug: 'two', category: { slug: 'k' } }
        ];

        const related = NewsReaderEngine.findRelatedArticles(list, 'current', 100);
        expect(related.length).toBe(2);
      }
    },
    {
      name: 'F25.B5: Preserves stable sorting when multiple candidates have identical relevance score',
      async run() {
        const list = [
          { slug: 'current', category: { slug: 'distros' } },
          { slug: 'd1', category: { slug: 'distros' } },
          { slug: 'd2', category: { slug: 'distros' } }
        ];

        const related = NewsReaderEngine.findRelatedArticles(list, 'current', 2);
        expect(related.length).toBe(2);
        expect(related[0].slug).toBe('d1');
        expect(related[1].slug).toBe('d2');
      }
    }
  ]
};
