import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F16: Selector Rápido de Pasos',
  tier: 1,
  tests: [
    {
      name: 'F16.1: Generates top horizontal tabs for each guide step with step numbers',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const tabs = GuideEngine.generateStepTabs(response.data.pages, 'configuracion-zram-sysctl');

        expect(tabs.length).toBe(3);
        expect(tabs[0].stepNumber).toBe(1);
        expect(tabs[1].stepNumber).toBe(2);
        expect(tabs[2].stepNumber).toBe(3);
      }
    },
    {
      name: 'F16.2: Applies active state and aria-current="step" strictly to current step tab',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const tabs = GuideEngine.generateStepTabs(response.data.pages, 'configuracion-zram-sysctl');

        expect(tabs[1].isActive).toBe(true);
        expect(tabs[1].ariaCurrent).toBe('step');
      }
    },
    {
      name: 'F16.3: Inactive tabs do not receive aria-current attribute',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const tabs = GuideEngine.generateStepTabs(response.data.pages, 'configuracion-zram-sysctl');

        expect(tabs[0].isActive).toBe(false);
        expect(tabs[0].ariaCurrent).toBeUndefined();
        expect(tabs[2].isActive).toBe(false);
        expect(tabs[2].ariaCurrent).toBeUndefined();
      }
    },
    {
      name: 'F16.4: Step tabs preserve step titles and sequential ordering',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const tabs = GuideEngine.generateStepTabs(response.data.pages, 'diagnostico-swap');

        expect(tabs[0].title).toBe('Diagnóstico del uso actual de Swap');
        expect(tabs[1].title).toBe('Configuración de zram y sysctl.conf');
        expect(tabs[2].title).toBe('Verificación de rendimiento y pruebas de estrés');
      }
    },
    {
      name: 'F16.5: Direct click on arbitrary tab slug resolves to that step\'s destination URL',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const toc = GuideEngine.generateStepIndex(response.data.pages, '/guia/optimizacion-swap-swappiness-debian');
        const step3 = toc.steps.find(s => s.slug === 'pruebas-estres');

        expect(step3).toBeTruthy();
        expect(step3.stepPath).toBe('/guia/optimizacion-swap-swappiness-debian/pruebas-estres');
      }
    }
  ]
};
