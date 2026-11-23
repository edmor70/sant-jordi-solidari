import { describe, expect, it } from "vitest";
import { notionProperties } from "./notion-sync";
import { buildSummary } from './pricing';
const row = { reference: "SJ27-RESERVA", invoice_number: 1, created_at: "2026-11-17T10:00:00Z", full_name: "Ana", company: "ACME", email: "a@b.es", phone: null, rose_type: "natural_red", total_roses: 50, mode: "delivery", destinations: [{ street: "C/ Mallorca 1", postalCode: "08001", city: "Barcelona", roses: 50, slot: "2027-04-22-am" }], notes: null, reservation_status: "pending", pdf_status: "generated", buyer_email_status: "sent", email_status: "failed" };
describe("notion mapping", () => {
  it("uses the unique reservation reference rather than the legacy invoice counter", () => {
    expect(notionProperties(row)["Identificador de reserva"].rich_text[0]?.text.content).toBe("SJ27-RESERVA");
    expect(notionProperties(row)["Estado del correo al cliente"].select.name).toBe("Enviado");
  });
  it("maps the 22 April morning slot to 9–14h", () => {
    expect(notionProperties(row)["Fecha y hora de entrega"].date).toEqual({ start: "2027-04-22T09:00:00+02:00", end: "2027-04-22T14:00:00+02:00" });
  });
  it('preserves economic and fiscal data in existing comments without schema changes',()=>{
    const p=notionProperties({...row,billing_tax_id:'TEST-NIF',breakdown:{paymentPlan:'split',summary:buildSummary({mode:'delivery',roses:50,shipping:[4]})}});
    expect(p.Comentarios.rich_text[0]?.text.content).toContain('Transporte base: 4; IVA transporte: 0.4; Total: 169.4');
    expect(p.Comentarios.rich_text[0]?.text.content).toContain('NIF: TEST-NIF');
  });
});
