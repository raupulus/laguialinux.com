import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F13: Caja de Prerrequisitos y Requisitos',
  tier: 1,
  tests: [
    {
      name: 'F13.1: Retrieves downloadable files attachment list via GET /contents/:slug/files',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian/files');
        expect(response.success).toBe(true);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        expect(response.data[0].filename).toBe('tune-swap.sh');
      }
    },
    {
      name: 'F13.2: Formats shell script attachments (.sh) with human-readable size',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian/files');
        const formatted = GuideEngine.formatDownloadableFiles(response.data);

        expect(formatted.length).toBe(1);
        expect(formatted[0].extension).toBe('sh');
        expect(formatted[0].isShellScript).toBe(true);
        expect(formatted[0].size_human).toBe('2.4 KB');
      }
    },
    {
      name: 'F13.3: Exposes official GitHub repository link when specified in guide metadata',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        expect(response.data.metadata.github_repo).toBe('https://github.com/raupulus/linux-sysadmin-scripts');
      }
    },
    {
      name: 'F13.4: Exposes official documentation reference URL when specified',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        expect(response.data.metadata.official_docs_url).toBe('https://www.kernel.org/doc/Documentation/vm/');
      }
    },
    {
      name: 'F13.5: Generates secure download attributes for direct script retrieval',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian/files');
        const formatted = GuideEngine.formatDownloadableFiles(response.data);

        expect(formatted[0].download_url).toBeTruthy();
        expect(formatted[0].download_url).toMatch(/^https:\/\//);
        expect(formatted[0].mime_type).toBe('text/x-shellscript');
      }
    }
  ]
};
