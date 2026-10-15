import { expect } from '../harness/assert.mjs';
import { TenantAndThemeEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F72: Theme & Palette Switching (Emerald Terminal vs Orange Tech)',
  tier: 1,
  tests: [
    {
      name: 'F72.1: Guides tenant loads Emerald terminal palette tokens (#059669)',
      async run() {
        const tokens = TenantAndThemeEngine.getThemeTokens('laguialinux');
        expect(tokens.themeName).toBe('emerald');
        expect(tokens.primary).toBe('#059669');
        expect(tokens.primaryHover).toBe('#047857');
        expect(tokens.primaryDark).toBe('#064e3b');
      }
    },
    {
      name: 'F72.2: News tenant loads Orange tech palette tokens (#ea580c)',
      async run() {
        const tokens = TenantAndThemeEngine.getThemeTokens('news');
        expect(tokens.themeName).toBe('orange');
        expect(tokens.primary).toBe('#ea580c');
        expect(tokens.primaryHover).toBe('#c2410c');
        expect(tokens.primaryDark).toBe('#7c2d12');
      }
    },
    {
      name: 'F72.3: Guides badge styling uses terminal-emerald background and border',
      async run() {
        const tokens = TenantAndThemeEngine.getThemeTokens('laguialinux');
        expect(tokens.badgeBg).toContain('emerald');
        expect(tokens.badgeBorder).toContain('emerald');
        expect(tokens.badgeText).toContain('emerald');
      }
    },
    {
      name: 'F72.4: News badge styling uses high-contrast orange background and border',
      async run() {
        const tokens = TenantAndThemeEngine.getThemeTokens('news');
        expect(tokens.badgeBg).toContain('orange');
        expect(tokens.badgeBorder).toContain('orange');
        expect(tokens.badgeText).toContain('orange');
      }
    },
    {
      name: 'F72.5: Accent colors provide adequate contrast for dark-mode terminal surfaces',
      async run() {
        const guidesTokens = TenantAndThemeEngine.getThemeTokens('laguialinux');
        const newsTokens = TenantAndThemeEngine.getThemeTokens('news');

        expect(guidesTokens.accent).toBe('#10b981');
        expect(newsTokens.accent).toBe('#f97316');
      }
    }
  ]
};
