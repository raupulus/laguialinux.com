import { expect } from '../harness/assert.mjs';
import { TerminalGuardEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F19: Smart Copy CLI Prompt Stripper (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F19.B1: Preserves internal dollar signs in bash variables (e.g. $PATH, echo "$USER")',
      async run() {
        const input = '$ echo "$USER running on $HOSTNAME"';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('echo "$USER running on $HOSTNAME"');
      }
    },
    {
      name: 'F19.B2: Strips prompts with leading or trailing whitespace around dollar sign',
      async run() {
        const input = '   $    systemctl restart apache2';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('systemctl restart apache2');
      }
    },
    {
      name: 'F19.B3: Handles complex multi-level prompt (user@sub.domain.local:/var/log# cmd)',
      async run() {
        const input = 'admin@srv-01.infra.corp:/var/log/nginx# tail -f error.log';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('tail -f error.log');
      }
    },
    {
      name: 'F19.B4: Handles text that contains no prompts returning identical trimmed string',
      async run() {
        const plain = 'tar -czvf backup.tar.gz /home/usuario';
        const result = TerminalGuardEngine.cleanPrompt(plain);
        expect(result).toBe(plain);
      }
    },
    {
      name: 'F19.B5: Handles script mixing lines with $ and lines without $ cleanly',
      async run() {
        const mixed = '$ git clone https://github.com/example/repo\ncd repo\n$ pnpm install';
        const result = TerminalGuardEngine.cleanPrompt(mixed);
        expect(result).toBe('git clone https://github.com/example/repo\ncd repo\npnpm install');
      }
    }
  ]
};
