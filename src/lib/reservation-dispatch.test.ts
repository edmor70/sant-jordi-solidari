import {it,expect,vi} from 'vitest';
import {dispatchReservation} from './reservation-dispatch.server';
const mock=vi.hoisted(()=>({rpc:vi.fn(),update:vi.fn(),sync:vi.fn()}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{rpc:mock.rpc,from:()=>({update:(patch:unknown)=>{mock.update(patch);return {eq:()=>({eq:async()=>({error:null})})};},select:()=>({eq:()=>({single:async()=>({data:{id:'r',reference:'SJ27-ONE'},error:null})})})})}}));
vi.mock('./notion.server',()=>({syncReservation:mock.sync}));
vi.mock('./reservation-notices.server',()=>({sendReservationEvent:vi.fn()}));
it('integration failure preserves reservation and records retryable failure without emailing clients',async()=>{
 const fetch=vi.spyOn(globalThis,'fetch');mock.rpc.mockResolvedValue({data:{id:'r',dispatch_token:'token',email_status:'pending',notion_status:'pending',revision:1,notion_revision:0},error:null});mock.sync.mockRejectedValue(new Error('controlled_failure'));
 vi.stubEnv('RESEND_API_KEY','');
 await dispatchReservation('r');expect(mock.update).toHaveBeenCalledWith({email_status:'pending',email_error:'email_not_configured'});expect(mock.update).toHaveBeenCalledWith({notion_status:'failed',notion_error:'notion_sync_failed'});expect(mock.update).toHaveBeenCalledWith({dispatch_token:null,dispatch_until:null});expect(fetch).not.toHaveBeenCalled();fetch.mockRestore();vi.unstubAllEnvs();
});
