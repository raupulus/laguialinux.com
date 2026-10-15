import { expect } from '../harness/assert.mjs';
import { TenantAndThemeEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F73: Master Squircle Badges & Mascots (2048px WebP & Tux Variants)',
  tier: 1,
  tests: [
    {
      name: 'F73.1: Master badge resolution is defined as 2048x2048 high-definition squircle',
      async run() {
        const guidesBadge = TenantAndThemeEngine.getSquircleBadges('laguialinux');
        expect(guidesBadge.masterResolution).toBe('2048x2048');
        expect(guidesBadge.aspectRatio).toBe('1:1');
      }
    },
    {
      name: 'F73.2: Modern WebP image format delivery with multi-resolution scaling (32 to 2048px)',
      async run() {
        const badge = TenantAndThemeEngine.getSquircleBadges('laguialinux');
        expect(badge.format).toBe('image/webp');
        expect(badge.deliverySizes).toContain(32);
        expect(badge.deliverySizes).toContain(64);
        expect(badge.deliverySizes).toContain(192);
        expect(badge.deliverySizes).toContain(512);
        expect(badge.deliverySizes).toContain(2048);
      }
    },
    {
      name: 'F73.3: Guides badge uses emerald-terminal-tux mascot variant',
      async run() {
        const badge = TenantAndThemeEngine.getSquircleBadges('laguialinux');
        expect(badge.variant).toBe('emerald-terminal-tux');
        expect(badge.altText).toBe('Logo de La Guía Linux');
      }
    },
    {
      name: 'F73.4: News badge uses orange-radar-tux mascot variant',
      async run() {
        const badge = TenantAndThemeEngine.getSquircleBadges('news');
        expect(badge.variant).toBe('orange-radar-tux');
        expect(badge.altText).toBe('Logo de Noticias Linux');
      }
    },
    {
      name: 'F73.5: Features enlarged Tux mascot with squircle radius curve (22.5%)',
      async run() {
        const badge = TenantAndThemeEngine.getSquircleBadges('laguialinux');
        expect(badge.mascot).toContain('Tux');
        expect(badge.squircleRadiusPercent).toBe(22.5);
      }
    }
  ]
};
