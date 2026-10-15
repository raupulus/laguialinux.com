import { expect } from '../harness/assert.mjs';
import { AdSenseAntiClsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F65: AdBlocker Exception Handling (try/catch adsbygoogle.push)',
  tier: 1,
  tests: [
    {
      name: 'F65.1: Successfully pushes ad request when adsbygoogle array is available',
      async run() {
        const adsQueue = [];
        const result = AdSenseAntiClsEngine.safePushAd(adsQueue);

        expect(result.success).toBe(true);
        expect(result.blockedByAdBlock).toBe(false);
        expect(adsQueue.length).toBe(1);
      }
    },
    {
      name: 'F65.2: Gracefully intercepts blocked adsbygoogle when window.adsbygoogle is undefined',
      async run() {
        const result = AdSenseAntiClsEngine.safePushAd(undefined);

        expect(result.success).toBe(false);
        expect(result.blockedByAdBlock).toBe(true);
        expect(result.reason).toContain('blocked or unavailable');
      }
    },
    {
      name: 'F65.3: Gracefully handles null window.adsbygoogle object',
      async run() {
        const result = AdSenseAntiClsEngine.safePushAd(null);

        expect(result.success).toBe(false);
        expect(result.blockedByAdBlock).toBe(true);
      }
    },
    {
      name: 'F65.4: Intercepts throwing push method (e.g. adblocker proxy throwing script error)',
      async run() {
        const hostileQueue = {
          push() {
            throw new Error('uBlock Origin: Script execution blocked');
          }
        };

        const result = AdSenseAntiClsEngine.safePushAd(hostileQueue);
        expect(result.success).toBe(false);
        expect(result.blockedByAdBlock).toBe(true);
        expect(result.reason).toContain('uBlock Origin');
      }
    },
    {
      name: 'F65.5: Prevents uncaught exceptions from bubbling up and breaking reader hydration',
      async run() {
        expect(() => {
          AdSenseAntiClsEngine.safePushAd(null);
          AdSenseAntiClsEngine.safePushAd({ push: () => { throw new Error('Blocked'); } });
        }).not.toThrow();
      }
    }
  ]
};
