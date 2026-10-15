import { expect } from '../harness/assert.mjs';
import { SysadminToolsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F30: Cron Expression Generator, Validator & Humanizer (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F30.B1: Handles step notation with values at boundaries (*/1, */59)',
      async run() {
        const step1 = SysadminToolsEngine.validateCronExpression('*/1 * * * *');
        expect(step1.isValid).toBe(true);

        const step59 = SysadminToolsEngine.validateCronExpression('*/59 * * * *');
        expect(step59.isValid).toBe(true);
      }
    },
    {
      name: 'F30.B2: Handles day of week 0 and 7 both mapping to Domingo',
      async run() {
        const dow0 = SysadminToolsEngine.explainCronExpression('0 3 * * 0');
        expect(dow0).toContain('domingos');

        const dow7 = SysadminToolsEngine.explainCronExpression('0 3 * * 7');
        expect(dow7).toContain('domingos');
      }
    },
    {
      name: 'F30.B3: Rejects negative values or characters outside cron alphabet',
      async run() {
        const negative = SysadminToolsEngine.validateCronExpression('-5 * * * *');
        expect(negative.isValid).toBe(false);

        const letters = SysadminToolsEngine.validateCronExpression('abc * * * *');
        expect(letters.isValid).toBe(false);
      }
    },
    {
      name: 'F30.B4: Rejects expressions with extra whitespace or trailing delimiters',
      async run() {
        const trailingSemi = SysadminToolsEngine.validateCronExpression('* * * * * ;');
        expect(trailingSemi.isValid).toBe(false);
      }
    },
    {
      name: 'F30.B5: Next runs calculator handles leap year and month end boundaries cleanly',
      async run() {
        const leapDate = new Date('2028-02-28T23:58:00Z');
        const runs = SysadminToolsEngine.calculateNextRuns('* * * * *', leapDate, 5);

        expect(runs.length).toBe(5);
        expect(runs[0].getTime()).toBeGreaterThan(leapDate.getTime());
      }
    }
  ]
};
