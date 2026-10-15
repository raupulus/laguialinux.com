import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F12: Tabla de Contenidos y Pasos de Guía',
  tier: 1,
  tests: [
    {
      name: 'F12.1: Generates ordered step index cards with step numbers and reading times',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const toc = GuideEngine.generateStepIndex(response.data.pages, '/guia/optimizacion-swap-swappiness-debian');

        expect(toc.steps.length).toBe(3);
        expect(toc.steps[0].stepNumber).toBe(1);
        expect(toc.steps[0].title).toBe('Diagnóstico del uso actual de Swap');
        expect(toc.steps[0].reading_time_minutes).toBe(2);
        expect(toc.steps[1].stepNumber).toBe(2);
        expect(toc.steps[2].stepNumber).toBe(3);
      }
    },
    {
      name: 'F12.2: Generates primary CTA button linking directly to first step URL',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const toc = GuideEngine.generateStepIndex(response.data.pages, '/guia/optimizacion-swap-swappiness-debian');

        expect(toc.startGuideCta).toBeTruthy();
        expect(toc.startGuideCta.firstStepSlug).toBe('diagnostico-swap');
        expect(toc.startGuideCta.targetUrl).toBe('/guia/optimizacion-swap-swappiness-debian/diagnostico-swap');
        expect(toc.startGuideCta.label).toContain('Comenzar Guía (Paso 1:');
      }
    },
    {
      name: 'F12.3: Calculates cumulative reading time across all guide steps',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const toc = GuideEngine.generateStepIndex(response.data.pages);

        // 2 + 4 + 2 = 8 minutes
        expect(toc.totalReadingTime).toBe(8);
      }
    },
    {
      name: 'F12.4: Generates direct URL paths matching /:categoria/:slug/:paso',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const toc = GuideEngine.generateStepIndex(response.data.pages, '/comandos/optimizacion-swap-swappiness-debian');

        expect(toc.steps[0].stepPath).toBe('/comandos/optimizacion-swap-swappiness-debian/diagnostico-swap');
        expect(toc.steps[1].stepPath).toBe('/comandos/optimizacion-swap-swappiness-debian/configuracion-zram-sysctl');
        expect(toc.steps[2].stepPath).toBe('/comandos/optimizacion-swap-swappiness-debian/pruebas-estres');
      }
    },
    {
      name: 'F12.5: Verifies step card order matches ascending sequence defined in pages',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/guia-comandos-find-xargs');
        const toc = GuideEngine.generateStepIndex(response.data.pages, '/guia/guia-comandos-find-xargs');

        expect(toc.steps.length).toBe(4);
        for (let i = 0; i < toc.steps.length; i++) {
          expect(toc.steps[i].stepNumber).toBe(i + 1);
        }
      }
    }
  ]
};
