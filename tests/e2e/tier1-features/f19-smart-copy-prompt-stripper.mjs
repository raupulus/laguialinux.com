import { expect } from '../harness/assert.mjs';
import { TerminalGuardEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F19: Smart Copy CLI Prompt Stripper ($ , user@host:~$ , >>> )',
  tier: 1,
  tests: [
    {
      name: 'F19.1: Strips standard user prompt prefix ($ apt update -> apt update)',
      async run() {
        const input = '$ apt update';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('apt update');
      }
    },
    {
      name: 'F19.2: Strips user@host prefix (user@host:~$ systemctl restart nginx -> systemctl restart nginx)',
      async run() {
        const input = 'sysadmin@debian-srv:~$ systemctl restart nginx';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('systemctl restart nginx');
      }
    },
    {
      name: 'F19.3: Strips root@host prefix (root@server:~# free -m -> free -m)',
      async run() {
        const input = 'root@node-01:~# free -m';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('free -m');
      }
    },
    {
      name: 'F19.4: Strips Python / REPL prompt prefix (>>> import os -> import os)',
      async run() {
        const input = '>>> import os\n>>> print(os.uname())';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('import os\nprint(os.uname())');
      }
    },
    {
      name: 'F19.5: Preserves multi-line indentation while stripping prompt on each command line',
      async run() {
        const input = '$ curl -fsSL https://get.docker.com -o get-docker.sh\n$ sh get-docker.sh';
        const result = TerminalGuardEngine.cleanPrompt(input);
        expect(result).toBe('curl -fsSL https://get.docker.com -o get-docker.sh\nsh get-docker.sh');
      }
    }
  ]
};
