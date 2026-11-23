import {createServerFn} from '@tanstack/react-start';
import {getRequestUrl} from '@tanstack/react-start/server';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {z} from 'zod';
import {prepareOfficialDocument,archivePaymentDocument} from './payment-documents.server';
import {buildSummary} from './pricing';
export const prepareOrderPayment=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((value:unknown)=>z.object({orderId:z.string().uuid(),plan:z.enum(['single','split']),stage:z.enum(['single','advance','final'])}).parse(value)).handler(async({data,context})=>{
  const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
  const {data:order}=await db.from('billing_orders').select('*').eq('id',data.orderId).single();if(!order?.is_test)throw new Error('production_invoicing_locked');
  const {data:existing}=await db.from('payment_operations').select('*').eq('operation_key',`order-${order.id}`).maybeSingle();
  const customer=order.customer as unknown as {name:string;taxId:string;address:string;email:string};
  const lines=order.lines as unknown as {quantity:number}[];
  let snapshot:import('./payment-documents.server').PaymentSnapshot;
  if(existing)snapshot=existing.snapshot as unknown as import('./payment-documents.server').PaymentSnapshot;
  else if(order.reservation_id){
    const {data:reservation,error}=await db.from('quote_requests').select('reference,breakdown').eq('id',order.reservation_id).single();
    if(error||!reservation)throw new Error('reservation_missing');
    const b=reservation.breakdown as unknown as {summary:import('./pricing').Summary};
    snapshot={reference:reservation.reference,customer,summary:b.summary};
  }else snapshot={reference:order.id,customer,summary:buildSummary({mode:'pickup',roses:lines[0]?.quantity??50,shipping:[]})};
  return prepareOfficialDocument({key:`order-${order.id}`,orderId:order.id,...(order.reservation_id?{reservationId:order.reservation_id}:{}),plan:data.plan,stage:data.stage,snapshot,actor:context.userId},getRequestUrl().origin);
});
export const downloadOfficialPayment=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((value:unknown)=>z.string().uuid().parse(value)).handler(async({data,context})=>{
  const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');
  return archivePaymentDocument(data,getRequestUrl().origin);
});