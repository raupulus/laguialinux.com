import { expect } from '../harness/assert.mjs';
import { ApiClientEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F3: Multi-tenant Parameterization',
  tier: 1,
  tests: [
    {
      name: 'F3.1: Resolves correct platform config for guides tenant (laguialinux)',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux');
        expect(response.success).toBe(true);
        expect(response.data.slug).toBe('laguialinux');
        expect(response.data.domain).toBe('laguialinux.com');
        expect(response.data.title).toContain('La Guía Linux');
      }
    },
    {
      name: 'F3.2: Resolves correct platform config for news tenant (news)',
      async run({ client }) {
        const response = await client.request('/platforms/news');
        expect(response.success).toBe(true);
        expect(response.data.slug).toBe('news');
        expect(response.data.domain).toBe('news.laguialinux.com');
        expect(response.data.title).toContain('Noticias Linux');
      }
    },
    {
      name: 'F3.3: Routes category requests dynamically to active tenant endpoint',
      async run({ client }) {
        const guidesRes = await client.request('/platforms/laguialinux/categories');
        const newsRes = await client.request('/platforms/news/categories');

        expect(guidesRes.data.length).toBeGreaterThan(0);
        expect(newsRes.data.length).toBeGreaterThan(0);

        // Guides has 'comandos', News has 'distribuciones'
        const hasComandos = guidesRes.data.some(c => c.slug === 'comandos');
        const hasDistribuciones = newsRes.data.some(c => c.slug === 'distribuciones');

        expect(hasComandos).toBe(true, 'Guides tenant must contain comandos category');
        expect(hasDistribuciones).toBe(true, 'News tenant must contain distribuciones category');
      }
    },
    {
      name: 'F3.4: Rejects unauthorized/unknown tenant slug with 404 Platform not found',
      async run({ client }) {
        let error = null;
        try {
          await client.request('/platforms/invalid-tenant-slug');
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy('Must throw error on invalid tenant');
        expect(error.status).toBe(404, 'Status must be 404');
        expect(error.message).toBe('Plataforma no encontrada');
      }
    },
    {
      name: 'F3.5: Maintains state isolation between simultaneous multi-tenant requests',
      async run({ mockServer }) {
        const guidesClient = new ApiClientEngine({ baseUrl: mockServer.baseUrl, platformSlug: 'laguialinux' });
        const newsClient = new ApiClientEngine({ baseUrl: mockServer.baseUrl, platformSlug: 'news' });

        const [guidesRes, newsRes] = await Promise.all([
          guidesClient.request(`/platforms/${guidesClient.platformSlug}/categories`),
          newsClient.request(`/platforms/${newsClient.platformSlug}/categories`)
        ]);

        expect(guidesRes.data[0].slug).toBe('comandos', 'Guides client must preserve guides data');
        expect(newsRes.data[0].slug).toBe('distribuciones', 'News client must preserve news data');
        expect(guidesClient.platformSlug).toBe('laguialinux');
        expect(newsClient.platformSlug).toBe('news');
      }
    }
  ]
};
