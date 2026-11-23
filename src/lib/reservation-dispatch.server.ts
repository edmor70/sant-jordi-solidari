import { CAMPAIGN } from './campaign';
import { syncReservation } from './notion.server';
import { INTERNAL_RECIPIENT } from './notice-envelope';
import { prepareReservationMail, pdfAttachments } from './reservation-mail.server';
import { sendResend, MailError } from './resend.server';
import { sendReservationEvent } from './reservation-notices.server';
import type { Database } from '@/integrations/supabase/types';
export async function dispatchReservation(id:string){
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {data:row,error}=await db.rpc('reservation_claim',{p_id:id});if(error)throw error;if(!row?.id||!row.dispatch_token)return;
 const token=row.dispatch_token;
 const save=async(patch:Database['public']['Tables']['quote_requests']['Update'])=>{const {error}=await db.from('quote_requests').update(patch).eq('id',id).eq('dispatch_token',token);if(error)throw error;};
 try{
  // Only internal notifications: never use the customer's address as a recipient.
  if(row.email_status!=='sent'){
   const key=process.env['RESEND_API_KEY'],from=process.env['RESEND_FROM_EMAIL'];
   if(!CAMPAIGN.integrations.reservationEmailsEnabled||!key||!from)await save({email_status:'pending',email_error:'email_not_configured'});
   else{
    try{
     let snapshot = row.internal_notice as unknown as {payload:import('./resend.server').MailPayload;preparedAt:string}|null;
     if(snapshot && !snapshot.payload) snapshot={payload:row.internal_notice as unknown as import('./resend.server').MailPayload,preparedAt:row.created_at};
     // Resend deduplicates for 24h only. Never resend an old uncertain outcome blindly.
     if(snapshot && Date.now()-Date.parse(snapshot.preparedAt)>=23*60*60*1000) throw new MailError('email_retry_review_required');
     if(!snapshot){
      const {data:file,error:downloadError}=await db.storage.from('quote-drafts').download(`payment-documents/${row.id}/revision-${row.revision}/bundle.json`);
      if(downloadError && !/not found|not_found|does not exist/i.test(downloadError.message)) throw new MailError('pdf_download_failed');
      const attachments=file?pdfAttachments(JSON.parse(await file.text()),row.reference):[];
      snapshot={payload:prepareReservationMail(row,attachments),preparedAt:new Date().toISOString()};
      await save({internal_notice:JSON.parse(JSON.stringify(snapshot))});
     }
     if(snapshot.payload.to.length!==1||snapshot.payload.to[0]!==INTERNAL_RECIPIENT)throw new MailError('recipient_not_authorized');
     const providerId=await sendResend(snapshot.payload,`internal-quote-${row.reference}`);
     await save({email_status:'sent',email_error:null,email_provider_id:providerId});
    }catch(e){await save({email_status:'failed',email_error:e instanceof MailError?e.code:'email_preparation_failed'});}
   }
  }
  if(CAMPAIGN.integrations.notionAutomationEnabled&&(row.notion_status!=='sent'||row.notion_revision!==row.revision)){
   const {data:current,error}=await db.from('quote_requests').select('*').eq('id',id).single();if(error||!current)throw error??new Error('reservation_missing');
   try{const page=await syncReservation(current);await save({notion_status:'sent',notion_error:null,notion_page_id:page,notion_revision:row.revision});}
   catch(e){console.error('reservation notion failed',e instanceof Error?e.message:'notion_failed');await save({notion_status:'failed',notion_error:'notion_sync_failed'});await sendReservationEvent(current,'integration_error');}
  }
  if(row.revision>1) await sendReservationEvent(row,'updated');
 }finally{await save({dispatch_token:null,dispatch_until:null});}
}
