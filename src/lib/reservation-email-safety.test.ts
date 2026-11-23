import {expect,it} from 'vitest';
import {CAMPAIGN} from './campaign';
import {INTERNAL_RECIPIENT,internalEnvelope} from './notice-envelope';
it('reservation notices always target the authorized internal mailbox and reuse one reference key',()=>{
 const a=internalEnvelope('SJ27-RESERVA','customer@example.invalid'),b=internalEnvelope('SJ27-RESERVA','other@example.invalid');
 expect(a.to).toBe('solidaristjordi@gmail.com');expect(INTERNAL_RECIPIENT).toBe(a.to);expect(a.replyTo).toBe('customer@example.invalid');expect(a.idempotencyKey).toBe(b.idempotencyKey);expect(CAMPAIGN.integrations.buyerConfirmationsEnabled).toBe(false);
});
