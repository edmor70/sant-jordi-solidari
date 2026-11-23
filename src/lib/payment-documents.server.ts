import type { Database, Json } from '@/integrations/supabase/types';
import { officialInvoicePdf } from './official-invoice.server';
import type { Summary } from './pricing';
import { CAMPAIGN } from './campaign';
import { billingCopy } from './i18n/billing';
import { sendResend, resendSender, MailError, type MailPayload } from './resend.server';
type Document = Database['public']['Tables']['payment_documents']['Row'];
export type PaymentSnapshot = {reference:string; customer:{name:string;taxId:string;address:string;email:string;postalCode?:string;city?:string};summary:Summary};
export async function archivePaymentDocument(id: string, origin: string, dispatch = false) {
  const {supabaseAdmin:db} = await import('@/integrations/supabase/client.server');
  const {data:claim,error} = await db.rpc('payment_document_claim',{p_id:id});
  if(error) throw error;
  if(!claim?.lease_token) throw new Error('document_processing');
  const token=claim.lease_token;
  const save=async(patch:Database['public']['Tables']['payment_document_dispatch']['Update'])=>{
    const {error}=await db.from('payment_document_dispatch').update(patch).eq('document_id',id).eq('lease_token',token);if(error)throw error;
  };
  try {
    const {data:d,error}=await db.from('payment_documents').select('*').eq('id',id).single();if(error||!d)throw new Error('document_missing');
    const {data:o}=await db.from('payment_operations').select('*').eq('id',d.operation_id).single();if(!o?.is_test)throw new Error('production_invoicing_locked');
    const s=o.snapshot as unknown as PaymentSnapshot;
    const {data:a}=d.advance_document_id?await db.from('payment_documents').select('*').eq('id',d.advance_document_id).single():{data:null};
    let path=claim.pdf_path, bytes:Uint8Array;
    if(path){const {data:file,error}=await db.storage.from('quote-drafts').download(path);if(error||!file)throw new Error('pdf_download_failed');bytes=new Uint8Array(await file.arrayBuffer());}
    else{
      bytes=await officialInvoicePdf({number:d.number,reservation:s.reference,stage:d.stage as 'single'|'advance'|'final',issuedDate:d.issued_date,dueDate:d.due_date,base:d.base,vat:d.vat,total:d.total,paid:d.paid,...(a?{advanceNumber:a.number,advanceBase:a.base,advanceVat:a.vat}:{}),customer:s.customer,summary:s.summary,test:true},origin);
      path=`payment-documents/official-test/${id}.pdf`;
      const {error}=await db.storage.from('quote-drafts').upload(path,bytes,{contentType:'application/pdf',upsert:false});
      if(error){const {data:file}=await db.storage.from('quote-drafts').download(path);if(!file)throw new Error('pdf_archive_failed');bytes=new Uint8Array(await file.arrayBuffer());}
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes)))).map(n=>n.toString(16).padStart(2,'0')).join('');
      await save({pdf_path:path,pdf_sha256:hash});
    }
    if(dispatch && claim.email_status!=='sent'){
      // Tests in this update must not send externally; callers opt in separately.
      try{
        if(process.env['BILLING_TEST_RECIPIENT']!=='eduard.moreira@alumni.esade.edu')throw new MailError('recipient_not_authorized');
        let snapshot=claim.mail_payload as unknown as MailPayload|null;
        if(claim.mail_prepared_at && Date.now()-Date.parse(claim.mail_prepared_at)>=23*60*60*1000)throw new MailError('email_retry_review_required');
        if(!snapshot){let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
          snapshot={from:resendSender(),to:['eduard.moreira@alumni.esade.edu'],subject:`${billingCopy.es.mailSubject} ${d.number}`,text:billingCopy.es.mailBody,attachments:[{filename:`${d.number}.pdf`,content:btoa(binary)}]};
          await save({mail_payload:snapshot as unknown as Json,mail_prepared_at:new Date().toISOString()});
        }
        if(snapshot.to.length!==1||snapshot.to[0]!=='eduard.moreira@alumni.esade.edu')throw new MailError('recipient_not_authorized');
        const provider=await sendResend(snapshot,`official-test-${id}`);await save({email_status:'sent',email_error:null,provider_id:provider});
      }catch(e){await save({email_status:'failed',email_error:e instanceof MailError?e.code:'provider_response_unknown'});}
    }
    // Every archived invoice PDF (U, M.1, M.2) is registered in Notion «Facturas» with the PDF attached as a Notion file.
    // Status becomes 'sent' only after Notion confirms the row carries the file.
    if(CAMPAIGN.integrations.notionAutomationEnabled && claim.notion_status!=='sent'){
      try{
        const {syncNotionInvoice}=await import('./notion-invoices.server');
        const pageId=await syncNotionInvoice({number:d.number,reference:s.reference,customer:{name:s.customer.name,taxId:s.customer.taxId,email:s.customer.email},plan:o.plan==='split'?'split':'single',stage:d.stage as 'single'|'advance'|'final',base:d.base,vat:d.vat,total:d.total,paid:d.paid,issuedDate:d.issued_date,dueDate:d.due_date,state:'pendiente',summary:s.summary},{test:o.is_test,pageId:claim.notion_page_id,pdf:bytes});
        await save({notion_status:'sent',notion_error:null,notion_page_id:pageId});
      }catch(e){await save({notion_status:'failed',notion_error:(e instanceof Error?e.message:'notion_sync_failed').slice(0,300)});}
    }
    return {reference:d.number,dueDate:d.due_date,amount:d.total,bytes:Array.from(bytes)};
  }finally{await save({lease_token:null,lease_until:null});}
}
export async function prepareOfficialDocument(input:{key:string;reservationId?:string;orderId?:string;plan:'single'|'split';stage:Document['stage'];snapshot:PaymentSnapshot;actor:string},origin:string){
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
  // Generated RPC types omit PostgreSQL's nullable UUID arguments; send SQL null, not an invalid empty UUID.
  const {data:id,error}=await db.rpc('payment_prepare',{p_key:input.key,p_reservation:(input.reservationId??null) as unknown as string,p_order:(input.orderId??null) as unknown as string,p_test:true,p_plan:input.plan,p_snapshot:input.snapshot as unknown as Json,p_stage:input.stage,p_actor:input.actor});
  if(error||!id)throw error??new Error('payment_prepare_failed');
  return archivePaymentDocument(id,origin);
}