import { expect } from '../harness/assert.mjs';
import { TenantAndThemeEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F71: Environment Parameterization (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F71.B1: Unknown host string defaults safely to guides tenant (laguialinux)',
      async run() {
        const tenant = TenantAndThemeEngine.resolveTenant('localhost:3000');
        expect(tenant.platformSlug).toBe('laguialinux');
      }
    },
    {
      name: 'F71.B2: Null or undefined parameter defaults safely to guides tenant',
      async run() {
        expect(TenantAndThemeEngine.resolveTenant(null).platformSlug).toBe('laguialinux');
        expect(TenantAndThemeEngine.resolveTenant(undefined).platformSlug).toBe('laguialinux');
      }
    },
    {
      name: 'F71.B3: Subdomain check is case-insensitive (NEWS.laguialinux.com)',
      async run() {
        const tenant = TenantAndThemeEngine.resolveTenant('NEWS.laguialinux.com');
        expect(tenant.platformSlug).toBe('news');
      }
    },
    {
      name: 'F71.B4: Port numbers in host string (news.laguialinux.com:8080) do not break resolution',
      async run() {
        const tenant = TenantAndThemeEngine.resolveTenant('news.laguialinux.com:8080');
        expect(tenant.platformSlug).toBe('news');
      }
    },
    {
      name: 'F71.B5: Legacy domain laguialinux.es does not configure active tenant (delegated to Nginx 301)',
      async run() {
        const tenant = TenantAndThemeEngine.resolveTenant('laguialinux.es');
        expect(tenant.platformSlug).toBe('laguialinux');
      }
    }
  ]
};
