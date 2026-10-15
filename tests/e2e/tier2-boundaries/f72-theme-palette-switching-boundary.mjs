import { expect } from '../harness/assert.mjs';
import { TenantAndThemeEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F72: Theme & Palette Switching (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F72.B1: Unknown platform slug safely defaults to emerald palette tokens',
      async run() {
        const tokens = TenantAndThemeEngine.getThemeTokens('unknown-tenant');
        expect(tokens.themeName).toBe('emerald');
        expect(tokens.primary).toBe('#059669');
      }
    },
    {
      name: 'F72.B2: Hex color strings are valid 7-character hexadecimal codes (#RRGGBB)',
      async run() {
        for (const slug of ['laguialinux', 'news']) {
          const t = TenantAndThemeEngine.getThemeTokens(slug);
          expect(t.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
          expect(t.primaryHover).toMatch(/^#[0-9a-fA-F]{6}$/);
          expect(t.primaryDark).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
      }
    },
    {
      name: 'F72.B3: Dark primary variants (#064e3b, #7c2d12) maintain deep saturation',
      async run() {
        const guides = TenantAndThemeEngine.getThemeTokens('laguialinux');
        const news = TenantAndThemeEngine.getThemeTokens('news');
        expect(guides.primaryDark).toBe('#064e3b');
        expect(news.primaryDark).toBe('#7c2d12');
      }
    },
    {
      name: 'F72.B4: Tokens object contains all required utility classes',
      async run() {
        const t = TenantAndThemeEngine.getThemeTokens('laguialinux');
        expect(t.badgeBg).toBeTruthy();
        expect(t.badgeBorder).toBeTruthy();
        expect(t.badgeText).toBeTruthy();
      }
    },
    {
      name: 'F72.B5: Switching platforms does not pollute global token properties',
      async run() {
        const t1 = TenantAndThemeEngine.getThemeTokens('laguialinux');
        const t2 = TenantAndThemeEngine.getThemeTokens('news');
        expect(t1.primary).not.toBe(t2.primary);
      }
    }
  ]
};
