import { expect } from '../harness/assert.mjs';
import { SearchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F37: Keyboard List Navigation (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F37.B1: Navigating in empty list (totalCount = 0) safely returns -1 without crash',
      async run() {
        expect(SearchEngine.navigateResults(0, 0, 'down')).toBe(-1);
        expect(SearchEngine.navigateResults(0, 0, 'up')).toBe(-1);
      }
    },
    {
      name: 'F37.B2: Single item list (totalCount = 1) retains index 0 for both down and up',
      async run() {
        expect(SearchEngine.navigateResults(0, 1, 'down')).toBe(0);
        expect(SearchEngine.navigateResults(0, 1, 'up')).toBe(0);
      }
    },
    {
      name: 'F37.B3: Out-of-bounds current index (> totalCount) resets to 0 on down',
      async run() {
        const outIdx = 99;
        const total = 3;
        expect(SearchEngine.navigateResults(outIdx, total, 'down')).toBe(0);
      }
    },
    {
      name: 'F37.B4: Negative index other than -1 resets safely',
      async run() {
        const res = SearchEngine.navigateResults(-5, 4, 'down');
        expect(res).toBe(0);
      }
    },
    {
      name: 'F37.B5: Unknown navigation direction returns unchanged current index',
      async run() {
        const res = SearchEngine.navigateResults(2, 5, 'left');
        expect(res).toBe(2);
      }
    }
  ]
};
