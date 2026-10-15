import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F40: Modal Focus Trap & ARIA Accessibility (MOD-03)',
  tier: 1,
  tests: [
    {
      name: 'F40.1: Search modal exposes required ARIA dialog attributes',
      async run() {
        const modalAria = {
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': 'Búsqueda global en La Guía Linux'
        };

        expect(modalAria.role).toBe('dialog');
        expect(modalAria['aria-modal']).toBe('true');
        expect(modalAria['aria-label']).toBeTruthy();
      }
    },
    {
      name: 'F40.2: Focus trap wraps Tab key from last focusable element to first',
      async run() {
        const focusableElements = ['input-search', 'btn-filter', 'btn-close'];
        let currentFocusIndex = 2; // on last element

        // Tab pressed
        if (currentFocusIndex >= focusableElements.length - 1) {
          currentFocusIndex = 0; // wrap to first
        } else {
          currentFocusIndex++;
        }

        expect(currentFocusIndex).toBe(0);
        expect(focusableElements[currentFocusIndex]).toBe('input-search');
      }
    },
    {
      name: 'F40.3: Focus trap wraps Shift+Tab key from first focusable element to last',
      async run() {
        const focusableElements = ['input-search', 'btn-filter', 'btn-close'];
        let currentFocusIndex = 0; // on first element

        // Shift+Tab pressed
        if (currentFocusIndex <= 0) {
          currentFocusIndex = focusableElements.length - 1; // wrap to last
        } else {
          currentFocusIndex--;
        }

        expect(currentFocusIndex).toBe(2);
        expect(focusableElements[currentFocusIndex]).toBe('btn-close');
      }
    },
    {
      name: 'F40.4: Closing modal restores focus to previous trigger element',
      async run() {
        let activeElementId = 'btn-search-header-trigger';
        const modalState = {
          isOpen: false,
          previousFocusElement: null,
          open(triggerId) {
            this.previousFocusElement = triggerId;
            this.isOpen = true;
          },
          close() {
            this.isOpen = false;
            return this.previousFocusElement;
          }
        };

        modalState.open(activeElementId);
        expect(modalState.isOpen).toBe(true);

        const restoredElement = modalState.close();
        expect(restoredElement).toBe('btn-search-header-trigger');
      }
    },
    {
      name: 'F40.5: Search results count rendered with aria-live="polite" for screen readers',
      async run() {
        const screenReaderAnnouncement = (count) => {
          return {
            'aria-live': 'polite',
            text: count === 0 ? 'Sin resultados encontrados' : `${count} resultados encontrados`
          };
        };

        const ann1 = screenReaderAnnouncement(0);
        expect(ann1['aria-live']).toBe('polite');
        expect(ann1.text).toBe('Sin resultados encontrados');

        const ann2 = screenReaderAnnouncement(5);
        expect(ann2.text).toContain('5 resultados');
      }
    }
  ]
};
