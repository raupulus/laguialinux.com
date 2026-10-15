import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F11: Guía Resumen Hero & Metadata (/guia/[slug])',
  tier: 1,
  tests: [
    {
      name: 'F11.1: Fetches guide detail payload and validates H1 title and technical excerpt',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        expect(response.success).toBe(true);
        expect(response.data.title).toBe('Optimización extrema de memoria Swap y Swappiness en Debian');
        expect(response.data.excerpt).toContain('vm.swappiness');

        const hero = GuideEngine.validateHeroMetadata(response.data);
        expect(hero.isValid).toBe(true);
        expect(hero.title).toBe(response.data.title);
      }
    },
    {
      name: 'F11.2: Enforces official author Raúl Caro Pastorino and public email public@raupulus.dev',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const hero = GuideEngine.validateHeroMetadata(response.data);

        expect(hero.authorName).toBe('Raúl Caro Pastorino');
        expect(hero.authorNick).toBe('@raupulus');
        expect(hero.authorEmail).toBe('public@raupulus.dev');
      }
    },
    {
      name: 'F11.3: Renders difficulty pill and list of tested distributions',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const hero = GuideEngine.validateHeroMetadata(response.data);

        expect(hero.difficulty).toBe('Intermedio');
        expect(hero.distrosTested.length).toBeGreaterThanOrEqual(2);
        expect(hero.distrosTested).toContain('Debian 12');
        expect(hero.distrosTested).toContain('Ubuntu 24.04 LTS');
        expect(hero.readingTimeMinutes).toBe(8);
      }
    },
    {
      name: 'F11.4: Calculates CSS Blur Backdrop overlay for technical cover image',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const coverUrl = response.data.image.url;
        const blur = GuideEngine.generateBlurBackdrop(coverUrl);

        expect(blur.hasBlurOverlay).toBe(true);
        expect(blur.backdropStyle.filter).toBe('blur(16px)');
        expect(blur.backdropStyle.transform).toBe('scale(1.05)');
        expect(blur.backdropStyle.backgroundImage).toContain(coverUrl);
      }
    },
    {
      name: 'F11.5: Validates YouTube Lite facade embed thumbnail without loading iframe initially',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const videoId = response.data.metadata.youtube_video_id;

        // Unclicked state: lazy WebP thumbnail only
        const unclicked = GuideEngine.buildYouTubeEmbed(videoId, false);
        expect(unclicked.hasVideo).toBe(true);
        expect(unclicked.posterUrl).toBe(`https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`);
        expect(unclicked.isIframeMounted).toBe(false);
        expect(unclicked.iframeHtml).toBeNull();

        // Clicked state: iframe mounted on demand
        const clicked = GuideEngine.buildYouTubeEmbed(videoId, true);
        expect(clicked.isIframeMounted).toBe(true);
        expect(clicked.iframeHtml).toContain('<iframe');
        expect(clicked.iframeHtml).toContain(videoId);
      }
    }
  ]
};
