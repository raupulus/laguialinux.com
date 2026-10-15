import { expect } from '../harness/assert.mjs';
import { NewsReaderEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F23: Lector Continuo de Noticias (/noticia/[slug])',
  tier: 1,
  tests: [
    {
      name: 'F23.1: Retrieves unpaginated news article with full editorial metadata',
      async run({ client }) {
        const response = await client.request('/platforms/news/contents/linux-kernel-6-13-publicado');
        expect(response.success).toBe(true);
        expect(response.data.title).toBe('Linux Kernel 6.13 publicado oficialmente con soporte mejorado para ARM64 y Bcachefs');
        expect(response.data.type.slug).toBe('news');
        expect(response.data.pages.length).toBe(2);
      }
    },
    {
      name: 'F23.2: Assembles multi-section news into a single vertical continuous reading stream',
      async run({ client }) {
        const response = await client.request('/platforms/news/contents/linux-kernel-6-13-publicado');
        const stream = NewsReaderEngine.buildContinuousStream(response.data.pages);

        expect(stream.length).toBe(2);
        expect(stream[0].order).toBe(1);
        expect(stream[1].order).toBe(2);
      }
    },
    {
      name: 'F23.3: Automatically injects H2 subheadings for secondary sections (order > 1)',
      async run({ client }) {
        const response = await client.request('/platforms/news/contents/linux-kernel-6-13-publicado');
        const stream = NewsReaderEngine.buildContinuousStream(response.data.pages);

        expect(stream[1].shouldRenderH2).toBe(true);
        expect(stream[1].renderedHtml).toContain('<h2>Controladores gráficos y sistemas de ficheros</h2>');
      }
    },
    {
      name: 'F23.4: Section 1 renders as primary narrative body without redundant secondary H2',
      async run({ client }) {
        const response = await client.request('/platforms/news/contents/linux-kernel-6-13-publicado');
        const stream = NewsReaderEngine.buildContinuousStream(response.data.pages);

        expect(stream[0].shouldRenderH2).toBe(false);
        expect(stream[0].renderedHtml).not.toContain('<h2>');
      }
    },
    {
      name: 'F23.5: Calculates reading time badge in minutes for quick consumption',
      async run({ client }) {
        const response = await client.request('/platforms/news/contents/linux-kernel-6-13-publicado');
        const minutes = response.data.metadata.reading_time_minutes;

        expect(minutes).toBe(3);
        expect(typeof minutes).toBe('number');
      }
    }
  ]
};
