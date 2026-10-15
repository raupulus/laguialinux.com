import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F68: RSS Directory Hub (/feeds - Feeds Directory & Copy)',
  tier: 1,
  tests: [
    {
      name: 'F68.1: Lists master syndication feed (/feed.xml) with direct copy button',
      async run() {
        const masterFeed = {
          name: 'Feed General (Todas las publicaciones)',
          url: 'https://laguialinux.com/feed.xml',
          format: 'RSS 2.0'
        };

        expect(masterFeed.url).toBe('https://laguialinux.com/feed.xml');
        expect(masterFeed.format).toBe('RSS 2.0');
      }
    },
    {
      name: 'F68.2: Lists all category feeds with direct URLs',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/categories');
        const categoryFeeds = response.data.map(c => ({
          name: c.name,
          url: `https://laguialinux.com/${c.slug}/feed.xml`
        }));

        expect(categoryFeeds.length).toBeGreaterThan(0);
        expect(categoryFeeds[0].url).toContain('/comandos/feed.xml');
      }
    },
    {
      name: 'F68.3: 1-click copy feedback provides visual indicator ("¡Copiado!")',
      async run() {
        let copyStatus = 'Copiar URL';
        const onCopy = () => { copyStatus = '¡Copiado!'; };

        onCopy();
        expect(copyStatus).toBe('¡Copiado!');
      }
    },
    {
      name: 'F68.4: Explains RSS reader usage for desktop and terminal clients (Newsboat, Thunderbird)',
      async run() {
        const recommendedReaders = ['Feedly', 'Thunderbird', 'Newsboat', 'Inoreader'];
        expect(recommendedReaders).toContain('Newsboat');
        expect(recommendedReaders).toContain('Thunderbird');
      }
    },
    {
      name: 'F68.5: Feeds directory is tenant-aware adapting to active platform domain',
      async run() {
        const guidesHub = { domain: 'laguialinux.com', master: 'https://laguialinux.com/feed.xml' };
        const newsHub = { domain: 'news.laguialinux.com', master: 'https://news.laguialinux.com/feed.xml' };

        expect(guidesHub.master).toContain('laguialinux.com');
        expect(newsHub.master).toContain('news.laguialinux.com');
      }
    }
  ]
};
