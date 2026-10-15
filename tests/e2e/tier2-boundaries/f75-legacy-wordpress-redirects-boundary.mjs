import { expect } from '../harness/assert.mjs';
import { LegacyRedirectEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F75: Legacy WordPress Redirects Engine (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F75.B1: Handles date-based archive permalinks (/{year}/{month}/{slug}) with rescue search',
      async run() {
        const rescue = LegacyRedirectEngine.resolve('/2016/05/mi-articulo-antiguo');
        expect(rescue).toBe('/buscar?q=mi%20articulo%20antiguo');
      }
    },
    {
      name: 'F75.B2: Handles unknown single-segment orphan slugs with parameterized search rescue',
      async run() {
        const rescue = LegacyRedirectEngine.resolve('/un-post-huerfano-de-wordpress');
        expect(rescue).toBe('/buscar?q=un%20post%20huerfano%20de%20wordpress');
      }
    },
    {
      name: 'F75.B3: Known Nuxt top-level routes (e.g. /guias, /blog, /contacto) never trigger redirects',
      async run() {
        expect(LegacyRedirectEngine.resolve('/guias')).toBe(null);
        expect(LegacyRedirectEngine.resolve('/blog')).toBe(null);
        expect(LegacyRedirectEngine.resolve('/contacto')).toBe('/contacto'); // mapped or direct
        expect(LegacyRedirectEngine.resolve('/buscar')).toBe(null);
        expect(LegacyRedirectEngine.resolve('/herramientas')).toBe(null);
      }
    },
    {
      name: 'F75.B4: WordPress administrative routes (/wp-admin, /wp-login.php) redirect to home (/)',
      async run() {
        expect(LegacyRedirectEngine.resolve('/wp-admin')).toBe('/');
        expect(LegacyRedirectEngine.resolve('/wp-login.php')).toBe('/');
        expect(LegacyRedirectEngine.resolve('/xmlrpc.php')).toBe('/');
      }
    },
    {
      name: 'F75.B5: Static assets and system paths (_nuxt, api, favicon) cleanly bypass redirect logic',
      async run() {
        expect(LegacyRedirectEngine.resolve('/_nuxt/app.js')).toBe(null);
        expect(LegacyRedirectEngine.resolve('/api/v2/platforms')).toBe(null);
        expect(LegacyRedirectEngine.resolve('/favicon.ico')).toBe(null);
        expect(LegacyRedirectEngine.resolve('/robots.txt')).toBe(null);
        expect(LegacyRedirectEngine.resolve('/sitemap.xml')).toBe(null);
      }
    }
  ]
};
