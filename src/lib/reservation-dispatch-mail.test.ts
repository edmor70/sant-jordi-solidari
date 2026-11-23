import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {dispatchReservation} from './reservation-dispatch.server';
const m=vi.hoisted(()=>({rpc:vi.fn(),update:vi.fn(),download:vi.fn()}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{rpc:m.rpc,from:()=>({update:(p:unknown)=>{m.update(p);return{eq:()=>({eq:async()=>({error:null})})};}}),storage:{from:()=>({download:m.download})}}}));
vi.mock('./notion.server',()=>({syncReservation:vi.fn()}));
const base={id:'r',reference:'SJ27-TEST',dispatch_token:'lease',email_status:'pending',email_error:null,internal_notice:null,lang:'es',email:'buyer@example.invalid',full_name:'Test',company:'Test',total_roses:50,notes:'',breakdown:{paymentPlan:'single'},notion_status:'sent',notion_revision:1,revision:1};
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('RESEND_API_KEY','test-credential');vi.stubEnv('RESEND_FROM_EMAIL','pedidos@santjordisolidari.es');m.download.mockResolvedValue({data:null,error:{message:'Object not found'}});});
afterEach(()=>{vi.unstubAllEnvs();vi.restoreAllMocks();});
it('stores a snapshot, sends only internally and records provider acceptance',async()=>{
 m.rpc.mockResolvedValue({data:base,error:null});const f=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({id:'provider-id'}));
 await dispatchReservation('r');const body=JSON.parse(String(f.mock.calls[0]?.[1]?.body));expect(body.to).toEqual(['solidaristjordi@gmail.com']);expect(m.update).toHaveBeenCalledWith({email_status:'sent',email_error:null,email_provider_id:'provider-id'});expect(m.update.mock.calls.find(([p])=>p.internal_notice)?.[0].internal_notice.payload).toEqual(body);
});
it('never sends again after stored acceptance',async()=>{
 m.rpc.mockResolvedValue({data:{...base,email_status:'sent'},error:null});const f=vi.spyOn(globalThis,'fetch');await dispatchReservation('r');expect(f).not.toHaveBeenCalled();
});
it('blocks uncertain retries beyond the provider deduplication window',async()=>{
 m.rpc.mockResolvedValue({data:{...base,internal_notice:{preparedAt:'2020-01-01T00:00:00Z',payload:{from:'pedidos@santjordisolidari.es',to:['solidaristjordi@gmail.com'],subject:'Test',text:'Test'}}},error:null});
 const f=vi.spyOn(globalThis,'fetch');await dispatchReservation('r');expect(f).not.toHaveBeenCalled();expect(m.update).toHaveBeenCalledWith({email_status:'failed',email_error:'email_retry_review_required'});
});
it('reuses stored attachments even if new documents appear on retry',async()=>{
 const payload={from:'pedidos@santjordisolidari.es',to:['solidaristjordi@gmail.com'],subject:'Test',text:'Test',attachments:[{filename:'SJ27-TEST.pdf',content:'JVBERi0='}]};
 m.rpc.mockResolvedValue({data:{...base,internal_notice:{preparedAt:new Date().toISOString(),payload}},error:null});const f=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({id:'accepted'}));await dispatchReservation('r');expect(JSON.parse(String(f.mock.calls[0]?.[1]?.body))).toEqual(payload);expect(m.download).not.toHaveBeenCalled();
});