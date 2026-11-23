import { z } from 'zod';
import { CAMPAIGN } from './campaign';
import { INTERNAL_RECIPIENT } from './notice-envelope';
import { reservationMailCopy, buyerReservationMailCopy } from './i18n/reservations';
import { paymentCopy } from './i18n/payment';
import { draftCopy } from './i18n/draft';
import { resendSender, type MailPayload } from './resend.server';
import type { Database } from '@/integrations/supabase/types';

type Reservation = Database['public']['Tables']['quote_requests']['Row'];
export function pdfAttachments(bundle: unknown, reference: string) {
  const documents = z.array(z.object({ reference: z.string(), bytes: z.array(z.number().int().min(0).max(255)).min(5) })).min(1).max(2).parse(bundle);
  for (const d of documents) {
    if (![reference, `${reference}.2`].includes(d.reference) || String.fromCharCode(...d.bytes.slice(0, 5)) !== '%PDF-') throw new Error('invalid_payment_bundle');
  }
  return documents.map(d => {
    let binary = '';
    for (let i = 0; i < d.bytes.length; i += 0x8000) binary += String.fromCharCode(...d.bytes.slice(i, i + 0x8000));
    return { filename: `${d.reference}.pdf`, content: btoa(binary) };
  });
}
export function prepareReservationMail(row: Reservation, attachments: MailPayload['attachments'] = [], buyer = false): MailPayload {
  const lang = row.lang === 'es' ? 'es' : 'ca';
  const t = reservationMailCopy[lang], c = buyerReservationMailCopy[lang];
  const b = row.breakdown as { paymentPlan?: string;summary?:import('./pricing').Summary };
  const summary=b.summary, d=draftCopy[lang];
  const money=(n:number)=>new Intl.NumberFormat(lang==='ca'?'ca-ES':'es-ES',{style:'currency',currency:'EUR'}).format(n);
  const destinations=(row.destinations ?? []) as unknown as {street:string;postalCode:string;city:string;slot?:string;cost:number|null}[];
  const addresses=destinations.map(a=>`${a.street}, ${a.postalCode} ${a.city} · ${a.slot ? d.slots[a.slot as keyof typeof d.slots] ?? a.slot : ''} · ${a.cost===null?d.pending:money(a.cost)}`).join('\n');
  const economics=summary?`\n${d.roses}: ${money(summary.roses.base)}\n${d.delivery}:\n${addresses || d.pickup}\n${d.transport}: ${money(summary.shippingKnown)}\n${d.base}: ${summary.orderTax?money(summary.orderTax.base):d.pending}\n${d.vat} (10 %): ${summary.orderTax?money(summary.orderTax.vat):d.pending}\n${d.total}: ${summary.grandTotal===null?d.pending:money(summary.grandTotal)}`:'';
  return {
    from: resendSender(), to: [buyer ? z.string().email().parse(row.email) : INTERNAL_RECIPIENT],
    reply_to: buyer ? INTERNAL_RECIPIENT : z.string().email().parse(row.email),
    subject: `${buyer ? c.subject : t.subject} · ${row.reference}`,
    text: `${buyer ? c.notice : t.notice}\n${row.reference}\n${t.company}: ${row.company}\n${t.contact}: ${row.full_name}\n${t.quantity}: ${row.total_roses}\n${t.plan}: ${b.paymentPlan === 'split' ? paymentCopy[lang].split : paymentCopy[lang].single}\n${t.notes}: ${row.notes ?? ''}${economics}`,
    ...(attachments.length ? { attachments } : {}),
  };
}
// Preparation is deliberately separate from dispatch. No buyer send path is enabled.
export function buyerConfirmationsEnabled() { return CAMPAIGN.integrations.buyerConfirmationsEnabled; }