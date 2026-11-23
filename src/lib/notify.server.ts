// Server-only: internal notice e-mail to the team.
// Sends through the Resend connector; needs RESEND_API_KEY (connector) and RESEND_FROM_EMAIL (verified domain).
import type { Summary } from "./pricing";
import { buyerEnvelope, internalEnvelope, INTERNAL_RECIPIENT } from "./notice-envelope";
import { CAMPAIGN } from "./campaign";
import { round2 } from "./pricing";
export { INTERNAL_RECIPIENT } from "./notice-envelope";

export type NoticeData = {
  reference: string;
  lang: string;
  createdAt: string;
  contact: { fullName: string; email: string; phone: string; company: string; notes: string };
  mode: "pickup" | "delivery";
  destinations: { street: string; postalCode: string; city: string; roses: number; notes: string; cost: number | null; slot?: string }[];
  totalRoses: number;
  summary: Summary;
  pending: string[];
};

const SLOT_CA: Record<string, string> = {
  "2027-04-21-pm": "Dimecres 21/04/2027 tarda (14:00-21:00)",
  "2027-04-22-am": "Dijous 22/04/2027 matí (09:00-14:00)",
  "2027-04-22-pm": "Dijous 22/04/2027 tarda (14:00-21:00)",
};

const eur = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;

export function buildInternalNoticeText(d: NoticeData) {
  const s = d.summary;
  const lines = [
    `Nova reserva · factura ${d.reference}`,
    `Idioma: ${d.lang.toUpperCase()} · Data: ${d.createdAt}`,
    ``,
    `Empresa: ${d.contact.company || "no indicada (sol·licitud anterior)"}`,
    `Persona de contacte: ${d.contact.fullName} <${d.contact.email}>`,
    `Telèfon: ${d.contact.phone || "-"}`,
    `Facturació: totes les comandes es facturen. Dades fiscals (NIF, domicili fiscal, correu de facturació): pendents de demanar amb el pressupost definitiu.`,
    ``,
    `Modalitat: ${d.mode === "pickup" ? "Recollida" : "Entrega"}`,
    ...d.destinations.map((x, i) => `  ${i + 1}. ${x.street}, ${x.postalCode} ${x.city} — ${x.roses} roses — franja ${x.slot ? (SLOT_CA[x.slot] ?? x.slot) : "no indicada"} — transport ${x.cost === null ? "PENDENT" : eur(x.cost)}${x.notes ? ` — ${x.notes}` : ""}`),
    `Total roses: ${d.totalRoses}`,
    ``,
    `Roses: ${s.roses.qty} × ${eur(s.roses.unitBase)} = ${eur(s.roses.base)} + IVA ${eur(s.roses.vat)} = ${eur(s.roses.total)}`,
    d.mode === "delivery" ? `Transport conegut: ${eur(s.shippingKnown)}${s.shippingPending ? " (+ destins pendents)" : ""}` : `Transport: 0 € (recollida)`,
    s.grandTotal !== null ? `Total estimat: ${eur(s.grandTotal)}` : `Total: pendent de confirmar`,
    ``,
    `Pendents: ${d.pending.length ? d.pending.join("; ") : "cap"}`,
    `Observacions: ${d.contact.notes || "-"}`,
  ];
  return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
}

