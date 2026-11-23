// Pure mapping from a quote_requests row to Notion properties (no secrets here).

export const NOTION_DB_TITLE = "Reservas Sant Jordi 2027";
export const NOTION_DATA_SOURCE_ID = "41b2b86b-e8a4-81d1-9a37-000b9223c4b6";
// Database values → the Spanish option names that exist in the Notion database.
export const SELECT_LABELS: Record<string, Record<string, string>> = {
  rose: { natural_red: "Rosa roja natural", red_natural: "Rosa roja natural" },
  reservation: { pending: "Pendiente", confirmed: "Confirmada", paid: "Pagada", cancelled: "Cancelada", delivered: "Entregada" },
  pdf: { pending: "Pendiente", generated: "Generado", failed: "Fallido" },
  email: { pending: "Pendiente", sent: "Enviado", failed: "Fallido" },
};
const label = (group: string, v: string) => ({ select: { name: SELECT_LABELS[group]?.[v] ?? "Pendiente" } });
const SLOT_TIMES: Record<string, [string, string]> = {
  "2027-04-21-pm": ["2027-04-21T14:00:00+02:00", "2027-04-21T21:00:00+02:00"],
  "2027-04-22-am": ["2027-04-22T09:00:00+02:00", "2027-04-22T14:00:00+02:00"],
  "2027-04-22-pm": ["2027-04-22T14:00:00+02:00", "2027-04-22T21:00:00+02:00"],
};
const sel = (o: string[]) => ({ select: { options: o.map((name) => ({ name })) } });
const status = ["pending", "sent", "failed"];

export const NOTION_SCHEMA = {
  Reserva: { title: {} },
  "Identificador de reserva": { rich_text: {} },
  "Fecha de creación": { date: {} },
  "Cliente o empresa": { rich_text: {} },
  Email: { email: {} },
  "Teléfono": { phone_number: {} },
  "Tipo de rosa": sel(["red_natural"]),
  Cantidad: { number: { format: "number" } },
  "Dirección de entrega": { rich_text: {} },
  "Fecha y hora de entrega": { date: {} },
  Comentarios: { rich_text: {} },
  "Estado de reserva": sel(["pending", "confirmed", "paid", "cancelled", "delivered"]),
  "Estado del PDF": sel(["pending", "generated", "failed"]),
  "Estado del correo al cliente": sel(status),
  "Estado del correo al equipo": sel(status),
  "Documento PDF": { files: {} },
} as const;

type Dest = { street: string; postalCode: string; city: string; roses: number; cost?:number|null; slot?: string; notes?: string };
export type ReservationRow = {
  reference: string; notion_page_id?: string | null; invoice_number: number | null; created_at: string; full_name: string; company: string | null;
  email: string; phone: string | null; rose_type: string; total_roses: number; mode: string;
  destinations: unknown; notes: string | null; reservation_status: string; pdf_status: string;
  buyer_email_status: string; email_status: string;
  billing_tax_id?:string|null; billing_address?:string|null; billing_email?:string|null; breakdown?:unknown;
};
const txt = (s: string) => ({ rich_text: s ? [{ text: { content: s.slice(0, 2000) } }] : [] });

export function notionProperties(r: ReservationRow) {
  const id = r.reference;
  const dests = (Array.isArray(r.destinations) ? r.destinations : []) as Dest[];
  const address = r.mode === "pickup" ? "Recogida" : dests.map((d) => `${d.street}, ${d.postalCode} ${d.city} (${d.roses})${d.cost!==undefined?` · Transporte base: ${d.cost??'revisión'} €`:''}${d.slot ? ` · ${d.slot}` : ""}${d.notes ? ` · ${d.notes}` : ""}`).join("\n");
  const b=r.breakdown as {summary?:import('./pricing').Summary;paymentPlan?:string}|undefined;
  const s=b?.summary;
  const detail=[r.notes??'',r.billing_tax_id?`NIF: ${r.billing_tax_id}`:'',r.billing_address?`Domicilio fiscal: ${r.billing_address}`:'',r.billing_email?`Email facturación: ${r.billing_email}`:'',b?.paymentPlan?`Pago: ${b.paymentPlan}`:'',s?`Rosas base: ${s.roses.base}; IVA rosas: ${s.roses.vat}; Transporte base: ${s.shippingKnown}; IVA transporte: ${s.shippingTax?.vat??'revisión'}; Total: ${s.grandTotal??'revisión'}`:''].filter(Boolean).join('\n');
  const slots = dests.map((d) => d.slot && SLOT_TIMES[d.slot]).filter(Boolean) as [string, string][];
  const first = slots.sort((a, b) => a[0].localeCompare(b[0]))[0];
  return {
    Reserva: { title: [{ text: { content: `${id} · ${r.company ?? r.full_name}` } }] },
    "Identificador de reserva": txt(id),
    "Fecha de creación": { date: { start: r.created_at } },
    "Cliente o empresa": txt(r.company ? `${r.company} (${r.full_name})` : r.full_name),
    Email: { email: r.email },
    "Teléfono": { phone_number: r.phone || null },
    "Tipo de rosa": label("rose", r.rose_type),
    Cantidad: { number: r.total_roses },
    "Dirección de entrega": txt(address),
    "Fecha y hora de entrega": { date: first ? { start: first[0], end: first[1] } : null },
    Comentarios: txt(detail),
    "Estado de reserva": label("reservation", r.reservation_status),
    "Estado del PDF": label("pdf", r.pdf_status),
    "Estado del correo al cliente": label("email", r.buyer_email_status),
    "Estado del correo al equipo": label("email", r.email_status),
  };
}
