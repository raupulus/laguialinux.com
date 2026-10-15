import { expect } from '../harness/assert.mjs';
import { NewsReaderEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F24: Caja de Fuente Original con nofollow',
  tier: 1,
  tests: [
    {
      name: 'F24.1: Extracts official news sources list from metadata.sources',
      async run({ client }) {
        const response = await client.request('/platforms/news/contents/linux-kernel-6-13-publicado');
        const box = NewsReaderEngine.validateSourceBox(response.data.metadata.sources);

        expect(box.hasSources).toBe(true);
        expect(box.sources.length).toBe(2);
        expect(box.sources[0].title).toBe('Anuncio oficial en Linux Kernel Mailing List (LKML)');
      }
    },
    {
      name: 'F24.2: Enforces target="_blank" for all external canonical references',
      async run({ client }) {
        const response = await client.request('/platforms/news/contents/linux-kernel-6-13-publicado');
        const box = NewsReaderEngine.validateSourceBox(response.data.metadata.sources);

        for (const src of box.sources) {
          expect(src.target).toBe('_blank');
        }
      }
    },
    {
      name: 'F24.3: Enforces rel="noopener noreferrer nofollow" to prevent SEO link leakage and tab hijacking',
      async run({ client }) {
        const response = await client.request('/platforms/news/contents/linux-kernel-6-13-publicado');
        const box = NewsReaderEngine.validateSourceBox(response.data.metadata.sources);

        for (const src of box.sources) {
          expect(src.rel).toContain('noopener');
          expect(src.rel).toContain('noreferrer');
          expect(src.rel).toContain('nofollow');
        }
      }
    },
    {
      name: 'F24.4: Renders distinct primary source box with orange accent styling',
      async run() {
        const sourceBoxStyle = {
          borderClass: 'border-l-4 border-orange-500',
          bgClass: 'bg-orange-50/50 dark:bg-orange-950/20',
          title: 'Fuentes Oficiales y Referencias de la Noticia'
        };

        expect(sourceBoxStyle.borderClass).toContain('border-orange-500');
        expect(sourceBoxStyle.title).toContain('Fuentes Oficiales');
      }
    },
    {
      name: 'F24.5: Returns hasSources: false gracefully when article lacks external sources',
      async run() {
        const emptyBox = NewsReaderEngine.validateSourceBox([]);
        expect(emptyBox.hasSources).toBe(false);
        expect(emptyBox.sources.length).toBe(0);

        const nullBox = NewsReaderEngine.validateSourceBox(null);
        expect(nullBox.hasSources).toBe(false);
      }
    }
  ]
};
