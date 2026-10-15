import { expect } from '../harness/assert.mjs';
import { SearchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F36: Result Grouping & Differentiation (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F36.B1: Handles items with null or missing type object defaulting to guides',
      async run() {
        const untyped = [{ title: 'Fichero suelto', slug: 'fichero' }];
        const grouped = SearchEngine.groupResults(untyped);
        expect(grouped.totalCount).toBe(1);
        expect(grouped.groups.guides.length).toBe(1);
      }
    },
    {
      name: 'F36.B2: Highlight with empty or whitespace query returns unchanged original text',
      async run() {
        const text = 'Texto sin modificaciones';
        expect(SearchEngine.highlightQuery(text, '')).toBe(text);
        expect(SearchEngine.highlightQuery(text, '   ')).toBe(text);
      }
    },
    {
      name: 'F36.B3: Highlight with regex special characters (e.g. "c++", "$PATH", "[a-z]") escapes properly',
      async run() {
        const text = 'Programación en C++ y configuración de $PATH';
        const highlighted = SearchEngine.highlightQuery(text, 'C++');
        expect(highlighted).toContain('<mark');
        expect(highlighted).toContain('C++');
      }
    },
    {
      name: 'F36.B4: Highlight with query not present in text returns original text without marks',
      async run() {
        const text = 'Instalación de Debian';
        const highlighted = SearchEngine.highlightQuery(text, 'Arch');
        expect(highlighted).toBe(text);
        expect(highlighted).not.toContain('<mark');
      }
    },
    {
      name: 'F36.B5: Handles items where category is missing or null without throwing TypeError',
      async run() {
        const item = { title: 'Test', type: { slug: 'guide' }, category: null };
        const grouped = SearchEngine.groupResults([item]);
        expect(grouped.groups.guides.length).toBe(1);
      }
    }
  ]
};
