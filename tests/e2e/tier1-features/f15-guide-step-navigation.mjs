import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F15: Navegación de Pasos (Anterior/Siguiente)',
  tier: 1,
  tests: [
    {
      name: 'F15.1: Exposes previousPage with valid title and slug when not on first step',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const state = GuideEngine.calculateStepReaderState(response.data.pages, 'configuracion-zram-sysctl');

        expect(state.previousPage).toBeTruthy();
        expect(state.previousPage.slug).toBe('diagnostico-swap');
        expect(state.previousPage.title).toBe('Diagnóstico del uso actual de Swap');
      }
    },
    {
      name: 'F15.2: Disables previous button (previousPage === null) on step 1',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const state = GuideEngine.calculateStepReaderState(response.data.pages, 'diagnostico-swap');

        expect(state.previousPage).toBeNull();
      }
    },
    {
      name: 'F15.3: Exposes nextPage with valid title and slug when not on last step',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const state = GuideEngine.calculateStepReaderState(response.data.pages, 'configuracion-zram-sysctl');

        expect(state.nextPage).toBeTruthy();
        expect(state.nextPage.slug).toBe('pruebas-estres');
        expect(state.nextPage.title).toBe('Verificación de rendimiento y pruebas de estrés');
      }
    },
    {
      name: 'F15.4: Disables next button (nextPage === null) on final step',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const state = GuideEngine.calculateStepReaderState(response.data.pages, 'pruebas-estres');

        expect(state.nextPage).toBeNull();
      }
    },
    {
      name: 'F15.5: Keyboard navigation maps ArrowLeft to previous step and ArrowRight to next step',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const state = GuideEngine.calculateStepReaderState(response.data.pages, 'configuracion-zram-sysctl');

        // ArrowLeft -> previous
        const leftTarget = GuideEngine.handleKeyboardNavigation('ArrowLeft', {
          previousPage: state.previousPage,
          nextPage: state.nextPage,
          targetTag: 'body'
        });
        expect(leftTarget).toBe('diagnostico-swap');

        // ArrowRight -> next
        const rightTarget = GuideEngine.handleKeyboardNavigation('ArrowRight', {
          previousPage: state.previousPage,
          nextPage: state.nextPage,
          targetTag: 'body'
        });
        expect(rightTarget).toBe('pruebas-estres');
      }
    }
  ]
};
