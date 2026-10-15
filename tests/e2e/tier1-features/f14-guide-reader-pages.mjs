import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F14: Lector Multipaso (/guia/[slug]/[page])',
  tier: 1,
  tests: [
    {
      name: 'F14.1: Loads target step body content by slug within guide context',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const state = GuideEngine.calculateStepReaderState(response.data.pages, 'configuracion-zram-sysctl');

        expect(state.currentPage).toBeTruthy();
        expect(state.currentPage.slug).toBe('configuracion-zram-sysctl');
        expect(state.currentPage.body).toContain('sysctl vm.swappiness');
      }
    },
    {
      name: 'F14.2: Computes active step index and total steps count',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const state = GuideEngine.calculateStepReaderState(response.data.pages, 'configuracion-zram-sysctl');

        expect(state.currentIndex).toBe(1); // 0-indexed
        expect(state.totalPages).toBe(3);
      }
    },
    {
      name: 'F14.3: Calculates reading progress percentage proportionally ((step / total) * 100)',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');

        // Step 1: (1/3) * 100 = 33%
        const s1 = GuideEngine.calculateStepReaderState(response.data.pages, 'diagnostico-swap');
        expect(s1.progressPercent).toBe(33);

        // Step 2: (2/3) * 100 = 67%
        const s2 = GuideEngine.calculateStepReaderState(response.data.pages, 'configuracion-zram-sysctl');
        expect(s2.progressPercent).toBe(67);

        // Step 3: (3/3) * 100 = 100%
        const s3 = GuideEngine.calculateStepReaderState(response.data.pages, 'pruebas-estres');
        expect(s3.progressPercent).toBe(100);
      }
    },
    {
      name: 'F14.4: Identifies first step boundary correctly (currentIndex === 0, isFirstStep === true)',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const state = GuideEngine.calculateStepReaderState(response.data.pages, 'diagnostico-swap');

        expect(state.isFirstStep).toBe(true);
        expect(state.isLastStep).toBe(false);
        expect(state.previousPage).toBeNull();
        expect(state.nextPage).toBeTruthy();
      }
    },
    {
      name: 'F14.5: Identifies last step boundary correctly (currentIndex === total - 1, isLastStep === true)',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const state = GuideEngine.calculateStepReaderState(response.data.pages, 'pruebas-estres');

        expect(state.isFirstStep).toBe(false);
        expect(state.isLastStep).toBe(true);
        expect(state.previousPage).toBeTruthy();
        expect(state.nextPage).toBeNull();
      }
    }
  ]
};
