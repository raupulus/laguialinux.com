import { expect } from '../harness/assert.mjs';
import { SearchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F36: Result Grouping & Differentiation (Guides, Commands, News)',
  tier: 1,
  tests: [
    {
      name: 'F36.1: Groups raw content items into guides, commands, and news buckets',
      async run() {
        const rawItems = [
          { title: 'Guía de find', type: { slug: 'guide' }, category_slug: 'comandos' },
          { title: 'Optimización de swap', type: { slug: 'blog' }, category_slug: 'comandos' },
          { title: 'Lanzamiento de Linux 6.12', type: { slug: 'news' }, category_slug: 'kernel' }
        ];

        const grouped = SearchEngine.groupResults(rawItems);
        expect(grouped.groups.guides.length).toBe(1);
        expect(grouped.groups.commands.length).toBe(1);
        expect(grouped.groups.news.length).toBe(1);
        expect(grouped.totalCount).toBe(3);
      }
    },
    {
      name: 'F36.2: Correctly calculates group counts for each category',
      async run() {
        const rawItems = [
          { title: 'Guía 1', type: { slug: 'guide' } },
          { title: 'Guía 2', type: { slug: 'guide' } },
          { title: 'Noticia 1', type: { slug: 'news' } }
        ];

        const grouped = SearchEngine.groupResults(rawItems);
        expect(grouped.groupCounts.guides).toBe(2);
        expect(grouped.groupCounts.commands).toBe(0);
        expect(grouped.groupCounts.news).toBe(1);
      }
    },
    {
      name: 'F36.3: Empty items list produces empty groups with 0 totalCount',
      async run() {
        const grouped = SearchEngine.groupResults([]);
        expect(grouped.totalCount).toBe(0);
        expect(grouped.groups.guides.length).toBe(0);
        expect(grouped.groups.commands.length).toBe(0);
        expect(grouped.groups.news.length).toBe(0);
      }
    },
    {
      name: 'F36.4: Highlights matching query substring using mark HTML tags',
      async run() {
        const title = 'Guía completa de comandos find y xargs';
        const highlighted = SearchEngine.highlightQuery(title, 'find');

        expect(highlighted).toContain('<mark class="bg-primary/20 text-primary font-semibold">find</mark>');
        expect(highlighted).toContain('xargs');
      }
    },
    {
      name: 'F36.5: Case-insensitive highlight preserves original text casing in output',
      async run() {
        const title = 'Aprende a usar DPKG y APT';
        const highlighted = SearchEngine.highlightQuery(title, 'dpkg');

        expect(highlighted).toContain('DPKG');
        expect(highlighted).toContain('<mark');
      }
    }
  ]
};
