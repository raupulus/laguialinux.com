import { expect } from '../harness/assert.mjs';
import { AdSenseAntiClsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F63: Standardized 5-Slot Catalog (AdSense Units)',
  tier: 1,
  tests: [
    {
      name: 'F63.1: Catalog contains exactly the 5 official slot definitions',
      async run() {
        const catalog = AdSenseAntiClsEngine.SLOT_CATALOG;
        const keys = Object.keys(catalog);

        expect(keys.length).toBe(5);
        expect(keys).toContain('top-leaderboard');
        expect(keys).toContain('sticky-sidebar');
        expect(keys).toContain('in-feed');
        expect(keys).toContain('in-article');
        expect(keys).toContain('multiplex');
      }
    },
    {
      name: 'F63.2: Each ad slot has a distinct unique slotId preventing placement collision',
      async run() {
        const catalog = AdSenseAntiClsEngine.SLOT_CATALOG;
        const ids = Object.values(catalog).map(s => s.slotId);
        const uniqueIds = new Set(ids);

        expect(ids.length).toBe(5);
        expect(uniqueIds.size).toBe(5);
      }
    },
    {
      name: 'F63.3: Top Leaderboard defines 728x90 desktop and 320x50 mobile dimensions',
      async run() {
        const slot = AdSenseAntiClsEngine.SLOT_CATALOG['top-leaderboard'];
        expect(slot.desktop.width).toBe(728);
        expect(slot.desktop.height).toBe(90);
        expect(slot.mobile.width).toBe(320);
        expect(slot.mobile.height).toBe(50);
      }
    },
    {
      name: 'F63.4: Sticky Sidebar defines 300x600 desktop and 300x250 mobile dimensions',
      async run() {
        const slot = AdSenseAntiClsEngine.SLOT_CATALOG['sticky-sidebar'];
        expect(slot.desktop.width).toBe(300);
        expect(slot.desktop.height).toBe(600);
        expect(slot.mobile.width).toBe(300);
        expect(slot.mobile.height).toBe(250);
      }
    },
    {
      name: 'F63.5: In-Article defines 728x280 desktop and 320x250 mobile dimensions',
      async run() {
        const slot = AdSenseAntiClsEngine.SLOT_CATALOG['in-article'];
        expect(slot.desktop.width).toBe(728);
        expect(slot.desktop.height).toBe(280);
        expect(slot.mobile.width).toBe(320);
        expect(slot.mobile.height).toBe(250);
      }
    }
  ]
};
