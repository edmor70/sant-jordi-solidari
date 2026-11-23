import type {Database} from '@/integrations/supabase/types';
import type {Summary} from './pricing';
import {generatePaymentDocuments} from './proforma.server';
type Row=Database['public']['Tables']['quote_requests']['Row'];
export async function reservationDocuments(row:Row,origin:string){
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const path=`payment-documents/${row.id}/revision-${row.revision}/bundle.json`;
 const {data:stored}=await db.storage.from('quote-drafts').download(path);
 if(stored)return JSON.parse(await stored.text()) as {reference:string;dueDate:string;amount:number;bytes:number[]}[];
 const {data:prior}=await db.from('quote_requests').select('id').lte('created_at',row.created_at).order('created_at',{ascending:true}).order('id',{ascending:true});
 const idx=(prior??[]).findIndex(r=>r.id===row.id);
 const sequence=Math.max(1,Math.min(9999,idx>=0?idx+1:(prior?.length??0)+1));
 const b=row.breakdown as unknown as {summary:Summary;paymentPlan?:'single'|'split'};
 const docs=await generatePaymentDocuments({reference:row.reference,date:new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid'}).format(new Date(row.created_at)),plan:b.paymentPlan??'single',sequence,summary:b.summary,customer:{name:row.company??row.full_name,taxId:row.billing_tax_id??'',address:row.billing_address??'',email:row.billing_email??row.email}},origin);
 const bundle=docs.map(d=>({...d,bytes:Array.from(d.bytes)}));
 await db.storage.createBucket('quote-drafts',{public:false}).catch(()=>{});
 for(const d of docs){
  const pdfPath=`payment-documents/${row.id}/revision-${row.revision}/${d.reference}.pdf`;
  await db.storage.from('quote-drafts').upload(pdfPath,d.bytes,{contentType:'application/pdf',upsert:true}).catch(()=>{});
 }
 await db.storage.from('quote-drafts').upload(path,new Blob([JSON.stringify(bundle)],{type:'application/json'}),{upsert:true}).catch(()=>{});
 return bundle;
}
