import { expect } from '../harness/assert.mjs';
import { SearchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F32: Global Keyboard Shortcut (Cmd+K / Ctrl+K) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F32.B1: Event with null or undefined key does not throw error',
      async run() {
        const nullEvent = { metaKey: true, ctrlKey: false, key: null };
        const undefEvent = { metaKey: true, ctrlKey: false };

        const res1 = SearchEngine.handleGlobalShortcut(nullEvent);
        expect(res1.isShortcut).toBe(false);

        const res2 = SearchEngine.handleGlobalShortcut(undefEvent);
        expect(res2.isShortcut).toBe(false);
      }
    },
    {
      name: 'F32.B2: Alt/Shift modifiers without meta or ctrl do not trigger shortcut',
      async run() {
        const altEvent = { altKey: true, metaKey: false, ctrlKey: false, key: 'k' };
        const shiftEvent = { shiftKey: true, metaKey: false, ctrlKey: false, key: 'k' };

        expect(SearchEngine.handleGlobalShortcut(altEvent).isShortcut).toBe(false);
        expect(SearchEngine.handleGlobalShortcut(shiftEvent).isShortcut).toBe(false);
      }
    },
    {
      name: 'F32.B3: Combined modifiers (Cmd+Shift+K) still detect shortcut intent',
      async run() {
        const event = { metaKey: true, shiftKey: true, ctrlKey: false, key: 'k' };
        const res = SearchEngine.handleGlobalShortcut(event);
        expect(res.isShortcut).toBe(true);
      }
    },
    {
      name: 'F32.B4: Non-string key values (e.g. symbol or number) handled safely',
      async run() {
        const numEvent = { metaKey: true, ctrlKey: false, key: 123 };
        const symEvent = { metaKey: true, ctrlKey: false, key: Symbol('k') };

        expect(SearchEngine.handleGlobalShortcut(numEvent).isShortcut).toBe(false);
        expect(SearchEngine.handleGlobalShortcut(symEvent).isShortcut).toBe(false);
      }
    },
    {
      name: 'F32.B5: Rapid toggling sequence retains deterministic state without desync',
      async run() {
        let isOpen = false;
        const toggle = () => { isOpen = !isOpen; return isOpen; };

        for (let i = 0; i < 10; i++) {
          const res = SearchEngine.handleGlobalShortcut({ metaKey: true, ctrlKey: false, key: 'k' });
          if (res.shouldToggle) toggle();
        }
        // 10 toggles -> should return to initial false
        expect(isOpen).toBe(false);
      }
    }
  ]
};
