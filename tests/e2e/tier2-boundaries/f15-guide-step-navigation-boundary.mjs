import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F15: Navegación de Pasos (Anterior/Siguiente) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F15.B1: Arrow keys do not trigger navigation when user is focused on an <input> element',
      async run() {
        const dummyPrev = { slug: 'prev-step' };
        const dummyNext = { slug: 'next-step' };

        const target = GuideEngine.handleKeyboardNavigation('ArrowRight', {
          previousPage: dummyPrev,
          nextPage: dummyNext,
          targetTag: 'input'
        });

        expect(target).toBeNull();
      }
    },
    {
      name: 'F15.B2: Arrow keys do not trigger navigation when user is typing in a <textarea>',
      async run() {
        const dummyPrev = { slug: 'prev-step' };
        const dummyNext = { slug: 'next-step' };

        const target = GuideEngine.handleKeyboardNavigation('ArrowLeft', {
          previousPage: dummyPrev,
          nextPage: dummyNext,
          targetTag: 'textarea'
        });

        expect(target).toBeNull();
      }
    },
    {
      name: 'F15.B3: Arrow keys do not trigger navigation when active element is contentEditable',
      async run() {
        const dummyPrev = { slug: 'prev-step' };
        const dummyNext = { slug: 'next-step' };

        const target = GuideEngine.handleKeyboardNavigation('ArrowRight', {
          previousPage: dummyPrev,
          nextPage: dummyNext,
          targetTag: 'div',
          isContentEditable: true
        });

        expect(target).toBeNull();
      }
    },
    {
      name: 'F15.B4: Left arrow on step 1 returns null without navigating',
      async run() {
        const target = GuideEngine.handleKeyboardNavigation('ArrowLeft', {
          previousPage: null, // Step 1 boundary
          nextPage: { slug: 'step-2' },
          targetTag: 'body'
        });

        expect(target).toBeNull();
      }
    },
    {
      name: 'F15.B5: Right arrow on final step returns null without navigating',
      async run() {
        const target = GuideEngine.handleKeyboardNavigation('ArrowRight', {
          previousPage: { slug: 'step-2' },
          nextPage: null, // Final step boundary
          targetTag: 'body'
        });

        expect(target).toBeNull();
      }
    }
  ]
};
