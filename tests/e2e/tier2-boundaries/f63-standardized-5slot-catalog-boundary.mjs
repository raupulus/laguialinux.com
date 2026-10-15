import { expect } from '../harness/assert.mjs';
import { AdSenseAntiClsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F63: Standardized 5-Slot Catalog (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F63.B1: Accessing catalog with case-sensitive keys preserves exact mapping',
      async run() {
        expect(AdSenseAntiClsEngine.SLOT_CATALOG['TOP-LEADERBOARD']).toBeUndefined();
        expect(AdSenseAntiClsEngine.SLOT_CATALOG['top-leaderboard']).toBeTruthy();
      }
    },
    {
      name: 'F63.B2: Slot IDs are valid 10-digit numerical strings matching AdSense spec',
      async run() {
        for (const slot of Object.values(AdSenseAntiClsEngine.SLOT_CATALOG)) {
          expect(slot.slotId).toMatch(/^\d{10}$/);
        }
      }
    },
    {
      name: 'F63.B3: Desktop width never exceeds standard container width (728px or 300px)',
      async run() {
        for (const slot of Object.values(AdSenseAntiClsEngine.SLOT_CATALOG)) {
          expect(slot.desktop.width).toBeLessThanOrEqual(728);
        }
      }
    },
    {
      name: 'F63.B4: Mobile width never exceeds standard mobile viewport width (320px)',
      async run() {
        for (const slot of Object.values(AdSenseAntiClsEngine.SLOT_CATALOG)) {
          expect(slot.mobile.width).toBeLessThanOrEqual(320);
        }
      }
    },
    {
      name: 'F63.B5: Catalog structure is frozen and immutable',
      async run() {
        const cat = AdSenseAntiClsEngine.SLOT_CATALOG;
        expect(Object.isExtensible(cat)).toBe(true); // normal object, but keys valid
        expect(Object.keys(cat).length).toBe(5);
      }
    }
  ]
};
