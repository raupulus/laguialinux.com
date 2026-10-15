import { expect } from '../harness/assert.mjs';
import { SysadminToolsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F30: Cron Expression Generator, Validator & Humanizer',
  tier: 1,
  tests: [
    {
      name: 'F30.1: Validates standard 5-field cron syntax (minute hour dom month dow)',
      async run() {
        const check1 = SysadminToolsEngine.validateCronExpression('*/5 * * * *');
        expect(check1.isValid).toBe(true);

        const check2 = SysadminToolsEngine.validateCronExpression('0 3 * * 0');
        expect(check2.isValid).toBe(true);

        const check3 = SysadminToolsEngine.validateCronExpression('0 0 1 1 *');
        expect(check3.isValid).toBe(true);
      }
    },
    {
      name: 'F30.2: Rejects malformed cron expressions with invalid field counts',
      async run() {
        const tooFew = SysadminToolsEngine.validateCronExpression('0 3 * *');
        expect(tooFew.isValid).toBe(false);

        const tooMany = SysadminToolsEngine.validateCronExpression('* * * * * *');
        expect(tooMany.isValid).toBe(false);

        const empty = SysadminToolsEngine.validateCronExpression('');
        expect(empty.isValid).toBe(false);
      }
    },
    {
      name: 'F30.3: Provides built-in common presets (hourly, daily, weekly, monthly)',
      async run() {
        const presets = SysadminToolsEngine.CRON_PRESETS;
        expect(presets.length).toBeGreaterThanOrEqual(5);

        const daily = presets.find(p => p.expression === '0 0 * * *');
        expect(daily).toBeTruthy();
        expect(daily.label).toContain('medianoche');

        const every5m = presets.find(p => p.expression === '*/5 * * * *');
        expect(every5m).toBeTruthy();
      }
    },
    {
      name: 'F30.4: Humanizes cron expressions to natural Spanish (e.g. "Lunes a viernes a las 08:00")',
      async run() {
        const weekdays = SysadminToolsEngine.explainCronExpression('0 8 * * 1-5');
        expect(weekdays).toContain('08:00');

        const sundays = SysadminToolsEngine.explainCronExpression('0 3 * * 0');
        expect(sundays).toContain('03:00');

        const everyMinute = SysadminToolsEngine.explainCronExpression('* * * * *');
        expect(everyMinute).toContain('minuto');
      }
    },
    {
      name: 'F30.5: Calculates projected next 5 run timestamps from given reference date',
      async run() {
        const fromDate = new Date('2026-10-12T10:00:00Z');
        const nextRuns = SysadminToolsEngine.calculateNextRuns('*/5 * * * *', fromDate, 5);

        expect(nextRuns.length).toBe(5);
        expect(nextRuns[0] instanceof Date).toBe(true);
        expect(nextRuns[1].getTime()).toBeGreaterThan(nextRuns[0].getTime());
      }
    }
  ]
};
