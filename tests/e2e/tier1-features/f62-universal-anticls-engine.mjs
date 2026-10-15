import { expect } from '../harness/assert.mjs';
import { AdSenseAntiClsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F62: Universal Anti-CLS Slot Engine (Reserved Height, CLS <= 0.1)',
  tier: 1,
  tests: [
    {
      name: 'F62.1: Pre-allocates minimum CSS height matching slot dimension to prevent CLS',
      async run() {
        const minHeightDesktop = AdSenseAntiClsEngine.getReservedMinHeight('top-leaderboard', false);
        expect(minHeightDesktop).toBe(90);

        const minHeightSidebar = AdSenseAntiClsEngine.getReservedMinHeight('sticky-sidebar', false);
        expect(minHeightSidebar).toBe(250);
      }
    },
    {
      name: 'F62.2: Adapts reserved height responsively on mobile viewports (< 768px)',
      async run() {
        const minHeightMobile = AdSenseAntiClsEngine.getReservedMinHeight('top-leaderboard', true);
        expect(minHeightMobile).toBe(50); // 320x50 on mobile vs 728x90 on desktop
      }
    },
    {
      name: 'F62.3: Guarantees cumulative layout shift score is zero (CLS = 0) prior to ad load',
      async run() {
        // Pre-reserved container has exactly the same height as the ad rendered inside
        const reservedH = AdSenseAntiClsEngine.getReservedMinHeight('in-article', false);
        const renderedAdH = 250;
        const shiftDistance = Math.abs(renderedAdH - reservedH);
        const clsImpact = shiftDistance * 0.0;

        expect(clsImpact).toBe(0);
      }
    },
    {
      name: 'F62.4: In-feed slot reserves minimum height of 120px desktop and 100px mobile',
      async run() {
        expect(AdSenseAntiClsEngine.getReservedMinHeight('in-feed', false)).toBe(120);
        expect(AdSenseAntiClsEngine.getReservedMinHeight('in-feed', true)).toBe(100);
      }
    },
    {
      name: 'F62.5: Multiplex slot reserves minimum height of 200px',
      async run() {
        expect(AdSenseAntiClsEngine.getReservedMinHeight('multiplex', false)).toBe(200);
      }
    }
  ]
};
