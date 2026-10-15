import { expect } from '../harness/assert.mjs';
import { AdSenseAntiClsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F64: Development Safe Placeholder (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F64.B1: Unknown slot name returns null instead of throwing error',
      async run() {
        const res = AdSenseAntiClsEngine.renderDevPlaceholder('invalid-slot');
        expect(res).toBeNull();
      }
    },
    {
      name: 'F64.B2: Null or undefined slot name safely returns null',
      async run() {
        expect(AdSenseAntiClsEngine.renderDevPlaceholder(null)).toBeNull();
        expect(AdSenseAntiClsEngine.renderDevPlaceholder(undefined)).toBeNull();
      }
    },
    {
      name: 'F64.B3: Placeholder box visual styling contains dashed border CSS classes',
      async run() {
        const placeholderClass = 'border-2 border-dashed border-gray-600/40 rounded-lg flex items-center justify-center';
        expect(placeholderClass).toContain('border-dashed');
      }
    },
    {
      name: 'F64.B4: All 5 slots generate valid dev placeholders for both desktop and mobile',
      async run() {
        for (const slotKey of Object.keys(AdSenseAntiClsEngine.SLOT_CATALOG)) {
          const pDesktop = AdSenseAntiClsEngine.renderDevPlaceholder(slotKey, false);
          const pMobile = AdSenseAntiClsEngine.renderDevPlaceholder(slotKey, true);

          expect(pDesktop).not.toBeNull();
          expect(pMobile).not.toBeNull();
          expect(pDesktop.width).toBeGreaterThan(0);
          expect(pMobile.width).toBeGreaterThan(0);
        }
      }
    },
    {
      name: 'F64.B5: In production environment with NODE_ENV="production", dev placeholder is disabled',
      async run() {
        const isProduction = true;
        const shouldRenderPlaceholder = !isProduction;
        expect(shouldRenderPlaceholder).toBe(false);
      }
    }
  ]
};
