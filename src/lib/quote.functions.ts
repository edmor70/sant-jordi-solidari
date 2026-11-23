import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestUrl } from "@tanstack/react-start/server";
import { addressSchema, submitSchema } from "./quote-schema";
import { buildSummary, type Summary } from "./pricing";
import { submissionIdentity } from "./reservations";

export const quoteDestination = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => addressSchema.parse(d))
  .handler(async ({ data }) => {
    const { quoteAddress } = await import("./shipping.server");
    return quoteAddress(data);
  });

type SubmitResult =
  | { status: "sent"; reference: string; summary: Summary }
  | { status: "email_failed"; reference: string }
  | { status: "changed"; shipping: (number | null)[]; summary: Summary }
  | { status: "rate_limited" }
  | { status: "invalid" };

async function sha256(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}

export const submitQuote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => submitSchema.parse(d))
  .handler(async ({ data }): Promise<SubmitResult> => {
    if (data.website) return { status: "invalid" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { quoteAddress } = await import("./shipping.server");

    const submissionHash = await sha256(submissionIdentity(data));
    // Retry with the same key → reuse the stored request (no duplicates).
    const { data: existing } = await supabaseAdmin.from("quote_requests").select("*").eq("idempotency_key", data.idempotencyKey).maybeSingle();

    if (existing && existing.submission_hash !== submissionHash) throw new Error("idempotency_conflict");
    let row = existing;
    if (!row) {
      const ip = getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for")?.split(",")[0] || "unknown";
      const ipHash = await sha256(`${ip}|sjs-2027`);
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin.from("quote_requests").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
      if ((count ?? 0) >= 5) return { status: "rate_limited" };

      const destinations = data.mode === "delivery" ? data.destinations : [];
      const shipping: (number | null)[] = [];
      for (const d of destinations) {
        const r = await quoteAddress(d);
        shipping.push(r.status === "ok" ? r.cost : null);
      }
      const totalRoses = data.mode === "pickup" ? data.pickupRoses : destinations.reduce((a, d) => a + d.roses, 0);
      const summary = buildSummary({ mode: data.mode, roses: totalRoses, shipping });

      const changed = data.mode === "delivery" && (shipping.length !== data.shownShipping.length || shipping.some((c, i) => c !== data.shownShipping[i]));
      if (changed && !data.acceptChanges) return { status: "changed", shipping, summary };

      const pending: string[] = [];
      shipping.forEach((c, i) => c === null && pending.push(`Transport destí ${i + 1}`));
      if (!summary.shippingTax && data.mode === "delivery" && !summary.shippingPending) pending.push("Tractament fiscal del transport");

      const c = data.contact;
      const { data: inserted, error } = await supabaseAdmin
        .rpc("reservation_save", { p_key: data.idempotencyKey, p_hash: submissionHash, p_row: {
          lang: data.lang,
          mode: data.mode,
          full_name: c.fullName,
          email: c.email,
          phone: c.phone || null,
          buyer_type: "company", // campaign is B2B only; kept for older rows
          company: c.company,
          billing_tax_id: c.taxId || null,
          billing_address: c.fiscalAddress || null,
          billing_email: c.billingEmail || null,
          needs_invoice: true, // every order is invoiced
          notes: c.notes || null,
          destinations: destinations.map((d, i) => ({ ...d, cost: shipping[i] })),
          total_roses: totalRoses,
          breakdown: { summary, pending, paymentPlan: data.paymentPlan } as never,
          needs_review: pending.some((p) => p.startsWith("Transport destí")),
          ip_hash: ipHash,
        }});
      if (error?.message.includes("rate_limited")) return { status: "rate_limited" };
      if (error || !inserted?.id) {
        console.error("quote insert failed", error?.code);
        throw new Error("store_failed");
      }
      row = inserted;
    }

    const b = row.breakdown as unknown as { summary: Summary; pending: string[] };
    if(b.summary.grandTotal!==null){
      try{const {reservationDocuments}=await import('./reservation-documents.server');await reservationDocuments(row,getRequestUrl().origin);}
      catch{await supabaseAdmin.from('quote_requests').update({email_status:'failed',email_error:'pdf_preparation_failed'}).eq('id',row.id);return {status:'email_failed',reference:row.reference};}
    }
    // Saving never issues a fiscal invoice. Integration failures cannot undo a stored reservation.
    const { dispatchReservation } = await import("./reservation-dispatch.server");
    await dispatchReservation(row.id).catch(() => console.error("reservation dispatch pending"));
    return { status: "sent", reference: row.reference, summary: b.summary };
  });
