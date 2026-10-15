import { expect } from '../harness/assert.mjs';
import { SearchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F32: Global Keyboard Shortcut (Cmd+K / Ctrl+K)',
  tier: 1,
  tests: [
    {
      name: 'F32.1: Intercepts Cmd+K shortcut on macOS (metaKey: true, key: k)',
      async run() {
        const event = { metaKey: true, ctrlKey: false, key: 'k', defaultPrevented: false };
        const result = SearchEngine.handleGlobalShortcut(event);

        expect(result.isShortcut).toBe(true);
        expect(result.shouldToggle).toBe(true);
      }
    },
    {
      name: 'F32.2: Intercepts Ctrl+K shortcut on Linux/Windows (ctrlKey: true, key: k)',
      async run() {
        const event = { metaKey: false, ctrlKey: true, key: 'k', defaultPrevented: false };
        const result = SearchEngine.handleGlobalShortcut(event);

        expect(result.isShortcut).toBe(true);
        expect(result.shouldToggle).toBe(true);
      }
    },
    {
      name: 'F32.3: Case-insensitive handling matches uppercase K keypress',
      async run() {
        const event = { metaKey: true, ctrlKey: false, key: 'K', defaultPrevented: false };
        const result = SearchEngine.handleGlobalShortcut(event);

        expect(result.isShortcut).toBe(true);
        expect(result.shouldToggle).toBe(true);
      }
    },
    {
      name: 'F32.4: Pressing Escape key produces modal close action',
      async run() {
        const event = { metaKey: false, ctrlKey: false, key: 'Escape' };
        const result = SearchEngine.handleGlobalShortcut(event);

        expect(result.isEscape).toBe(true);
        expect(result.shouldClose).toBe(true);
      }
    },
    {
      name: 'F32.5: Normal typing without modifier keys does not trigger search shortcut',
      async run() {
        const letters = ['k', 'a', 'b', 'Enter', 'Space'];
        for (const letter of letters) {
          const event = { metaKey: false, ctrlKey: false, key: letter };
          const result = SearchEngine.handleGlobalShortcut(event);
          expect(result.isShortcut).toBe(false);
          expect(result.shouldToggle).toBe(false);
        }
      }
    }
  ]
};
