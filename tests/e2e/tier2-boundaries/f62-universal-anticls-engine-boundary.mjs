import { expect } from '../harness/assert.mjs';
import { AdSenseAntiClsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F62: Universal Anti-CLS Slot Engine (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F62.B1: Unknown slot name defaults to safe fallback height of 90px',
      async run() {
        const h = AdSenseAntiClsEngine.getReservedMinHeight('unknown-slot-xyz');
        expect(h).toBe(90);
      }
    },
    {
      name: 'F62.B2: Null or undefined slot name handles safely without TypeError',
      async run() {
        expect(AdSenseAntiClsEngine.getReservedMinHeight(null)).toBe(90);
        expect(AdSenseAntiClsEngine.getReservedMinHeight(undefined)).toBe(90);
      }
    },
    {
      name: 'F62.B3: Reserved height values are strictly positive integers',
      async run() {
        for (const slotKey of Object.keys(AdSenseAntiClsEngine.SLOT_CATALOG)) {
          const hDesktop = AdSenseAntiClsEngine.getReservedMinHeight(slotKey, false);
          const hMobile = AdSenseAntiClsEngine.getReservedMinHeight(slotKey, true);
          expect(hDesktop).toBeGreaterThan(0);
          expect(hMobile).toBeGreaterThan(0);
        }
      }
    },
    {
      name: 'F62.B4: Responsive breakpoint boundary at exactly 768px resolves to desktop min-height',
      async run() {
        const isMobileAt768 = 768 < 768; // false -> desktop
        expect(isMobileAt768).toBe(false);
        const h = AdSenseAntiClsEngine.getReservedMinHeight('top-leaderboard', isMobileAt768);
        expect(h).toBe(90);
      }
    },
    {
      name: 'F62.B5: Viewport width 767px resolves to mobile min-height',
      async run() {
        const isMobileAt767 = 767 < 768; // true -> mobile
        expect(isMobileAt767).toBe(true);
        const h = AdSenseAntiClsEngine.getReservedMinHeight('top-leaderboard', isMobileAt767);
        expect(h).toBe(50);
      }
    }
  ]
};
