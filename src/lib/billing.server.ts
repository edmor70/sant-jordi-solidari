import type { Database } from '@/integrations/supabase/types';
import { invoicePdf } from './billing-pdf.server';
import { billingCopy } from './i18n/billing';
import { sendResend, MailError } from './resend.server';

type Invoice = Database['public']['Tables']['billing_invoices']['Row'];
export async function dispatchTestInvoice(invoice: Invoice, origin: string) {
  if (!invoice.is_test) throw new Error('production_invoicing_locked');
  const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server');
  const until = new Date(Date.now()+120000).toISOString();
  const { data: claimed, error: claimError } = await db.from('billing_dispatch').update({lease_until:until}).eq('invoice_id',invoice.id).or(`lease_until.is.null,lease_until.lt.${new Date().toISOString()}`).select('*').maybeSingle();
  if(claimError)throw claimError;
  if(!claimed)return;
  try {
    let bytes: Uint8Array;
    let path=claimed.pdf_path;
    if(path){const {data,error}=await db.storage.from('quote-drafts').download(path);if(error||!data)throw new Error('pdf_download_failed');bytes=new Uint8Array(await data.arrayBuffer());}
    else {
      bytes=await invoicePdf(invoice,origin);
      path=`billing/test/${invoice.id}.pdf`;
      const {error}=await db.storage.from('quote-drafts').upload(path,bytes,{contentType:'application/pdf',upsert:false});
      if(error && !/already exists|duplicate/i.test(error.message))throw new Error('pdf_archive_failed');
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes)))).map(x=>x.toString(16).padStart(2,'0')).join('');
      const {error:save}=await db.from('billing_dispatch').update({pdf_path:path,pdf_sha256:hash}).eq('invoice_id',invoice.id);if(save)throw save;
    }
    // External tests require a fixed, explicitly authorized recipient. Never use the client's address in sandbox.
    if(claimed.email_status!=='sent') {
      const from=process.env['RESEND_FROM_EMAIL'], to=process.env['BILLING_TEST_RECIPIENT'], key=process.env['RESEND_API_KEY'];
      if(!from||to!=='eduard.moreira@alumni.esade.edu'||!key)await db.from('billing_dispatch').update({email_status:'pending',email_error:'test_recipient_or_verified_sender_missing'}).eq('invoice_id',invoice.id);
      else {
        let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
        try {
          // Uncertain outcomes are never blindly resent outside Resend's 24h window.
          if(claimed.attempts>0 && Date.now()-Date.parse(invoice.issued_at)>=23*60*60*1000)throw new MailError('email_retry_review_required');
          const providerId=await sendResend({from,to:[to],subject:`${billingCopy.es.mailSubject} ${invoice.number}`,text:`${billingCopy.es.mailBody}\n${invoice.number} · ${invoice.total.toFixed(2)} EUR`,attachments:[{filename:`${invoice.number}.pdf`,content:btoa(binary)}]},`billing-test-${invoice.id}`);
          const {error:save}=await db.from('billing_dispatch').update({email_status:'sent',email_error:null,email_sent_at:new Date().toISOString(),provider_id:providerId}).eq('invoice_id',invoice.id);if(save)throw save;
        }catch(e){await db.from('billing_dispatch').update({email_status:'failed',email_error:e instanceof MailError?e.code:'provider_response_unknown'}).eq('invoice_id',invoice.id);}
      }
    }
    // Only a separate explicitly configured TEST data source may receive fictitious invoices.
    if(claimed.notion_status!=='sent') {
      const source=process.env['NOTION_TEST_INVOICES_DATA_SOURCE_ID'];
      if(!source)await db.from('billing_dispatch').update({notion_status:'pending',notion_error:'test_invoice_data_source_missing'}).eq('invoice_id',invoice.id);
      else {
        try {
          const { notion }=await import('./notion.server');
          const found=await notion(`/data_sources/${source}/query`,'POST',{filter:{property:'Número de factura',title:{equals:invoice.number}},page_size:1});
          const c=invoice.snapshot as unknown as {customer:{name:string;taxId:string}};
          const properties={'Número de factura':{title:[{text:{content:invoice.number}}]},'Cliente':{rich_text:[{text:{content:c.customer.name}}]},'NIF':{rich_text:[{text:{content:c.customer.taxId}}]},'Base imponible':{number:invoice.base},'IVA':{number:invoice.vat},'Total':{number:invoice.total},'Fecha de expedición':{date:{start:invoice.issued_at}},'Reserva':{rich_text:[{text:{content:invoice.order_id}}]},'Estado del correo':{rich_text:[{text:{content:claimed.email_status}}]}};
          const result=found.results[0] ? await notion(`/pages/${found.results[0].id}`,'PATCH',{properties}) : await notion('/pages','POST',{parent:{type:'data_source_id',data_source_id:source},properties});
          await db.from('billing_dispatch').update({notion_status:'sent',notion_page_id:result.id,notion_error:null}).eq('invoice_id',invoice.id);
        } catch {await db.from('billing_dispatch').update({notion_status:'failed',notion_error:'notion_sync_failed'}).eq('invoice_id',invoice.id);}
      }
    }
    await db.from('billing_audit').insert({actor:invoice.actor,action:'dispatch_test_invoice',entity_id:invoice.id});
  } finally {await db.from('billing_dispatch').update({lease_until:null,attempts:claimed.attempts+1}).eq('invoice_id',invoice.id);}
}