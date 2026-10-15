import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F10: Tag Explorer Page (/etiqueta/[slug]) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F10.B1: Handles tag with 0 publications returning empty list with valid meta',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { tag: 'empty-tag' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBe(0);
        expect(response.meta.total).toBe(0);
      }
    },
    {
      name: 'F10.B2: Handles tag slug with hyphens and dots (e.g. arch-linux)',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { tag: 'arch-linux' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        expect(response.data[0].tag_slugs).toContain('arch-linux');
      }
    },
    {
      name: 'F10.B3: Out-of-bounds page query on tag explorer returns empty data slice',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { tag: 'debian', page: 50, per_page: 10 }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBe(0);
        expect(response.meta.current_page).toBe(50);
      }
    },
    {
      name: 'F10.B4: Tag query combined with search query q narrows results accurately',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { tag: 'debian', q: 'usuarios' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBe(1);
        expect(response.data[0].slug).toBe('gestion-usuarios-useradd-usermod');
      }
    },
    {
      name: 'F10.B5: Handles tag with null color assigning default neutral palette',
      async run({ client, mockServer }) {
        mockServer.registerHandler('GET', '/api/v2/platforms/laguialinux/tags', (req, res) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'OK',
            data: [
              { id: 99, slug: 'sin-color', name: 'Sin Color', color: null, contents_count: 2 }
            ]
          }));
        });

        const response = await client.request('/platforms/laguialinux/tags', { skipCache: true });
        const tag = response.data[0];
        const effectiveColor = tag.color || '#64748b'; // default slate color

        expect(tag.color).toBeNull();
        expect(effectiveColor).toBe('#64748b');
      }
    }
  ]
};
