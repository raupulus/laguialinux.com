import { expect } from '../harness/assert.mjs';
import { TerminalGuardEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F18: Terminal Block Styling & Dots (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F18.B1: Handles empty command block ("") without error',
      async run() {
        const cleaned = TerminalGuardEngine.cleanPrompt('');
        expect(cleaned).toBe('');

        const formatted = TerminalGuardEngine.formatCommand('', 'clean');
        expect(formatted).toBe('');
      }
    },
    {
      name: 'F18.B2: Handles command block with only whitespace and empty lines',
      async run() {
        const input = '   \n\n\t  \n';
        const cleaned = TerminalGuardEngine.cleanPrompt(input);
        expect(cleaned).toBe('');
      }
    },
    {
      name: 'F18.B3: Handles very long single-line command (> 1000 chars) without truncation',
      async run() {
        const longCmd = 'echo "' + 'A'.repeat(1200) + '"';
        const cleaned = TerminalGuardEngine.cleanPrompt(longCmd);
        expect(cleaned.length).toBeGreaterThanOrEqual(1200);
      }
    },
    {
      name: 'F18.B4: Handles commands containing ANSI escape sequences or control chars safely',
      async run() {
        const ansiInput = '$ echo -e "\x1b[31mError\x1b[0m"';
        const cleaned = TerminalGuardEngine.cleanPrompt(ansiInput);
        expect(cleaned).toContain('echo -e');
      }
    },
    {
      name: 'F18.B5: Preserves tabs and multiple consecutive spaces within code strings',
      async run() {
        const spacedInput = 'awk \'{print $1,   $3}\' file.txt';
        const cleaned = TerminalGuardEngine.cleanPrompt(spacedInput);
        expect(cleaned).toBe('awk \'{print $1,   $3}\' file.txt');
      }
    }
  ]
};
