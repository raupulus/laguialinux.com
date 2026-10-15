import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F16: Selector Rápido de Pasos (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F16.B1: Handles empty pages array returning empty tabs array',
      async run() {
        const tabs = GuideEngine.generateStepTabs([], 'slug');
        expect(Array.isArray(tabs)).toBe(true);
        expect(tabs.length).toBe(0);

        const nullTabs = GuideEngine.generateStepTabs(null, 'slug');
        expect(Array.isArray(nullTabs)).toBe(true);
        expect(nullTabs.length).toBe(0);
      }
    },
    {
      name: 'F16.B2: When activeStepSlug matches no step, defaults active state to first step',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const state = GuideEngine.calculateStepReaderState(response.data.pages, 'paso-inexistente');

        expect(state.currentIndex).toBe(0);
        expect(state.currentPage.slug).toBe('diagnostico-swap');
      }
    },
    {
      name: 'F16.B3: Exactly one tab has aria-current="step" even with identical step titles',
      async run() {
        const pages = [
          { id: 1, order: 1, slug: 'step-a', title: 'Paso Genérico' },
          { id: 2, order: 2, slug: 'step-b', title: 'Paso Genérico' },
          { id: 3, order: 3, slug: 'step-c', title: 'Paso Genérico' }
        ];

        const tabs = GuideEngine.generateStepTabs(pages, 'step-b');
        const activeCount = tabs.filter(t => t.ariaCurrent === 'step').length;

        expect(activeCount).toBe(1);
        expect(tabs[1].ariaCurrent).toBe('step');
      }
    },
    {
      name: 'F16.B4: Handles step titles with special unicode or punctuation',
      async run() {
        const unicodePages = [
          { id: 1, order: 1, slug: 'optimizacion', title: '1. Diagnóstico & Memoria (RAM / Swap) → Paso Inicial' }
        ];

        const tabs = GuideEngine.generateStepTabs(unicodePages, 'optimizacion');
        expect(tabs[0].title).toBe('1. Diagnóstico & Memoria (RAM / Swap) → Paso Inicial');
      }
    },
    {
      name: 'F16.B5: Extremely long step titles truncate gracefully without breaking tab data',
      async run() {
        const longTitle = 'A'.repeat(250);
        const pages = [{ id: 1, order: 1, slug: 'long', title: longTitle }];

        const tabs = GuideEngine.generateStepTabs(pages, 'long');
        expect(tabs[0].title.length).toBe(250);
        expect(tabs[0].isActive).toBe(true);
      }
    }
  ]
};