function toBase64(bytes: Uint8Array) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function buildBuyerEmailHtml(d: NoticeData) {
  const es = d.lang === "es";
  const s = d.summary;
  const deposit = s.grandTotal !== null ? round2(s.grandTotal * CAMPAIGN.payment.depositPct) : null;
  const p = (t: string) => `<p style="margin:0 0 14px">${t}</p>`;
  return `<div style="font-family:Arial,sans-serif;color:#242522;font-size:15px;line-height:1.5;max-width:560px">
${p(es ? `Hola ${esc(d.contact.fullName)},` : `Hola ${esc(d.contact.fullName)},`)}
${p(es ? `Gracias por tu reserva de <strong>${d.totalRoses} rosas</strong> para Sant Jordi 2027. Te adjuntamos la factura <strong>${d.reference}</strong>.` : `Gràcies per la teva reserva de <strong>${d.totalRoses} roses</strong> per a Sant Jordi 2027. T'adjuntem la factura <strong>${d.reference}</strong>.`)}
${deposit !== null ? p(es ? `Para confirmar la reserva, haz una transferencia del 50 %: <strong>${eur(deposit)}</strong> (total ${eur(s.grandTotal!)}).` : `Per confirmar la reserva, fes una transferència del 50 %: <strong>${eur(deposit)}</strong> (total ${eur(s.grandTotal!)}).`) : p(es ? `Algún importe está pendiente de confirmar; te escribiremos con el importe definitivo antes de pedirte la transferencia.` : `Algun import està pendent de confirmar; t'escriurem amb l'import definitiu abans de demanar-te la transferència.`)}
${p(es ? `<strong>Concepto de la transferencia: ${d.reference}</strong>. Indícalo exactamente así para que podamos identificar tu pago.` : `<strong>Concepte de la transferència: ${d.reference}</strong>. Indica'l exactament així perquè puguem identificar el pagament.`)}
${p(es ? `Si tienes cualquier duda, responde a este correo y te contestaremos desde ${INTERNAL_RECIPIENT}.` : `Si tens qualsevol dubte, respon aquest correu i et contestarem des de ${INTERNAL_RECIPIENT}.`)}
${p(`${CAMPAIGN.company.name} · NIF ${CAMPAIGN.company.nif}`)}
</div>`;
}

type Sent = { sent: true } | { sent: false; reason: string };

async function resendSend(body: Record<string, unknown>, idempotencyKey: string): Promise<Sent> {
  const lovable = process.env["LOVABLE_API_KEY"];
  const key = process.env["RESEND_API_KEY"];
  const from = process.env["RESEND_FROM_EMAIL"];
  if (!lovable || !key || !from) return { sent: false, reason: "email_not_configured" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": key, "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ from, ...body }),
  });
  if (!res.ok) {
    console.error(`resend failed [${res.status}]: ${(await res.text()).slice(0, 300)}`);
    return { sent: false, reason: `resend_${res.status}` };
  }
  return { sent: true };
}

/** Generates the invoice PDF, stores it privately and sends it to the buyer (and a copy notice to the team). */
export async function sendReservationEmails(d: NoticeData, origin: string, already: { buyer: boolean; internal: boolean }): Promise<{ buyer: Sent; internal: Sent }> {
   // Historical invoice-mail path must not bypass the buyer authorization gate.
   if (!CAMPAIGN.integrations.buyerConfirmationsEnabled) {
     const blocked = { sent: false as const, reason: 'buyer_confirmations_disabled' };
     return { buyer: blocked, internal: blocked };
   }
  let pdf: Uint8Array;
  try {
    const { generateDraft, loadDraftAssets } = await import("./draft.server");
    pdf = await generateDraft(d, await loadDraftAssets(origin));
  } catch { const f = { sent: false as const, reason: "pdf_generation_failed" }; return { buyer: f, internal: f }; }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const filename = `${d.reference}.pdf`;
  const { error } = await supabaseAdmin.storage.from("quote-drafts").upload(`factures/${filename}`, pdf, { contentType: "application/pdf", upsert: true });
  if (error) console.error("invoice storage failed");
  const attachments = [{ filename, content: toBase64(pdf) }];

  const b = buyerEnvelope(d.reference, d.contact.email, d.lang);
  const buyer: Sent = already.buyer ? { sent: true } : await resendSend({ to: [b.to], reply_to: b.replyTo, subject: b.subject, html: buildBuyerEmailHtml(d), attachments }, b.idempotencyKey);
  const i = internalEnvelope(d.reference, d.contact.email);
  const internal: Sent = already.internal ? { sent: true } : await resendSend({ to: [i.to], reply_to: i.replyTo, subject: i.subject, text: buildInternalNoticeText(d), attachments }, i.idempotencyKey);
  return { buyer, internal };
}
