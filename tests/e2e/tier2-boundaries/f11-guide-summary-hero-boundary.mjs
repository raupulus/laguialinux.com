import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F11: Guía Resumen Hero & Metadata (/guia/[slug]) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F11.B1: Handles guide with null/missing cover image by disabling blur overlay gracefully',
      async run() {
        const blurNull = GuideEngine.generateBlurBackdrop(null);
        expect(blurNull.hasBlurOverlay).toBe(false);
        expect(blurNull.backdropStyle.display).toBe('none');

        const blurEmpty = GuideEngine.generateBlurBackdrop('');
        expect(blurEmpty.hasBlurOverlay).toBe(false);
      }
    },
    {
      name: 'F11.B2: Rejects guide metadata with invalid non-whitelisted difficulty tier',
      async run() {
        const invalidGuide = {
          title: 'Guía Test',
          slug: 'guia-test',
          excerpt: 'Extracto',
          author: { name: 'Raúl Caro Pastorino', email: 'public@raupulus.dev' },
          metadata: { reading_time_minutes: 5, difficulty: 'NivelImposible' }
        };

        const result = GuideEngine.validateHeroMetadata(invalidGuide);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('Difficulty'))).toBe(true);
      }
    },
    {
      name: 'F11.B3: Normalizes 0 or negative reading time minutes to baseline of 1 minute',
      async run() {
        const zeroGuide = {
          title: 'Guía Rápida',
          slug: 'guia-rapida',
          excerpt: 'Extracto',
          author: { name: 'Raúl Caro Pastorino', email: 'public@raupulus.dev' },
          metadata: { reading_time_minutes: 0, difficulty: 'Principiante' }
        };

        const result = GuideEngine.validateHeroMetadata(zeroGuide);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('Reading time'))).toBe(true);
      }
    },
    {
      name: 'F11.B4: Rejects unauthorized author email (strictly enforces public@raupulus.dev)',
      async run() {
        const unauthorizedGuide = {
          title: 'Guía Test',
          slug: 'guia-test',
          excerpt: 'Extracto',
          author: { name: 'Raúl Caro Pastorino', email: 'otro@example.com' },
          metadata: { reading_time_minutes: 5, difficulty: 'Principiante' }
        };

        const result = GuideEngine.validateHeroMetadata(unauthorizedGuide);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('public@raupulus.dev'))).toBe(true);
      }
    },
    {
      name: 'F11.B5: Handles guide without youtube_video_id returning null embed facade',
      async run() {
        const embed = GuideEngine.buildYouTubeEmbed(null);
        expect(embed.hasVideo).toBe(false);
        expect(embed.posterUrl).toBeNull();
        expect(embed.iframeHtml).toBeNull();
      }
    }
  ]
};
