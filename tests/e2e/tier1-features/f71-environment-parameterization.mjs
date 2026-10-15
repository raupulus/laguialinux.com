import { expect } from '../harness/assert.mjs';
import { TenantAndThemeEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F71: Environment Parameterization (Multi-Tenant .env-guias vs .env-noticias)',
  tier: 1,
  tests: [
    {
      name: 'F71.1: Resolves guides tenant configuration from platform slug or environment',
      async run() {
        const tenant = TenantAndThemeEngine.resolveTenant('laguialinux');
        expect(tenant.platformSlug).toBe('laguialinux');
        expect(tenant.domain).toBe('laguialinux.com');
        expect(tenant.platformId).toBe(1);
        expect(tenant.themeName).toBe('emerald');
        expect(tenant.isGuides).toBe(true);
        expect(tenant.isNews).toBe(false);
      }
    },
    {
      name: 'F71.2: Resolves news tenant configuration from platform slug or environment',
      async run() {
        const tenant = TenantAndThemeEngine.resolveTenant('news');
        expect(tenant.platformSlug).toBe('news');
        expect(tenant.domain).toBe('news.laguialinux.com');
        expect(tenant.platformId).toBe(2);
        expect(tenant.themeName).toBe('orange');
        expect(tenant.isGuides).toBe(false);
        expect(tenant.isNews).toBe(true);
      }
    },
    {
      name: 'F71.3: Resolves tenant configuration dynamically from Host domain header',
      async run() {
        const tenantFromHost = TenantAndThemeEngine.resolveTenant('news.laguialinux.com');
        expect(tenantFromHost.platformSlug).toBe('news');
        expect(tenantFromHost.domain).toBe('news.laguialinux.com');
      }
    },
    {
      name: 'F71.4: Sets platform-specific site title for browser document head',
      async run() {
        const guides = TenantAndThemeEngine.resolveTenant('laguialinux');
        const news = TenantAndThemeEngine.resolveTenant('news');

        expect(guides.siteTitle).toContain('La Guía Linux');
        expect(news.siteTitle).toContain('Noticias Linux');
      }
    },
    {
      name: 'F71.5: Verifies API client queries target platform-specific endpoints',
      async run({ client }) {
        const guidesInfo = await client.request('/platforms/laguialinux');
        expect(guidesInfo.data.slug).toBe('laguialinux');

        const newsInfo = await client.request('/platforms/news');
        expect(newsInfo.data.slug).toBe('news');
      }
    }
  ]
};
