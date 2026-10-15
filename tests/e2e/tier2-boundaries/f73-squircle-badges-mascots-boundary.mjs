import { expect } from '../harness/assert.mjs';
import { TenantAndThemeEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F73: Master Squircle Badges & Mascots (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F73.B1: Delivery sizes array is strictly sorted in ascending order',
      async run() {
        const badge = TenantAndThemeEngine.getSquircleBadges('laguialinux');
        const sizes = badge.deliverySizes;
        for (let i = 0; i < sizes.length - 1; i++) {
          expect(sizes[i]).toBeLessThan(sizes[i + 1]);
        }
      }
    },
    {
      name: 'F73.B2: Squircle corner radius percentage is within ergonomic squircle bounds (20% - 25%)',
      async run() {
        const badge = TenantAndThemeEngine.getSquircleBadges('laguialinux');
        expect(badge.squircleRadiusPercent).toBeGreaterThanOrEqual(20);
        expect(badge.squircleRadiusPercent).toBeLessThanOrEqual(25);
      }
    },
    {
      name: 'F73.B3: Alt text is descriptive and non-empty for screen reader compliance',
      async run() {
        for (const tenant of ['laguialinux', 'news']) {
          const badge = TenantAndThemeEngine.getSquircleBadges(tenant);
          expect(badge.altText.length).toBeGreaterThan(5);
        }
      }
    },
    {
      name: 'F73.B4: Favicon 32px delivery size is included for legacy browser compatibility',
      async run() {
        const badge = TenantAndThemeEngine.getSquircleBadges('laguialinux');
        expect(badge.deliverySizes.includes(32)).toBe(true);
      }
    },
    {
      name: 'F73.B5: High-density 512px icon delivery is provided for PWA manifest',
      async run() {
        const badge = TenantAndThemeEngine.getSquircleBadges('news');
        expect(badge.deliverySizes.includes(512)).toBe(true);
      }
    }
  ]
};
