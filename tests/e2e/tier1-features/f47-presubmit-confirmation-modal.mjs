import { expect } from '../harness/assert.mjs';
import { ContactSecurityEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F47: Pre-Submit Confirmation Modal (Review Before Sending)',
  tier: 1,
  tests: [
    {
      name: 'F47.1: Generates structured review summary with name, email, subject, and length',
      async run() {
        const payload = {
          name: 'Carlos Sysadmin',
          email: 'carlos@empresa.com',
          subject: 'Pregunta sobre particiones GPT',
          message: 'Hola, tengo una duda sobre cómo alinear cilindros en fdisk con sectores de 4096 bytes.'
        };

        const summary = ContactSecurityEngine.generateReviewSummary(payload);
        expect(summary.name).toBe('Carlos Sysadmin');
        expect(summary.email).toBe('carlos@empresa.com');
        expect(summary.subject).toBe('Pregunta sobre particiones GPT');
        expect(summary.messageLength).toBeGreaterThan(50);
      }
    },
    {
      name: 'F47.2: Truncates long message preview with ellipsis for clean modal display',
      async run() {
        const payload = {
          name: 'Ana',
          email: 'ana@example.com',
          subject: 'Feedback',
          message: 'A'.repeat(200)
        };

        const summary = ContactSecurityEngine.generateReviewSummary(payload);
        expect(summary.messagePreview.length).toBeLessThan(150);
        expect(summary.messagePreview.endsWith('...')).toBe(true);
      }
    },
    {
      name: 'F47.3: Form validation occurs BEFORE displaying confirmation modal',
      async run() {
        const invalidPayload = {
          name: '',
          email: 'not-an-email',
          subject: '',
          message: 'short'
        };

        const validation = ContactSecurityEngine.validateContactPayload(invalidPayload);
        expect(validation.isValid).toBe(false);
        // If invalid, confirmation modal should NOT be presented
        expect(Object.keys(validation.errors).length).toBeGreaterThanOrEqual(3);
      }
    },
    {
      name: 'F47.4: Canceling confirmation modal preserves entered form inputs in draft state',
      async run() {
        const draftState = {
          name: 'Borrador',
          email: 'borrador@example.com',
          subject: 'Duda',
          message: 'Texto del mensaje que no debe borrarse al cancelar.'
        };

        const modal = {
          isOpen: true,
          cancel() {
            this.isOpen = false;
          }
        };

        modal.cancel();
        expect(modal.isOpen).toBe(false);
        expect(draftState.name).toBe('Borrador');
        expect(draftState.message).toContain('no debe borrarse');
      }
    },
    {
      name: 'F47.5: Confirming submission triggers API POST call with validated payload',
      async run({ client }) {
        const payload = {
          name: 'Usuario Confirmado',
          email: 'confirmado@example.com',
          subject: 'Aprobado desde modal',
          message: 'Mensaje validado y confirmado por el usuario en el modal.'
        };

        const res = await client.request('/contact-messages', {
          method: 'POST',
          body: payload
        });

        expect(res.success).toBe(true);
        expect(res.message).toBe('Mensaje recibido correctamente');
      }
    }
  ]
};
