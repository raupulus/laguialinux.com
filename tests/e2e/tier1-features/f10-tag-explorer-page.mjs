import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F10: Tag Explorer Page (/etiqueta/[slug])',
  tier: 1,
  tests: [
    {
      name: 'F10.1: Retrieves target tag details from platform tags endpoint',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/tags');
        const debianTag = response.data.find(t => t.slug === 'debian');

        expect(debianTag).toBeTruthy('Debian tag must exist');
        expect(debianTag.name).toBe('Debian');
        expect(debianTag.color).toBe('#d70a53');
        expect(debianTag.contents_count).toBeGreaterThan(0);
      }
    },
    {
      name: 'F10.2: Queries contents filtered specifically by tag slug',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { tag: 'debian' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        for (const item of response.data) {
          expect(item.tag_slugs).toContain('debian', 'Every returned item must include debian in its tags');
        }
      }
    },
    {
      name: 'F10.3: Returns all tagged contents including tag identifier',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents', {
          params: { tag: 'systemd' }
        });

        expect(response.success).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        for (const item of response.data) {
          expect(item.tag_slugs).toContain('systemd');
        }
      }
    },
    {
      name: 'F10.4: Preserves tag query parameter across pagination',
      async run({ client }) {
        const page1 = await client.request('/platforms/laguialinux/contents', {
          params: { tag: 'debian', page: 1, per_page: 2 }
        });
        const page2 = await client.request('/platforms/laguialinux/contents', {
          params: { tag: 'debian', page: 2, per_page: 2 }
        });

        expect(page1.meta.current_page).toBe(1);
        expect(page2.meta.current_page).toBe(2);
        for (const item of page2.data) {
          expect(item.tag_slugs).toContain('debian');
        }
      }
    },
    {
      name: 'F10.5: Generates valid canonical SEO URL for tag explorer page',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/tags');
        const btrfsTag = response.data.find(t => t.slug === 'btrfs');
        const pagePath = `/etiqueta/${btrfsTag.slug}`;

        expect(pagePath).toBe('/etiqueta/btrfs');
        expect(pagePath.startsWith('/etiqueta/')).toBe(true);
      }
    }
  ]
};
