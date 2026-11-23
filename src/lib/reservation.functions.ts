import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { reservationEditSchema,reservationBreakdown } from './reservations';
export const reservationList=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {data,error}=await db.from('quote_requests').select('id,reference,revision,created_at,company,full_name,email,phone,billing_tax_id,billing_address,billing_email,mode,destinations,total_roses,notes,breakdown,reservation_status,notion_status,notion_error,email_status,email_error').order('created_at',{ascending:false});if(error)throw error;return data??[];
});
export const reservationUpdate=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>reservationEditSchema.parse(v)).handler(async({data,context})=>{
 const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {quoteAddress}=await import('./shipping.server');
 const {data:old,error}=await db.from('quote_requests').select('*').eq('id',data.id).single();if(error||!old)throw new Error('reservation_missing');
 const destinations=data.mode==='delivery'?data.destinations:[];const shipping:(number|null)[]=[];for(const d of destinations){const r=await quoteAddress(d);shipping.push(r.status==='ok'?r.cost:null);}
 const roses=data.mode==='pickup'?data.pickupRoses:destinations.reduce((n,d)=>n+d.roses,0);const previous=old.breakdown as {paymentPlan?:string};const breakdown=reservationBreakdown(data.mode,roses,shipping,previous.paymentPlan);
 const {error:updateError}=await db.rpc('reservation_update',{p_id:data.id,p_revision:data.revision,p_actor:context.userId,p_patch:{reservation_status:data.status,mode:data.mode,destinations:destinations.map((d,i)=>({...d,cost:shipping[i]})),total_roses:roses,notes:data.notes,breakdown,needs_review:shipping.includes(null)}});if(updateError)throw new Error(updateError.message);
 const {dispatchReservation}=await import('./reservation-dispatch.server');await dispatchReservation(data.id).catch(()=>{});return true;
});
export const reservationRetry=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.string().uuid().parse(v)).handler(async({data,context})=>{
 const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');const {dispatchReservation}=await import('./reservation-dispatch.server');await dispatchReservation(data);return true;
});
export const reservationNotices=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.string().uuid().parse(v)).handler(async({data,context})=>{
 const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {data:rows,error}=await db.from('reservation_notices').select('revision,kind,status,error,created_at').eq('reservation_id',data).order('created_at',{ascending:false});if(error)throw error;return rows??[];
});
