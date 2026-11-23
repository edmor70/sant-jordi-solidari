import {beforeEach,expect,it,vi} from 'vitest';
import {reservationDocuments} from './reservation-documents.server';
import type {Database} from '@/integrations/supabase/types';
import {buildSummary} from './pricing';
const m=vi.hoisted(()=>({download:vi.fn(),upload:vi.fn(),generate:vi.fn()}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{storage:{from:()=>({download:m.download,upload:m.upload})}}}));
vi.mock('./proforma.server',()=>({generatePaymentDocuments:m.generate}));
const row={id:'r',reference:'SJ27-TEST',revision:1,created_at:'2026-11-19T12:00:00Z',company:'TEST',full_name:'TEST',email:'test@example.invalid',breakdown:{paymentPlan:'single',summary:buildSummary({mode:'delivery',roses:55,shipping:[4]})}} as unknown as Database['public']['Tables']['quote_requests']['Row'];
beforeEach(()=>{vi.clearAllMocks();m.download.mockResolvedValue({data:null});m.upload.mockResolvedValue({error:null});m.generate.mockResolvedValue([{reference:'SJ27-TEST',amount:185.9,dueDate:'2026-11-24',bytes:new Uint8Array([37,80,68,70,45])}]);});
it('archives the actual PDF before publishing the revision bundle with the 185.90 euro order',async()=>{
 const docs=await reservationDocuments(row,'http://localhost:8080');expect(docs[0]?.amount).toBe(185.9);
 expect(m.upload.mock.calls.map(c=>c[0])).toEqual(['payment-documents/r/revision-1/SJ27-TEST.pdf','payment-documents/r/revision-1/bundle.json']);
});
it('reloads the same stored revision without generating another document',async()=>{
 m.download.mockResolvedValue({data:{text:async()=>JSON.stringify([{reference:'SJ27-TEST',amount:185.9,bytes:[37,80,68,70,45]}])}});
 expect((await reservationDocuments(row,'http://localhost:8080'))[0]?.amount).toBe(185.9);expect(m.generate).not.toHaveBeenCalled();expect(m.upload).not.toHaveBeenCalled();
});