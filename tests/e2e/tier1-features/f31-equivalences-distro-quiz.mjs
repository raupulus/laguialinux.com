import { expect } from '../harness/assert.mjs';
import { SysadminToolsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F31: Windows <-> Linux Equivalences & Distro Finder Quiz',
  tier: 1,
  tests: [
    {
      name: 'F31.1: Searches Windows software equivalences by name (e.g. Photoshop -> GIMP)',
      async run() {
        const results = SysadminToolsEngine.searchEquivalences('Photoshop');

        expect(results.length).toBeGreaterThan(0);
        expect(results[0].windowsApp).toContain('Photoshop');
        const hasGimp = results[0].linuxAlternatives.some(alt => alt.name === 'GIMP');
        expect(hasGimp).toBe(true);
      }
    },
    {
      name: 'F31.2: Filters software equivalences by category (Ofimática, Diseño Gráfico, Desarrollo)',
      async run() {
        const ofimatica = SysadminToolsEngine.searchEquivalences('', 'Ofimática');
        expect(ofimatica.length).toBeGreaterThan(0);
        expect(ofimatica[0].windowsApp).toBe('Microsoft Office');

        const desarrollo = SysadminToolsEngine.searchEquivalences('', 'Desarrollo');
        expect(desarrollo.length).toBeGreaterThan(0);
        expect(desarrollo[0].windowsApp).toBe('Notepad++');
      }
    },
    {
      name: 'F31.3: Exposes copyable install commands for Debian/Ubuntu (apt) and Arch (pacman)',
      async run() {
        const results = SysadminToolsEngine.searchEquivalences('Photoshop');
        const gimp = results[0].linuxAlternatives.find(a => a.name === 'GIMP');

        expect(gimp.installCommands.apt).toBe('sudo apt install gimp');
        expect(gimp.installCommands.pacman).toBe('sudo pacman -S gimp');
        expect(gimp.installCommands.flatpak).toContain('flatpak install');
      }
    },
    {
      name: 'F31.4: Distro Finder evaluates 4-question quiz and recommends top matching distribution',
      async run() {
        const beginnerAnswers = {
          hardware: 'standard',
          experience: 'novice',
          useCase: 'desktop',
          updateModel: 'stable'
        };

        const rec = SysadminToolsEngine.evaluateDistroRecommendation(beginnerAnswers);
        expect(rec.primary).toBeTruthy();
        expect(rec.primary.distroKey).toBe('mint');
        expect(rec.primary.name).toBe('Linux Mint');
        expect(rec.primary.affinityPercent).toBeGreaterThan(50);
      }
    },
    {
      name: 'F31.5: Distro Finder provides secondary alternative recommendation with affinity percentage',
      async run() {
        const sysadminAnswers = {
          hardware: 'modern',
          experience: 'sysadmin',
          useCase: 'server',
          updateModel: 'stable'
        };

        const rec = SysadminToolsEngine.evaluateDistroRecommendation(sysadminAnswers);
        expect(rec.primary.distroKey).toBe('debian');
        expect(rec.secondary).toBeTruthy();
        expect(rec.secondary.name).toBeTruthy();
        expect(rec.secondary.officialUrl).toMatch(/^https:\/\//);
      }
    }
  ]
};
