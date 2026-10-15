import { expect } from '../harness/assert.mjs';
import { TerminalGuardEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F20: Smart Copy Contextual # Stripping (Preserve # comentario vs strip # apt install)',
  tier: 1,
  tests: [
    {
      name: 'F20.1: Strips # when followed by common CLI command (# apt install htop -> apt install htop)',
      async run() {
        const input = '# apt install htop';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('apt install htop');
      }
    },
    {
      name: 'F20.2: Strips # when followed by systemctl, fdisk, or mkfs (# systemctl status ssh -> systemctl status ssh)',
      async run() {
        const input = '# systemctl status ssh';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('systemctl status ssh');
      }
    },
    {
      name: 'F20.3: Preserves explanatory comments starting with # (# Verificar memoria swap)',
      async run() {
        const input = '# Verificar memoria swap disponible en el servidor\n$ free -h';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('# Verificar memoria swap disponible en el servidor\nfree -h');
      }
    },
    {
      name: 'F20.4: Preserves shebang directives intact (#!/bin/bash)',
      async run() {
        const input = '#!/bin/bash\necho "Script ejecutándose"';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('#!/bin/bash\necho "Script ejecutándose"');
      }
    },
    {
      name: 'F20.5: In "Copy With Sudo" mode, comments are not prefixed with sudo while commands receive sudo',
      async run() {
        const input = '# Comentario importante\napt update\n# Otro comentario\nsystemctl restart nginx';
        const result = TerminalGuardEngine.formatCommand(input, 'sudo');

        expect(result).toBe('# Comentario importante\nsudo apt update\n# Otro comentario\nsudo systemctl restart nginx');
      }
    }
  ]
};
