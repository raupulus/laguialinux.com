import { expect } from '../harness/assert.mjs';
import { TerminalGuardEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F20: Smart Copy Contextual # Stripping (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F20.B1: Preserves inline comments after commands (e.g. apt update # actualizar repos)',
      async run() {
        const input = '$ apt update # actualizar repositorios oficiales';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('apt update # actualizar repositorios oficiales');
      }
    },
    {
      name: 'F20.B2: Preserves markdown headings (# Título) without stripping',
      async run() {
        const input = '# Encabezado Principal del Tutorial\n$ ls -l';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('# Encabezado Principal del Tutorial\nls -l');
      }
    },
    {
      name: 'F20.B3: Does not strip # when followed by arbitrary unrecognized text (# nota importante)',
      async run() {
        const input = '# Nota importante para sysadmins novatos: no tocar';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('# Nota importante para sysadmins novatos: no tocar');
      }
    },
    {
      name: 'F20.B4: Strips # when followed by any command in 65+ CLI whitelist',
      async run() {
        // Test a sample of whitelist: pacman, journalctl, ufw, timedatectl
        const pacman = TerminalGuardEngine.cleanPrompt('# pacman -Syu');
        expect(pacman).toBe('pacman -Syu');

        const journal = TerminalGuardEngine.cleanPrompt('# journalctl -xe');
        expect(journal).toBe('journalctl -xe');

        const ufw = TerminalGuardEngine.cleanPrompt('# ufw allow 22/tcp');
        expect(ufw).toBe('ufw allow 22/tcp');

        const timedate = TerminalGuardEngine.cleanPrompt('# timedatectl set-ntp true');
        expect(timedate).toBe('timedatectl set-ntp true');
      }
    },
    {
      name: 'F20.B5: "Single-line" copy mode strips all comment lines and empty lines joining with &&',
      async run() {
        const input = '# Paso 1: Actualizar\napt update\n\n# Paso 2: Mejorar\napt upgrade -y';
        const result = TerminalGuardEngine.formatCommand(input, 'single-line');
        expect(result).toBe('apt update && apt upgrade -y');
      }
    }
  ]
};
