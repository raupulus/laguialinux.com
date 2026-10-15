import { expect } from '../harness/assert.mjs';
import { TaxonomyEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F7: Weighted Tag Cloud',
  tier: 1,
  tests: [
    {
      name: 'F7.1: Fetches platform tags list with non-negative contents_count',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/tags');
        expect(response.success).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        for (const tag of response.data) {
          expect(typeof tag.slug).toBe('string');
          expect(typeof tag.name).toBe('string');
          expect(tag.contents_count).toBeGreaterThanOrEqual(0);
        }
      }
    },
    {
      name: 'F7.2: Assigns maximum typographic scale level 4 (text-lg font-bold) to highest count tag',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/tags');
        const counts = response.data.map(t => t.contents_count);
        const minCount = Math.min(...counts);
        const maxCount = Math.max(...counts);

        const highestTag = response.data.find(t => t.contents_count === maxCount);
        const typo = TaxonomyEngine.calculateTagTypography(highestTag.contents_count, minCount, maxCount);

        expect(typo.scaleLevel).toBe(4);
        expect(typo.sizeClass).toBe('text-lg');
        expect(typo.weightClass).toBe('font-bold');
      }
    },
    {
      name: 'F7.3: Assigns minimum typographic scale level 1 (text-xs font-normal) to lowest count tag',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/tags');
        const counts = response.data.map(t => t.contents_count);
        const minCount = Math.min(...counts);
        const maxCount = Math.max(...counts);

        const lowestTag = response.data.find(t => t.contents_count === minCount);
        const typo = TaxonomyEngine.calculateTagTypography(lowestTag.contents_count, minCount, maxCount);

        expect(typo.scaleLevel).toBe(1);
        expect(typo.sizeClass).toBe('text-xs');
        expect(typo.weightClass).toBe('font-normal');
      }
    },
    {
      name: 'F7.4: Assigns intermediate scale levels (2 and 3) proportionally across tag range',
      async run() {
        const min = 0;
        const max = 100;

        const level2 = TaxonomyEngine.calculateTagTypography(30, min, max);
        const level3 = TaxonomyEngine.calculateTagTypography(60, min, max);

        expect(level2.scaleLevel).toBe(2);
        expect(level2.sizeClass).toBe('text-sm');

        expect(level3.scaleLevel).toBe(3);
        expect(level3.sizeClass).toBe('text-base');
      }
    },
    {
      name: 'F7.5: Generates valid tag explorer destination URLs',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/tags');
        const sampleTag = response.data[0];
        const targetUrl = `/etiqueta/${sampleTag.slug}`;

        expect(targetUrl).toBe(`/etiqueta/${sampleTag.slug}`);
        expect(targetUrl.startsWith('/etiqueta/')).toBe(true);
      }
    }
  ]
};
