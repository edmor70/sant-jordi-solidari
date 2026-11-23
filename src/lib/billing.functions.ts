import { createServerFn } from '@tanstack/react-start';
import { getRequestUrl } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { billingCustomerSchema } from './billing';
import { CAMPAIGN } from './campaign';
import { billingCopy } from './i18n/billing';

export const billingAccess = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {data,error}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});
  return !error && data===true;
});
export const billingList = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
  const results=await Promise.all([db.from('billing_orders').select('*').order('created_at',{ascending:false}),db.from('billing_invoices').select('*').order('issued_at',{ascending:false}),db.from('billing_events').select('*').order('created_at',{ascending:false}),db.from('billing_dispatch').select('*'),db.from('quote_requests').select('id,reference,company,email,billing_tax_id,billing_address,billing_email,total_roses,mode').order('created_at',{ascending:false}),db.from('payment_documents').select('*'),db.from('payment_operations').select('*'),db.from('payment_document_dispatch').select('*')]);
  for(const r of results)if(r.error)throw r.error;
  return {orders:results[0].data??[],invoices:results[1].data??[],events:results[2].data??[],dispatch:results[3].data??[],reservations:results[4].data??[],paymentDocuments:results[5].data??[],paymentOperations:results[6].data??[],paymentDispatch:results[7].data??[]};
});
export const billingCreateOrder=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((value:unknown)=>z.object({customer:billingCustomerSchema,reservationId:z.string().uuid().optional(),test:z.boolean().default(true)}).parse(value)).handler(async({data,context})=>{
  const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
  // Real reservation preparation is allowed, but all fiscal issuance is blocked at the DB boundary.
  let quantity=50;
  if(data.reservationId){const {data:row,error}=await db.from('quote_requests').select('total_roses,mode').eq('id',data.reservationId).single();if(error||!row)throw new Error('reservation_missing');if(row.mode!=='pickup')throw new Error('shipping_tax_validation_pending');quantity=row.total_roses;}
  if(!data.test&&!data.reservationId)throw new Error('reservation_required');
  const {data:order,error}=await db.from('billing_orders').insert({reservation_id:data.reservationId??null,is_test:data.test,customer:data.customer,lines:[{description:billingCopy.es.roses,quantity,unitBase:CAMPAIGN.rose.basePrice,vatRate:CAMPAIGN.rose.vatRate,discountPct:0}]}).select('*').single();if(error||!order)throw error??new Error('order_failed');
  await db.from('billing_audit').insert({actor:context.userId,action:'create_order',entity_id:order.id});return order.id;
});
export const billingRecordEvent=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((value:unknown)=>z.object({orderId:z.string().uuid(),kind:z.enum(['confirmation','advance','delivery','cancellation','refund']),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),amount:z.number().min(0).max(1000000),reason:z.string().max(1000).default(''),key:z.string().uuid()}).parse(value)).handler(async({data,context})=>{
  const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
  const {data:id,error}=await db.rpc('billing_record_event',{p_order:data.orderId,p_kind:data.kind,p_date:data.date,p_amount:data.amount,p_reason:data.reason,p_key:data.key,p_actor:context.userId});if(error)throw error;return id;
});
export const billingIssue=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((value:unknown)=>z.object({eventId:z.string().uuid(),originalId:z.string().uuid().optional()}).parse(value)).handler(async({data,context})=>{
  const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
  const {data:id,error}=await db.rpc('billing_issue_test',{p_event:data.eventId,p_actor:context.userId,...(data.originalId?{p_original:data.originalId}:{})});if(error||!id)throw error??new Error('issue_failed');
  const {data:invoice}=await db.from('billing_invoices').select('*').eq('id',id).single();if(!invoice)throw new Error('invoice_missing');
  const {dispatchTestInvoice}=await import('./billing.server');await dispatchTestInvoice(invoice,getRequestUrl().origin);return id;
});
export const billingRetry=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((value:unknown)=>z.string().uuid().parse(value)).handler(async({data,context})=>{
  const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
  const {data:invoice}=await db.from('billing_invoices').select('*').eq('id',data).single();if(!invoice)throw new Error('invoice_missing');
  const {dispatchTestInvoice}=await import('./billing.server');await dispatchTestInvoice(invoice,getRequestUrl().origin);return true;
});
export const billingDownload=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((value:unknown)=>z.string().uuid().parse(value)).handler(async({data,context})=>{
  const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {data:row}=await db.from('billing_dispatch').select('pdf_path').eq('invoice_id',data).single();if(!row?.pdf_path)throw new Error('pdf_pending');
  const {data:file,error}=await db.storage.from('quote-drafts').download(row.pdf_path);if(error||!file)throw new Error('pdf_missing');
  return {bytes:Array.from(new Uint8Array(await file.arrayBuffer()))};
});
export const billingPaymentDocuments=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((value:unknown)=>z.string().uuid().parse(value)).handler(async({data,context})=>{
 const {data:allowed}=await context.supabase.rpc('has_billing_role',{_user_id:context.userId});if(!allowed)throw new Error('forbidden');
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {data:row,error}=await db.from('quote_requests').select('*').eq('id',data).single();if(error||!row)throw new Error('reservation_missing');
 const {reservationDocuments}=await import('./reservation-documents.server');
 return reservationDocuments(row,getRequestUrl().origin);
});