import { expect } from '../harness/assert.mjs';
import { AdSenseAntiClsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F64: Development Safe Placeholder (No External Google Calls)',
  tier: 1,
  tests: [
    {
      name: 'F64.1: Renders safe mock placeholder object in development environment',
      async run() {
        const placeholder = AdSenseAntiClsEngine.renderDevPlaceholder('top-leaderboard', false);
        expect(placeholder.isDevPlaceholder).toBe(true);
        expect(placeholder.notice).toBe('[Anuncio Simulado - Modo Desarrollo]');
        expect(placeholder.slotName).toBe('top-leaderboard');
      }
    },
    {
      name: 'F64.2: Development placeholder matches exact slot dimensions (728x90 desktop)',
      async run() {
        const placeholder = AdSenseAntiClsEngine.renderDevPlaceholder('top-leaderboard', false);
        expect(placeholder.width).toBe(728);
        expect(placeholder.height).toBe(90);
        expect(placeholder.reservedMinHeight).toBe(90);
      }
    },
    {
      name: 'F64.3: Development placeholder adapts to mobile dimensions (320x50 mobile)',
      async run() {
        const placeholder = AdSenseAntiClsEngine.renderDevPlaceholder('top-leaderboard', true);
        expect(placeholder.width).toBe(320);
        expect(placeholder.height).toBe(50);
        expect(placeholder.reservedMinHeight).toBe(50);
      }
    },
    {
      name: 'F64.4: Does NOT initiate any network requests to pagead2.googlesyndication.com',
      async run({ mockServer }) {
        const initialRequests = mockServer.requestHistory.length;
        // Render all 5 placeholders
        for (const slotKey of Object.keys(AdSenseAntiClsEngine.SLOT_CATALOG)) {
          AdSenseAntiClsEngine.renderDevPlaceholder(slotKey);
        }
        // Zero external requests fired
        expect(mockServer.requestHistory.length).toBe(initialRequests);
      }
    },
    {
      name: 'F64.5: Placeholder displays slot identifier for developer auditing',
      async run() {
        const placeholder = AdSenseAntiClsEngine.renderDevPlaceholder('sticky-sidebar');
        expect(placeholder.slotId).toBe('1000000002');
      }
    }
  ]
};
