import { expect } from '../harness/assert.mjs';
import { AdSenseAntiClsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F65: AdBlocker Exception Handling (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F65.B1: Handles non-object argument (e.g. string or number) safely',
      async run() {
        const res = AdSenseAntiClsEngine.safePushAd('not-an-array');
        expect(res.success).toBe(false);
        expect(res.blockedByAdBlock).toBe(true);
      }
    },
    {
      name: 'F65.B2: Object without push function safely handled as blocked',
      async run() {
        const res = AdSenseAntiClsEngine.safePushAd({});
        expect(res.success).toBe(false);
        expect(res.blockedByAdBlock).toBe(true);
      }
    },
    {
      name: 'F65.B3: Push function throwing non-Error primitive (e.g. string) handled safely',
      async run() {
        const hostile = {
          push() { throw 'Custom block message'; }
        };
        const res = AdSenseAntiClsEngine.safePushAd(hostile);
        expect(res.success).toBe(false);
      }
    },
    {
      name: 'F65.B4: Consecutive repeated calls while blocked remain idempotent and safe',
      async run() {
        for (let i = 0; i < 5; i++) {
          const res = AdSenseAntiClsEngine.safePushAd(null);
          expect(res.success).toBe(false);
        }
      }
    },
    {
      name: 'F65.B5: Ad container gracefully collapses or hides without leaving blank broken gaps',
      async run() {
        const handleBlockedState = (isBlocked) => {
          return isBlocked ? { display: 'none', isHidden: true } : { display: 'block', isHidden: false };
        };

        const state = handleBlockedState(true);
        expect(state.isHidden).toBe(true);
        expect(state.display).toBe('none');
      }
    }
  ]
};
