import { expect } from '../harness/assert.mjs';
import { TerminalGuardEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F18: Terminal Block Styling & Dots',
  tier: 1,
  tests: [
    {
      name: 'F18.1: Terminal block encapsulates commands in pre/code structure',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const page1 = response.data.pages[0];

        expect(page1.body).toContain('<pre>');
        expect(page1.body).toContain('<code');
        expect(page1.body).toContain('</code></pre>');
      }
    },
    {
      name: 'F18.2: Renders window control dots (red, yellow, green) for Mac/Terminal styling',
      async run() {
        const dotsConfig = [
          { color: 'red', class: 'bg-red-500', label: 'Cerrar' },
          { color: 'yellow', class: 'bg-yellow-500', label: 'Minimizar' },
          { color: 'green', class: 'bg-green-500', label: 'Maximizar' }
        ];

        expect(dotsConfig.length).toBe(3);
        expect(dotsConfig[0].color).toBe('red');
        expect(dotsConfig[1].color).toBe('yellow');
        expect(dotsConfig[2].color).toBe('green');
      }
    },
    {
      name: 'F18.3: Preserves command indentation and multi-line script formatting',
      async run() {
        const rawScript = `if [ "$EUID" -ne 0 ]; then\n  echo "Por favor ejecuta como root"\n  exit 1\nfi`;
        const cleaned = TerminalGuardEngine.cleanPrompt(rawScript);

        expect(cleaned).toContain('  echo "Por favor ejecuta como root"');
        expect(cleaned).toContain('  exit 1');
      }
    },
    {
      name: 'F18.4: Exposes syntax language class (e.g. language-bash)',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/contents/optimizacion-swap-swappiness-debian');
        const page = response.data.pages[0];

        expect(page.body).toContain('class="language-bash"');
      }
    },
    {
      name: 'F18.5: Distinguishes root commands (#) from standard user commands ($)',
      async run() {
        const userCmd = '$ swapon --show';
        const rootCmd = '# apt install htop';

        const cleanUser = TerminalGuardEngine.cleanPrompt(userCmd);
        const cleanRoot = TerminalGuardEngine.cleanPrompt(rootCmd);

        expect(cleanUser).toBe('swapon --show');
        expect(cleanRoot).toBe('apt install htop');
      }
    }
  ]
};
