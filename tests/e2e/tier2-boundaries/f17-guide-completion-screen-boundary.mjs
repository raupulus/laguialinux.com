import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F17: Pantalla Final de Completitud de Guía (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F17.B1: Single-page guide marks completion immediately on its only step',
      async run() {
        const singlePage = [{ id: 1, order: 1, slug: 'intro', title: 'Intro' }];
        const comp = GuideEngine.calculateCompletionScreen(singlePage, 'intro');

        expect(comp.isCompleted).toBe(true);
        expect(comp.completedSteps).toBe(1);
      }
    },
    {
      name: 'F17.B2: Mid-guide steps (e.g. step 2 of 5) strictly do not trigger completion state',
      async run() {
        const fivePages = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          order: i + 1,
          slug: `step-${i + 1}`,
          title: `Paso ${i + 1}`
        }));

        const comp = GuideEngine.calculateCompletionScreen(fivePages, 'step-2');
        expect(comp.isCompleted).toBe(false);
        expect(comp.headline).toBe('Progreso en curso');
      }
    },
    {
      name: 'F17.B3: Navigating backwards from final step clears completion state',
      async run() {
        const pages = [
          { id: 1, order: 1, slug: 'step-1' },
          { id: 2, order: 2, slug: 'step-2' }
        ];

        const compStep2 = GuideEngine.calculateCompletionScreen(pages, 'step-2');
        expect(compStep2.isCompleted).toBe(true);

        const compStep1 = GuideEngine.calculateCompletionScreen(pages, 'step-1');
        expect(compStep1.isCompleted).toBe(false);
      }
    },
    {
      name: 'F17.B4: Empty guide (0 steps) does not trigger completion state',
      async run() {
        const comp = GuideEngine.calculateCompletionScreen([], 'any');
        expect(comp.isCompleted).toBe(false);
        expect(comp.totalSteps).toBe(0);
      }
    },
    {
      name: 'F17.B5: Completion share URL handles guide titles with special characters cleanly',
      async run() {
        const pages = [
          { id: 1, order: 1, slug: 'diagnostico-swap', title: 'Diagnóstico & Swap' }
        ];

        const comp = GuideEngine.calculateCompletionScreen(pages, 'diagnostico-swap', 'Guía: Swap & Zram');
        expect(comp.shareUrl).toBe('https://laguialinux.com/guia/diagnostico-swap');
      }
    }
  ]
};
