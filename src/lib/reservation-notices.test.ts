import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {sendReservationEvent} from './reservation-notices.server';
import type {Database} from '@/integrations/supabase/types';
const m=vi.hoisted(()=>({row:{id:'notice',status:'pending',prepared_at:null,payload:null} as Record<string,unknown>,patches:[] as unknown[],send:vi.fn()}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{from:()=>({upsert:async()=>({error:null}),select:()=>({eq:()=>({eq:()=>({eq:()=>({single:async()=>({data:m.row,error:null})})})})}),update:(p:unknown)=>{m.patches.push(p);return{eq:async()=>({error:null})};}})}}));
vi.mock('./resend.server',async()=>{const actual=await vi.importActual<typeof import('./resend.server')>('./resend.server');return{...actual,sendResend:m.send};});
const row={id:'r',reference:'SJ27-PRUEBA',revision:2,lang:'es',company:'PRUEBA',full_name:'PRUEBA',email:'buyer@example.invalid',breakdown:{},total_roses:50} as unknown as Database['public']['Tables']['quote_requests']['Row'];
beforeEach(()=>{vi.stubEnv('RESEND_FROM_EMAIL','pedidos@santjordisolidari.es');m.row={id:'notice',status:'pending',prepared_at:null,payload:null};m.patches=[];m.send.mockReset().mockResolvedValue('accepted');});
afterEach(()=>vi.unstubAllEnvs());
it('modification notices go only to the team with a revision-bound key',async()=>{
 await sendReservationEvent(row,'updated');
 expect(m.send.mock.calls[0]?.[0].to).toEqual(['solidaristjordi@gmail.com']);
 expect(m.send.mock.calls[0]?.[1]).toBe('reservation-SJ27-PRUEBA-2-updated');
 expect(m.patches).toContainEqual({status:'sent',provider_id:'accepted',error:null});
});
it('an accepted modification notice is never resent',async()=>{m.row['status']='sent';await sendReservationEvent(row,'updated');expect(m.send).not.toHaveBeenCalled();});
it('an uncertain notice older than 23 hours requires review',async()=>{m.row['prepared_at']='2020-01-01';await sendReservationEvent(row,'updated');expect(m.send).not.toHaveBeenCalled();expect(m.patches).toContainEqual({status:'failed',error:'email_retry_review_required'});});