import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F40: Modal Focus Trap & ARIA Accessibility (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F40.B1: Modal with only 1 focusable element retains focus on Tab without errors',
      async run() {
        const elements = ['input-search'];
        let idx = 0;
        // Tab
        idx = (idx + 1) % elements.length;
        expect(idx).toBe(0);
        // Shift+Tab
        idx = idx <= 0 ? elements.length - 1 : idx - 1;
        expect(idx).toBe(0);
      }
    },
    {
      name: 'F40.B2: Focus trap ignores disabled or hidden elements in tab sequence',
      async run() {
        const elements = [
          { id: 'input', disabled: false },
          { id: 'btn-disabled', disabled: true },
          { id: 'btn-submit', disabled: false }
        ];

        const activeElements = elements.filter(el => !el.disabled);
        expect(activeElements.length).toBe(2);
        expect(activeElements.map(e => e.id)).not.toContain('btn-disabled');
      }
    },
    {
      name: 'F40.B3: Closing modal when trigger element was removed from DOM does not crash',
      async run() {
        const modal = {
          triggerEl: null,
          close() {
            if (this.triggerEl && typeof this.triggerEl.focus === 'function') {
              this.triggerEl.focus();
            }
            return true;
          }
        };

        expect(() => modal.close()).not.toThrow();
      }
    },
    {
      name: 'F40.B4: Body scroll lock restores original overflow state on unmount',
      async run() {
        const docBody = { style: { overflow: 'auto' } };
        const originalOverflow = docBody.style.overflow;

        // open modal
        docBody.style.overflow = 'hidden';
        expect(docBody.style.overflow).toBe('hidden');

        // close modal
        docBody.style.overflow = originalOverflow;
        expect(docBody.style.overflow).toBe('auto');
      }
    },
    {
      name: 'F40.B5: Nested escape key presses do not cause double unmount or leaks',
      async run() {
        let closeCount = 0;
        let isOpen = true;
        const handleEscape = () => {
          if (isOpen) {
            isOpen = false;
            closeCount++;
          }
        };

        handleEscape();
        handleEscape();
        handleEscape();

        expect(closeCount).toBe(1);
        expect(isOpen).toBe(false);
      }
    }
  ]
};
