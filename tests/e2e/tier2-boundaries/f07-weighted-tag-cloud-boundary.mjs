import { expect } from '../harness/assert.mjs';
import { TaxonomyEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F7: Weighted Tag Cloud (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F7.B1: Handles empty tag array [] without division by zero or NaN',
      async run() {
        const emptyTags = [];
        const minCount = emptyTags.length ? Math.min(...emptyTags.map(t => t.contents_count)) : 0;
        const maxCount = emptyTags.length ? Math.max(...emptyTags.map(t => t.contents_count)) : 0;

        const typo = TaxonomyEngine.calculateTagTypography(0, minCount, maxCount);
        expect(typo.scaleLevel).toBe(1);
        expect(typo.sizeClass).toBe('text-xs');
      }
    },
    {
      name: 'F7.B2: Handles single tag in platform scaling to baseline size level 1',
      async run() {
        const singleTag = { id: 1, slug: 'solitario', name: 'Solitario', contents_count: 10 };
        const minCount = 10;
        const maxCount = 10;

        const typo = TaxonomyEngine.calculateTagTypography(singleTag.contents_count, minCount, maxCount);
        expect(typo.scaleLevel).toBe(1);
        expect(typo.sizeClass).toBe('text-xs');
      }
    },
    {
      name: 'F7.B3: Handles all tags having identical contents_count (uniform distribution)',
      async run() {
        const minCount = 5;
        const maxCount = 5;

        const typo1 = TaxonomyEngine.calculateTagTypography(5, minCount, maxCount);
        const typo2 = TaxonomyEngine.calculateTagTypography(5, minCount, maxCount);

        expect(typo1.scaleLevel).toBe(1);
        expect(typo2.scaleLevel).toBe(1);
      }
    },
    {
      name: 'F7.B4: Handles tag with contents_count = 0 producing level 1 without error',
      async run() {
        const minCount = 0;
        const maxCount = 50;

        const typo = TaxonomyEngine.calculateTagTypography(0, minCount, maxCount);
        expect(typo.scaleLevel).toBe(1);
        expect(typo.sizeClass).toBe('text-xs');
      }
    },
    {
      name: 'F7.B5: Handles tags with extreme count variance (1 vs 10,000) scaling smoothly within bounds',
      async run() {
        const minCount = 1;
        const maxCount = 10000;

        const minTypo = TaxonomyEngine.calculateTagTypography(1, minCount, maxCount);
        const maxTypo = TaxonomyEngine.calculateTagTypography(10000, minCount, maxCount);
        const midTypo = TaxonomyEngine.calculateTagTypography(6000, minCount, maxCount);

        expect(minTypo.scaleLevel).toBe(1);
        expect(maxTypo.scaleLevel).toBe(4);
        expect(midTypo.scaleLevel).toBe(3);
      }
    }
  ]
};
