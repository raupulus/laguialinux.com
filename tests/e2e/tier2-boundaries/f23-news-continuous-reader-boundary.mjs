import { expect } from '../harness/assert.mjs';
import { NewsReaderEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F23: Lector Continuo de Noticias (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F23.B1: Handles news article with only 1 page section (no secondary H2 generated)',
      async run() {
        const singlePage = [
          { id: 1, order: 1, title: 'Noticia Breve', body: '<p>Cuerpo único de la noticia</p>' }
        ];

        const stream = NewsReaderEngine.buildContinuousStream(singlePage);
        expect(stream.length).toBe(1);
        expect(stream[0].shouldRenderH2).toBe(false);
        expect(stream[0].renderedHtml).not.toContain('<h2>');
      }
    },
    {
      name: 'F23.B2: Handles sections with missing title relying on body content',
      async run() {
        const pagesNoTitle = [
          { id: 1, order: 1, title: '', body: '<p>Párrafo inicial</p>' },
          { id: 2, order: 2, title: '', body: '<p>Párrafo secundario</p>' }
        ];

        const stream = NewsReaderEngine.buildContinuousStream(pagesNoTitle);
        expect(stream.length).toBe(2);
        expect(stream[1].renderedHtml).toBe('<p>Párrafo secundario</p>');
      }
    },
    {
      name: 'F23.B3: Handles out-of-order section array by sorting strictly by order',
      async run() {
        const unordered = [
          { id: 3, order: 3, title: 'Conclusión', body: '<p>Tres</p>' },
          { id: 1, order: 1, title: 'Introducción', body: '<p>Uno</p>' },
          { id: 2, order: 2, title: 'Desarrollo', body: '<p>Dos</p>' }
        ];

        const stream = NewsReaderEngine.buildContinuousStream(unordered);
        expect(stream[0].order).toBe(1);
        expect(stream[1].order).toBe(2);
        expect(stream[2].order).toBe(3);
      }
    },
    {
      name: 'F23.B4: Handles article with 0 pages returning empty stream array',
      async run() {
        const stream = NewsReaderEngine.buildContinuousStream([]);
        expect(Array.isArray(stream)).toBe(true);
        expect(stream.length).toBe(0);

        const streamNull = NewsReaderEngine.buildContinuousStream(null);
        expect(Array.isArray(streamNull)).toBe(true);
        expect(streamNull.length).toBe(0);
      }
    },
    {
      name: 'F23.B5: Preserves embedded code snippets and blockquotes across continuous sections',
      async run() {
        const richPages = [
          { id: 1, order: 1, title: 'Intro', body: '<blockquote>Cita oficial de Linus</blockquote>' },
          { id: 2, order: 2, title: 'Comandos', body: '<pre><code>$ git log -n 5</code></pre>' }
        ];

        const stream = NewsReaderEngine.buildContinuousStream(richPages);
        expect(stream[0].renderedHtml).toContain('<blockquote>');
        expect(stream[1].renderedHtml).toContain('<pre><code>');
      }
    }
  ]
};
