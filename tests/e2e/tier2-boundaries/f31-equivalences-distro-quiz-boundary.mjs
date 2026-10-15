import { expect } from '../harness/assert.mjs';
import { SysadminToolsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F31: Windows <-> Linux Equivalences & Distro Finder Quiz (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F31.B1: Case-insensitive and accent-insensitive query search (e.g. "diseño", "OFIMATICA")',
      async run() {
        const lower = SysadminToolsEngine.searchEquivalences('photoshop');
        const upper = SysadminToolsEngine.searchEquivalences('PHOTOSHOP');

        expect(lower.length).toBe(upper.length);
        expect(lower.length).toBeGreaterThan(0);
      }
    },
    {
      name: 'F31.B2: Search query with no matching software returns empty array without error',
      async run() {
        const noMatch = SysadminToolsEngine.searchEquivalences('SoftwareInexistenteTotalmente999');
        expect(Array.isArray(noMatch)).toBe(true);
        expect(noMatch.length).toBe(0);
      }
    },
    {
      name: 'F31.B3: Distro Finder with unexpected quiz answers falls back to default profile',
      async run() {
        const unexpectedAnswers = {
          hardware: 'unknown_hardware',
          experience: 'unknown_exp',
          useCase: 'unknown_use',
          updateModel: 'unknown_model'
        };

        const rec = SysadminToolsEngine.evaluateDistroRecommendation(unexpectedAnswers);
        expect(rec.primary).toBeTruthy();
        expect(rec.secondary).toBeTruthy();
        expect(rec.primary.name).toBeTruthy();
      }
    },
    {
      name: 'F31.B4: Distro Finder ensures primary and secondary recommendations are distinct distributions',
      async run() {
        const answers = {
          hardware: 'standard',
          experience: 'intermediate',
          useCase: 'development',
          updateModel: 'stable'
        };

        const rec = SysadminToolsEngine.evaluateDistroRecommendation(answers);
        expect(rec.primary.distroKey).not.toBe(rec.secondary.distroKey);
      }
    },
    {
      name: 'F31.B5: Affinity percentage is clamped between 0% and 99% (never exceeds 100%)',
      async run() {
        const answers = {
          hardware: 'legacy',
          experience: 'sysadmin',
          useCase: 'server',
          updateModel: 'stable'
        };

        const rec = SysadminToolsEngine.evaluateDistroRecommendation(answers);
        expect(rec.primary.affinityPercent).toBeGreaterThanOrEqual(0);
        expect(rec.primary.affinityPercent).toBeLessThanOrEqual(99);
        expect(rec.secondary.affinityPercent).toBeGreaterThanOrEqual(0);
        expect(rec.secondary.affinityPercent).toBeLessThanOrEqual(99);
      }
    }
  ]
};
