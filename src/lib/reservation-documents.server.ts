import type {Database} from '@/integrations/supabase/types';
import type {Summary} from './pricing';
import {generatePaymentDocuments} from './proforma.server';
type Row=Database['public']['Tables']['quote_requests']['Row'];
export async function reservationDocuments(row:Row,origin:string){
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const path=`payment-documents/${row.id}/revision-${row.revision}/bundle.json`;
 const {data:stored}=await db.storage.from('quote-drafts').download(path);
 if(stored)return JSON.parse(await stored.text()) as {reference:string;dueDate:string;amount:number;bytes:number[]}[];
 const b=row.breakdown as unknown as {summary:Summary;paymentPlan?:'single'|'split'};
 const docs=await generatePaymentDocuments({reference:row.reference,date:new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid'}).format(new Date(row.created_at)),plan:b.paymentPlan??'single',summary:b.summary,customer:{name:row.company??row.full_name,taxId:row.billing_tax_id??'',address:row.billing_address??'',email:row.billing_email??row.email}},origin);
 const bundle=docs.map(d=>({...d,bytes:Array.from(d.bytes)}));
 // Each PDF is a real private object; the immutable revision bundle is published last.
 for(const d of docs){
  const pdfPath=`payment-documents/${row.id}/revision-${row.revision}/${d.reference}.pdf`;
  const {error}=await db.storage.from('quote-drafts').upload(pdfPath,d.bytes,{contentType:'application/pdf',upsert:false});
  if(error){const {data:winner}=await db.storage.from('quote-drafts').download(pdfPath);if(!winner)throw new Error('payment_archive_failed');}
 }
 const {error}=await db.storage.from('quote-drafts').upload(path,new Blob([JSON.stringify(bundle)],{type:'application/json'}),{upsert:false});
 if(error){const {data:winner}=await db.storage.from('quote-drafts').download(path);if(!winner)throw new Error('payment_archive_failed');return JSON.parse(await winner.text()) as typeof bundle;}
 return bundle;
}