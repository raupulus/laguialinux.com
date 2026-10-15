import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F14: Lector Multipaso (/guia/[slug]/[page]) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F14.B1: Out-of-bounds or unrecognized step slug defaults safely to first step (index 0)',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const state = GuideEngine.calculateStepReaderState(response.data.pages, 'slug-inexistente-xyz');

        expect(state.currentIndex).toBe(0);
        expect(state.currentPage.slug).toBe('diagnostico-swap');
        expect(state.isFirstStep).toBe(true);
      }
    },
    {
      name: 'F14.B2: Single-step guide computes 100% progress immediately on first step',
      async run() {
        const singlePage = [{ id: 1, order: 1, slug: 'intro', title: 'Intro', body: '<p>Contenido</p>' }];
        const state = GuideEngine.calculateStepReaderState(singlePage, 'intro');

        expect(state.progressPercent).toBe(100);
        expect(state.isFirstStep).toBe(true);
        expect(state.isLastStep).toBe(true);
      }
    },
    {
      name: 'F14.B3: Very long guide (e.g. 50 steps) calculates progress smoothly without overflow',
      async run() {
        const fiftyPages = Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          order: i + 1,
          slug: `paso-${i + 1}`,
          title: `Paso ${i + 1}`,
          body: `<p>Contenido ${i + 1}</p>`
        }));

        const midState = GuideEngine.calculateStepReaderState(fiftyPages, 'paso-25');
        expect(midState.progressPercent).toBe(50);

        const endState = GuideEngine.calculateStepReaderState(fiftyPages, 'paso-50');
        expect(endState.progressPercent).toBe(100);
        expect(endState.isLastStep).toBe(true);
      }
    },
    {
      name: 'F14.B4: Handles page with empty body string without throwing errors',
      async run() {
        const emptyBodyPage = [{ id: 1, order: 1, slug: 'vacio', title: 'Paso Vacío', body: '' }];
        const state = GuideEngine.calculateStepReaderState(emptyBodyPage, 'vacio');

        expect(state.currentPage.body).toBe('');
      }
    },
    {
      name: 'F14.B5: Step title containing HTML special characters (<, >, &) is preserved safely',
      async run() {
        const specialTitlePage = [
          { id: 1, order: 1, slug: 'html-chars', title: 'Paso 1: Configurar <stdin> & stdout', body: '<p>Test</p>' }
        ];

        const state = GuideEngine.calculateStepReaderState(specialTitlePage, 'html-chars');
        expect(state.currentPage.title).toBe('Paso 1: Configurar <stdin> & stdout');
      }
    }
  ]
};
