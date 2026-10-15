import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F12: Tabla de Contenidos y Pasos de Guía (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F12.B1: Handles single-step guide gracefully without breaking step index',
      async run() {
        const singleStep = [
          { id: 1, order: 1, title: 'Paso Único', slug: 'paso-unico', reading_time_minutes: 3 }
        ];

        const toc = GuideEngine.generateStepIndex(singleStep, '/guia/single-step');
        expect(toc.steps.length).toBe(1);
        expect(toc.startGuideCta.firstStepSlug).toBe('paso-unico');
        expect(toc.totalReadingTime).toBe(3);
      }
    },
    {
      name: 'F12.B2: Handles unordered pages array by sorting strictly by order property',
      async run() {
        const unordered = [
          { id: 3, order: 3, title: 'Tercero', slug: 'tercero', reading_time_minutes: 2 },
          { id: 1, order: 1, title: 'Primero', slug: 'primero', reading_time_minutes: 1 },
          { id: 2, order: 2, title: 'Segundo', slug: 'segundo', reading_time_minutes: 2 }
        ];

        const toc = GuideEngine.generateStepIndex(unordered);
        expect(toc.steps[0].slug).toBe('primero');
        expect(toc.steps[1].slug).toBe('segundo');
        expect(toc.steps[2].slug).toBe('tercero');
      }
    },
    {
      name: 'F12.B3: Handles empty pages array returning empty steps list and null CTA',
      async run() {
        const toc = GuideEngine.generateStepIndex([]);
        expect(toc.steps.length).toBe(0);
        expect(toc.startGuideCta).toBeNull();
        expect(toc.totalReadingTime).toBe(0);
      }
    },
    {
      name: 'F12.B4: Recovers when page reading_time_minutes is missing defaulting to 1 minute',
      async run() {
        const missingReading = [
          { id: 1, order: 1, title: 'Sin tiempo', slug: 'sin-tiempo' }
        ];

        const toc = GuideEngine.generateStepIndex(missingReading);
        expect(toc.steps[0].reading_time_minutes).toBe(1);
      }
    },
    {
      name: 'F12.B5: Preserves custom URL slugs with dots, numbers, and dashes (e.g. paso-1.2-btrfs)',
      async run() {
        const customPages = [
          { id: 1, order: 1, title: 'Subpaso', slug: 'paso-1.2-btrfs-subvolume' }
        ];

        const toc = GuideEngine.generateStepIndex(customPages, '/comandos/guia-btrfs');
        expect(toc.steps[0].stepPath).toBe('/comandos/guia-btrfs/paso-1.2-btrfs-subvolume');
      }
    }
  ]
};
