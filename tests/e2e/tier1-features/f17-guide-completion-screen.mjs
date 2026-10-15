import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F17: Pantalla Final de Completitud de Guía',
  tier: 1,
  tests: [
    {
      name: 'F17.1: Triggers completed state when user reaches the final guide step',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const completion = GuideEngine.calculateCompletionScreen(
          response.data.pages,
          'pruebas-estres',
          response.data.title
        );

        expect(completion.isCompleted).toBe(true);
        expect(completion.headline).toContain('Has completado la guía');
      }
    },
    {
      name: 'F17.2: Displays congratulatory headline and summary of completed steps',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const completion = GuideEngine.calculateCompletionScreen(
          response.data.pages,
          'pruebas-estres',
          response.data.title
        );

        expect(completion.completedSteps).toBe(3);
        expect(completion.totalSteps).toBe(3);
      }
    },
    {
      name: 'F17.3: Progress bar reaches 100% on the completion step',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const readerState = GuideEngine.calculateStepReaderState(response.data.pages, 'pruebas-estres');

        expect(readerState.progressPercent).toBe(100);
        expect(readerState.isLastStep).toBe(true);
      }
    },
    {
      name: 'F17.4: Generates canonical share URL pointing to guide root',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const completion = GuideEngine.calculateCompletionScreen(
          response.data.pages,
          'pruebas-estres',
          response.data.title
        );

        expect(completion.shareUrl).toBeTruthy();
        expect(completion.shareUrl).toBe('https://laguialinux.com/guia/diagnostico-swap');
      }
    },
    {
      name: 'F17.5: Recommends related technical guides from platform catalog',
      async run({ client }) {
        const catalog = await client.request('/platforms/laguialinux/contents', {
          params: { category: 'comandos', per_page: 5 }
        });

        expect(catalog.success).toBe(true);
        const related = catalog.data.filter(c => c.slug !== 'optimizacion-swap-swappiness-debian');
        expect(related.length).toBeGreaterThan(0);
        expect(related[0].title).toBeTruthy();
      }
    }
  ]
};
