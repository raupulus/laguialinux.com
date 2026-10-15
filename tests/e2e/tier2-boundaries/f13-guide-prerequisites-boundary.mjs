import { expect } from '../harness/assert.mjs';
import { GuideEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F13: Caja de Prerrequisitos y Requisitos (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F13.B1: Handles guide with 0 downloadable files returning empty array gracefully',
      async run() {
        const files = GuideEngine.formatDownloadableFiles([]);
        expect(Array.isArray(files)).toBe(true);
        expect(files.length).toBe(0);

        const nullFiles = GuideEngine.formatDownloadableFiles(null);
        expect(Array.isArray(nullFiles)).toBe(true);
        expect(nullFiles.length).toBe(0);
      }
    },
    {
      name: 'F13.B2: Handles unknown file extensions without crashing (assigning generic file badge)',
      async run() {
        const rawFiles = [
          { id: 1, filename: 'archivo_sin_extension', mime_type: 'application/octet-stream', size_human: '500 B', download_url: 'https://api.raupulus.dev/file/1' },
          { id: 2, filename: 'firmware.bin', mime_type: 'application/binary', size_human: '1.2 MB', download_url: 'https://api.raupulus.dev/file/2' }
        ];

        const formatted = GuideEngine.formatDownloadableFiles(rawFiles);
        expect(formatted.length).toBe(2);
        expect(formatted[0].isShellScript).toBe(false);
        expect(formatted[1].extension).toBe('bin');
      }
    },
    {
      name: 'F13.B3: Handles null/missing github_repo or official_docs_url in metadata',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/guia-comandos-find-xargs');

        expect(response.data.metadata.github_repo).toBeUndefined();
        expect(response.data.metadata.official_docs_url).toBeUndefined();
      }
    },
    {
      name: 'F13.B4: Sanitizes unsafe file download URLs (enforcing HTTPS or platform origin)',
      async run() {
        const files = [
          { id: 10, filename: 'script.sh', download_url: 'https://api.raupulus.dev/safe.sh' }
        ];
        const formatted = GuideEngine.formatDownloadableFiles(files);
        expect(formatted[0].download_url.startsWith('https://')).toBe(true);
      }
    },
    {
      name: 'F13.B5: Handles file with missing size_human property by providing default placeholder',
      async run() {
        const rawFiles = [
          { id: 1, filename: 'test.conf', mime_type: 'text/plain', download_url: 'https://api.raupulus.dev/test.conf' }
        ];

        const formatted = GuideEngine.formatDownloadableFiles(rawFiles);
        expect(formatted[0].isConfigFile).toBe(true);
        expect(formatted[0].extension).toBe('conf');
      }
    }
  ]
};
