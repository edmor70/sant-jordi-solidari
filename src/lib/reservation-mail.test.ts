import { afterEach, expect, it, vi } from 'vitest';
import { prepareReservationMail, pdfAttachments, buyerConfirmationsEnabled } from './reservation-mail.server';
import { sendResend } from './resend.server';
import type { Database } from '@/integrations/supabase/types';
import {buildSummary} from './pricing';
afterEach(()=>{vi.unstubAllEnvs();vi.restoreAllMocks();vi.useRealTimers();});
const row = {reference:'SJ27-TEST',lang:'es',email:'buyer@example.invalid',full_name:'Test buyer',company:'Test company',total_roses:50,notes:'',breakdown:{paymentPlan:'split'}} as unknown as Database['public']['Tables']['quote_requests']['Row'];
it('uses the authorized sender and fixed internal recipient',()=>{
 vi.stubEnv('RESEND_FROM_EMAIL','pedidos@santjordisolidari.es');
 const mail=prepareReservationMail(row);
 expect(mail.from).toBe('pedidos@santjordisolidari.es');expect(mail.to).toEqual(['solidaristjordi@gmail.com']);expect(mail.reply_to).toBe('buyer@example.invalid');
});
it('includes the combined taxable base and VAT for 165 euros of roses plus 4 euros delivery',()=>{
 vi.stubEnv('RESEND_FROM_EMAIL','pedidos@santjordisolidari.es');
 const mail=prepareReservationMail({...row,destinations:[{street:'Carrer de Mallorca 401',postalCode:'08013',city:'Barcelona',cost:4}],breakdown:{paymentPlan:'single',summary:buildSummary({mode:'delivery',roses:55,shipping:[4]})}} as unknown as typeof row);
 expect(mail.text).toContain('169,00');expect(mail.text).toContain('16,90');expect(mail.text).toContain('185,90');expect(mail.text).toContain('Carrer de Mallorca 401');
});
it('prepares buyer confirmation without enabling delivery',()=>{
 vi.stubEnv('RESEND_FROM_EMAIL','pedidos@santjordisolidari.es');
 expect(prepareReservationMail(row,[],true).to).toEqual(['buyer@example.invalid']);expect(buyerConfirmationsEnabled()).toBe(false);
});
it('attaches both available PDFs with their reservation references',()=>{
 const docs=pdfAttachments([{reference:'SJ27-TEST',bytes:[37,80,68,70,45,49]},{reference:'SJ27-TEST.2',bytes:[37,80,68,70,45,50]}],'SJ27-TEST');
 expect(docs.map(d=>d.filename)).toEqual(['SJ27-TEST.pdf','SJ27-TEST.2.pdf']);expect(atob(docs[0]?.content ?? '')).toBe('%PDF-1');
});
it('retries transient errors with identical payload and idempotency key',async()=>{
 vi.useFakeTimers();vi.stubEnv('RESEND_API_KEY','test-credential');vi.stubEnv('RESEND_FROM_EMAIL','pedidos@santjordisolidari.es');
 const f=vi.spyOn(globalThis,'fetch').mockResolvedValueOnce(new Response('',{status:503})).mockResolvedValueOnce(Response.json({id:'accepted'}));
 const pending=sendResend(prepareReservationMail(row),'internal-quote-SJ27-TEST');await vi.runAllTimersAsync();expect(await pending).toBe('accepted');
 expect(f).toHaveBeenCalledTimes(2);expect(f.mock.calls[0]?.[1]?.body).toBe(f.mock.calls[1]?.[1]?.body);expect(new Headers(f.mock.calls[1]?.[1]?.headers).get('Idempotency-Key')).toBe('internal-quote-SJ27-TEST');
});
it('does not retry an invalid key and does not mark rejection as accepted',async()=>{
 vi.stubEnv('RESEND_API_KEY','test-credential');vi.stubEnv('RESEND_FROM_EMAIL','pedidos@santjordisolidari.es');
 const f=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('',{status:400}));
 await expect(sendResend(prepareReservationMail(row),'test-key')).rejects.toThrow('resend_400');expect(f).toHaveBeenCalledTimes(1);
});