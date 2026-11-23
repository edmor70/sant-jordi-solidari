import type { Database, Json } from '@/integrations/supabase/types';
import { CAMPAIGN } from './campaign';
import { prepareReservationMail } from './reservation-mail.server';
import { INTERNAL_RECIPIENT } from './notice-envelope';
import { reservationEventCopy } from './i18n/reservations';
import { sendResend, MailError, type MailPayload } from './resend.server';
type Row = Database['public']['Tables']['quote_requests']['Row'];
type Kind = 'updated' | 'integration_error' | 'document_error';
// Called under the reservation dispatch lease; unique rows preserve one envelope per event.
export async function sendReservationEvent(row: Row, kind: Kind) {
  if (!CAMPAIGN.integrations.reservationEmailsEnabled) return;
  const {supabaseAdmin:db} = await import('@/integrations/supabase/client.server');
  const {error:insertError} = await db.from('reservation_notices').upsert({reservation_id:row.id,revision:row.revision,kind},{onConflict:'reservation_id,revision,kind',ignoreDuplicates:true});
  if (insertError) throw insertError;
  const {data:n,error} = await db.from('reservation_notices').select('*').eq('reservation_id',row.id).eq('revision',row.revision).eq('kind',kind).single();
  if (error || !n) throw error ?? new Error('notice_missing');
  if (n.status === 'sent') return;
  try {
    if (n.prepared_at && Date.now()-Date.parse(n.prepared_at)>=23*60*60*1000) throw new MailError('email_retry_review_required');
    let payload = n.payload as unknown as MailPayload | null;
    if (!payload) {
      const copy=reservationEventCopy[row.lang==='es'?'es':'ca'];
      payload={...prepareReservationMail(row),subject:`${copy[kind]} · ${row.reference} · ${row.revision}`};
      const {error}=await db.from('reservation_notices').update({payload:payload as unknown as Json,prepared_at:new Date().toISOString()}).eq('id',n.id);if(error)throw error;
    }
    if (payload.to.length!==1 || payload.to[0]!==INTERNAL_RECIPIENT) throw new MailError('recipient_not_authorized');
    const provider=await sendResend(payload,`reservation-${row.reference}-${row.revision}-${kind}`);
    await db.from('reservation_notices').update({status:'sent',provider_id:provider,error:null}).eq('id',n.id);
  } catch(e) {
    await db.from('reservation_notices').update({status:'failed',error:e instanceof MailError?e.code:'notice_preparation_failed'}).eq('id',n.id);
  }
}