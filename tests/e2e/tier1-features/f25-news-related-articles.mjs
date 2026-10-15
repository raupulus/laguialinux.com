import { expect } from '../harness/assert.mjs';
import { NewsReaderEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F25: Noticias Relacionadas',
  tier: 1,
  tests: [
    {
      name: 'F25.1: Finds related articles sharing the same primary editorial category',
      async run({ client }) {
        const articleList = [
          { slug: 'noticia-1', title: 'Kernel 6.13', category: { slug: 'kernel' }, tags: ['kernel', 'linux'] },
          { slug: 'noticia-2', title: 'Kernel 6.12 LTS', category: { slug: 'kernel' }, tags: ['kernel'] },
          { slug: 'noticia-3', title: 'Debian 13 Trixie', category: { slug: 'distros' }, tags: ['debian'] }
        ];

        const related = NewsReaderEngine.findRelatedArticles(articleList, 'noticia-1', 2);
        expect(related.length).toBeGreaterThan(0);
        expect(related[0].slug).toBe('noticia-2');
      }
    },
    {
      name: 'F25.2: Excludes currently viewed article slug from related recommendations',
      async run() {
        const articleList = [
          { slug: 'current-news', title: 'Noticia Actual', category: { slug: 'kernel' } },
          { slug: 'other-news-1', title: 'Otra Noticia 1', category: { slug: 'kernel' } },
          { slug: 'other-news-2', title: 'Otra Noticia 2', category: { slug: 'kernel' } }
        ];

        const related = NewsReaderEngine.findRelatedArticles(articleList, 'current-news');
        const containsCurrent = related.some(a => a.slug === 'current-news');
        expect(containsCurrent).toBe(false);
      }
    },
    {
      name: 'F25.3: Prioritizes articles with overlapping tags (e.g. kernel, security)',
      async run() {
        const articleList = [
          { slug: 'target', title: 'Target', category: { slug: 'news' }, tags: ['security', 'cve', 'openssh'] },
          { slug: 'match-low', title: 'Low Match', category: { slug: 'news' }, tags: ['debian'] },
          { slug: 'match-high', title: 'High Match', category: { slug: 'news' }, tags: ['security', 'cve'] }
        ];

        const related = NewsReaderEngine.findRelatedArticles(articleList, 'target');
        expect(related[0].slug).toBe('match-high');
      }
    },
    {
      name: 'F25.4: Limits returned recommendations to requested limit (e.g. 3 articles)',
      async run() {
        const articleList = Array.from({ length: 10 }, (_, i) => ({
          slug: `news-${i}`,
          title: `News ${i}`,
          category: { slug: 'kernel' }
        }));

        const related = NewsReaderEngine.findRelatedArticles(articleList, 'news-0', 3);
        expect(related.length).toBe(3);
      }
    },
    {
      name: 'F25.5: Handles empty/single-article catalog returning empty related list',
      async run() {
        const singleList = [{ slug: 'only-one', title: 'Única Noticia', category: { slug: 'kernel' } }];
        const related = NewsReaderEngine.findRelatedArticles(singleList, 'only-one');
        expect(related.length).toBe(0);

        const empty = NewsReaderEngine.findRelatedArticles([], 'none');
        expect(empty.length).toBe(0);
      }
    }
  ]
};
