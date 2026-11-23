import {afterEach,expect,it,vi} from 'vitest';
import {dispatchTestInvoice} from './billing.server';
import type {Database} from '@/integrations/supabase/types';
const m=vi.hoisted(()=>({update:vi.fn(),send:vi.fn(),claim:vi.fn()}));
vi.mock('./resend.server',async()=>{const actual=await vi.importActual<typeof import('./resend.server')>('./resend.server');return {...actual,sendResend:m.send};});
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{from:()=>({update:(p:unknown)=>{m.update(p);return{eq:()=>({or:()=>({select:()=>({maybeSingle:m.claim})}),then:(resolve:(v:unknown)=>unknown)=>Promise.resolve({error:null}).then(resolve)})};},insert:async()=>({error:null})}),storage:{from:()=>({download:async()=>({data:{arrayBuffer:async()=>new TextEncoder().encode('%PDF-test').buffer},error:null})})}}}));
afterEach(()=>{vi.clearAllMocks();vi.unstubAllEnvs();});
const invoice={id:'test-invoice',is_test:true,issued_at:new Date().toISOString(),number:'TEST-0001',total:165,actor:'test-actor'} as Database['public']['Tables']['billing_invoices']['Row'];
function setup(){vi.stubEnv('RESEND_API_KEY','test-credential');vi.stubEnv('RESEND_FROM_EMAIL','pedidos@santjordisolidari.es');vi.stubEnv('BILLING_TEST_RECIPIENT','eduard.moreira@alumni.esade.edu');m.claim.mockResolvedValue({data:{pdf_path:'test.pdf',email_status:'pending',notion_status:'sent',attempts:0},error:null});m.send.mockResolvedValue('accepted');}
it('sends test invoice PDF only to Eduard using a stable invoice key',async()=>{
 setup();await dispatchTestInvoice(invoice,'http://localhost:8080');expect(m.send).toHaveBeenCalledWith(expect.objectContaining({to:['eduard.moreira@alumni.esade.edu'],from:'pedidos@santjordisolidari.es',attachments:[{filename:'TEST-0001.pdf',content:btoa('%PDF-test')}]}),'billing-test-test-invoice');
 expect(m.update).toHaveBeenCalledWith(expect.objectContaining({email_status:'sent',provider_id:'accepted'}));
});
it('blocks any other test recipient',async()=>{
 setup();vi.stubEnv('BILLING_TEST_RECIPIENT','other@example.invalid');await dispatchTestInvoice(invoice,'http://localhost:8080');expect(m.send).not.toHaveBeenCalled();
});
it('does not resend an accepted invoice',async()=>{
 setup();m.claim.mockResolvedValue({data:{pdf_path:'test.pdf',email_status:'sent',notion_status:'sent',attempts:1},error:null});await dispatchTestInvoice(invoice,'http://localhost:8080');expect(m.send).not.toHaveBeenCalled();
});
it('never sends production invoices',async()=>{
 setup();await expect(dispatchTestInvoice({...invoice,is_test:false},'http://localhost:8080')).rejects.toThrow('production_invoicing_locked');expect(m.send).not.toHaveBeenCalled();
});