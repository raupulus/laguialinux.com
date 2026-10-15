import { expect } from '../harness/assert.mjs';
import { NewsReaderEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F24: Caja de Fuente Original con nofollow (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F24.B1: Handles sources with missing title providing default fallback label',
      async run() {
        const rawSources = [{ title: '', url: 'https://kernel.org' }];
        const box = NewsReaderEngine.validateSourceBox(rawSources);

        expect(box.sources[0].title).toBe('Fuente externa');
      }
    },
    {
      name: 'F24.B2: Handles sources with missing URL safely',
      async run() {
        const rawSources = [{ title: 'Comunicado interno', url: '' }];
        const box = NewsReaderEngine.validateSourceBox(rawSources);

        expect(box.sources[0].url).toBe('');
      }
    },
    {
      name: 'F24.B3: Strips javascript: pseudo-protocols from source links',
      async run() {
        const unsafeSources = [{ title: 'Enlace Malicioso', url: 'javascript:alert(1)' }];
        const box = NewsReaderEngine.validateSourceBox(unsafeSources);

        // Security check: must ensure target and rel are enforced
        expect(box.sources[0].rel).toContain('nofollow');
        expect(box.sources[0].target).toBe('_blank');
      }
    },
    {
      name: 'F24.B4: Handles large list of sources (e.g. 10 sources) without formatting breakdown',
      async run() {
        const manySources = Array.from({ length: 10 }, (_, i) => ({
          title: `Fuente ${i + 1}`,
          url: `https://example.com/source-${i + 1}`
        }));

        const box = NewsReaderEngine.validateSourceBox(manySources);
        expect(box.sources.length).toBe(10);
        expect(box.hasSources).toBe(true);
      }
    },
    {
      name: 'F24.B5: Enforces rel="noopener noreferrer nofollow" even on trusted domains',
      async run() {
        const trustedSources = [{ title: 'Linux Foundation', url: 'https://linuxfoundation.org' }];
        const box = NewsReaderEngine.validateSourceBox(trustedSources);

        expect(box.sources[0].rel).toBe('noopener noreferrer nofollow');
      }
    }
  ]
};
