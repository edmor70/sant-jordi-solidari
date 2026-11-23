import { describe, expect, it } from "vitest";
import { submitSchema } from "./quote-schema";

const contact = { fullName: "Nom Cognom", email: "prova@example.com", phone: "600000000", company: "Empresa Prova SL" };
const base = {
  idempotencyKey: crypto.randomUUID(),
  lang: "ca",
  mode: "pickup",
  pickupRoses: 50,
  destinations: [],
  shownShipping: [],
  acceptChanges: false,
  website: "",
};

describe("submitSchema (campaña solo empresas)", () => {
  it('stores either one payment or two payments and rejects other options',()=>{
    for(const paymentPlan of ['single','split']){const r=submitSchema.safeParse({...base,contact,paymentPlan});expect(r.success).toBe(true);if(r.success)expect(r.data.paymentPlan).toBe(paymentPlan);}
    expect(submitSchema.safeParse({...base,contact,paymentPlan:'three'}).success).toBe(false);
  });
  it('rejects pickup quantities below 50 and accepts exactly 50', () => {
    expect(submitSchema.safeParse({...base,contact,pickupRoses:49}).success).toBe(false);
    expect(submitSchema.safeParse({...base,contact,pickupRoses:50}).success).toBe(true);
  });
  it('rejects delivery quantities below 50 in every destination', () => {
    const d={street:'Carrer Mallorca 1',postalCode:'08001',city:'Barcelona',roses:50,slot:'2027-04-22-am'};
    expect(submitSchema.safeParse({...base,contact,mode:'delivery',destinations:[d,{...d,roses:49}]}).success).toBe(false);
    expect(submitSchema.safeParse({...base,contact,mode:'delivery',destinations:[d,{...d,roses:50}]}).success).toBe(true);
  });
  it("exige la razón social de la empresa", () => {
    const r = submitSchema.safeParse({ ...base, contact: { ...contact, company: "" } });
    expect(r.success).toBe(false);
  });

  it("acepta el contacto sin tipo de comprador ni casilla de factura", () => {
    const r = submitSchema.safeParse({ ...base, contact });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.contact.company).toBe("Empresa Prova SL");
      expect("buyerType" in r.data.contact).toBe(false);
      expect("needsInvoice" in r.data.contact).toBe(false);
    }
  });

  it("exige una de las tres franjas de reparto por destino", () => {
    const dest = { street: "Carrer de Mallorca 401", postalCode: "08013", city: "Barcelona", roses: 50, notes: "", slot: "2027-04-22-am" };
    const ok = submitSchema.safeParse({ ...base, mode: "delivery", pickupRoses: 0, destinations: [dest], shownShipping: [6], contact });
    expect(ok.success).toBe(true);
    const bad = submitSchema.safeParse({ ...base, mode: "delivery", pickupRoses: 0, destinations: [{ ...dest, slot: "2027-04-23-am" }], shownShipping: [6], contact });
    expect(bad.success).toBe(false);
  });

  it("ignora los puntos de libro: los vende la Fundación, no se piden en la reserva", () => {
    const r = submitSchema.safeParse({ ...base, contact, bookmarks: 5 });
    expect(r.success).toBe(true);
    if (r.success) expect("bookmarks" in r.data).toBe(false);
  });
});
