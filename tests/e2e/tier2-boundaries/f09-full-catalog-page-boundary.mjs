import { expect } from '../harness/assert.mjs';
import { TaxonomyEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F9: Full Catalog Page (/guias) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F9.B1: Handles empty catalog response (total=0, data=[])',
      async run() {
        const emptyMeta = { total: 0, per_page: 15, current_page: 1, last_page: 1 };
        const pag = TaxonomyEngine.calculatePagination(emptyMeta);

        expect(pag.total).toBe(0);
        expect(pag.currentPage).toBe(1);
        expect(pag.lastPage).toBe(1);
        expect(pag.hasNext).toBe(false);
        expect(pag.hasPrevious).toBe(false);
        expect(pag.from).toBe(0);
        expect(pag.to).toBe(0);
      }
    },
    {
      name: 'F9.B2: Clamps out-of-range page requests (page=999 when last_page=3)',
      async run() {
        const outOfRangeMeta = { total: 45, per_page: 15, current_page: 999, last_page: 3 };
        const pag = TaxonomyEngine.calculatePagination(outOfRangeMeta);

        expect(pag.currentPage).toBe(3, 'Current page must clamp to lastPage');
        expect(pag.hasNext).toBe(false);
      }
    },
    {
      name: 'F9.B3: Normalizes non-positive page numbers (page=0 or page=-5) to 1',
      async run() {
        const zeroPageMeta = { total: 45, per_page: 15, current_page: 0, last_page: 3 };
        const negPageMeta = { total: 45, per_page: 15, current_page: -5, last_page: 3 };

        const pagZero = TaxonomyEngine.calculatePagination(zeroPageMeta);
        const pagNeg = TaxonomyEngine.calculatePagination(negPageMeta);

        expect(pagZero.currentPage).toBe(1);
        expect(pagNeg.currentPage).toBe(1);
      }
    },
    {
      name: 'F9.B4: Clamps extreme per_page parameter to API maximum of 100',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { per_page: 500 }
        });

        expect(response.meta.per_page).toBeLessThanOrEqual(100, 'per_page must be clamped to max 100');
      }
    },
    {
      name: 'F9.B5: Handles invalid filter values (e.g. unknown type) returning 404',
      async run({ client }) {
        let error = null;
        try {
          await client.request('/platforms/laguialinux/contents', {
            params: { type: 'tipo-desconocido-xyz' }
          });
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy();
        expect(error.status).toBe(404);
        expect(error.message).toBe('Tipo de contenido no reconocido');
      }
    }
  ]
};
