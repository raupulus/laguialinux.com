import { expect } from '../harness/assert.mjs';
import { SearchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F37: Keyboard List Navigation (ArrowDown, ArrowUp, Circular Wrap)',
  tier: 1,
  tests: [
    {
      name: 'F37.1: ArrowDown from unselected (-1) moves focus to first item (0)',
      async run() {
        const next = SearchEngine.navigateResults(-1, 5, 'down');
        expect(next).toBe(0);
      }
    },
    {
      name: 'F37.2: ArrowDown sequentially advances active index',
      async run() {
        let idx = 0;
        idx = SearchEngine.navigateResults(idx, 4, 'down');
        expect(idx).toBe(1);
        idx = SearchEngine.navigateResults(idx, 4, 'down');
        expect(idx).toBe(2);
      }
    },
    {
      name: 'F37.3: ArrowDown on last item circularly wraps to index 0',
      async run() {
        const total = 4;
        const lastIdx = 3;
        const wrapped = SearchEngine.navigateResults(lastIdx, total, 'down');
        expect(wrapped).toBe(0);
      }
    },
    {
      name: 'F37.4: ArrowUp on first item (0) circularly wraps to last item',
      async run() {
        const total = 5;
        const wrapped = SearchEngine.navigateResults(0, total, 'up');
        expect(wrapped).toBe(4);
      }
    },
    {
      name: 'F37.5: ArrowUp decrements active index when not at start',
      async run() {
        let idx = 3;
        idx = SearchEngine.navigateResults(idx, 5, 'up');
        expect(idx).toBe(2);
        idx = SearchEngine.navigateResults(idx, 5, 'up');
        expect(idx).toBe(1);
      }
    }
  ]
};
