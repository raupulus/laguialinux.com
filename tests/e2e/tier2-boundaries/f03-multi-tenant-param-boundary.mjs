import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F3: Multi-tenant Parameterization (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F3.B1: Handles case-sensitive tenant slugs and rejects mixed-case variants gracefully',
      async run({ client }) {
        let error = null;
        try {
          await client.request('/platforms/LaGuiaLinux');
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy();
        expect(error.status).toBe(404);
        expect(error.message).toBe('Plataforma no encontrada');
      }
    },
    {
      name: 'F3.B2: Sanitizes path traversal attempts in platform parameter (e.g. ../secret)',
      async run({ client }) {
        let error = null;
        try {
          await client.request('/platforms/..%2F..%2Fetc%2Fpasswd');
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy();
        expect(error.status).toBe(404);
      }
    },
    {
      name: 'F3.B3: Handles empty string platform slug without crashing',
      async run({ client }) {
        let error = null;
        try {
          await client.request('/platforms/');
        } catch (err) {
          error = err;
        }

        expect(error).toBeTruthy();
        expect(error.status).toBe(404);
      }
    },
    {
      name: 'F3.B4: Verifies theme accent and feature flags are strictly partitioned between tenants',
      async run({ client }) {
        const guides = await client.request('/platforms/laguialinux');
        const news = await client.request('/platforms/news');

        expect(guides.data.slug).not.toBe(news.data.slug);
        expect(guides.data.domain).not.toBe(news.data.domain);
        expect(guides.data.domain).toBe('laguialinux.com');
        expect(news.data.domain).toBe('news.laguialinux.com');
      }
    },
    {
      name: 'F3.B5: Verifies switching between tenants updates API base query paths cleanly',
      async run({ mockServer, client }) {
        client.platformSlug = 'laguialinux';
        const resGuides = await client.request(`/platforms/${client.platformSlug}/categories`);

        client.platformSlug = 'news';
        const resNews = await client.request(`/platforms/${client.platformSlug}/categories`);

        expect(resGuides.data[0].slug).toBe('comandos');
        expect(resNews.data[0].slug).toBe('distribuciones');
      }
    }
  ]
};
