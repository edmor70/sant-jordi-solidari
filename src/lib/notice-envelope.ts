import { z } from "zod";

export const INTERNAL_RECIPIENT = "solidaristjordi@gmail.com";
export const formatInvoiceNumber = (n: number) => String(n).padStart(4, "0");

export function internalEnvelope(invoice: string, clientEmail: string) {
  return {
    to: INTERNAL_RECIPIENT,
    replyTo: z.string().email().parse(clientEmail),
    subject: `Nueva reserva Sant Jordi 2027 · Factura ${invoice}`,
    idempotencyKey: `internal-quote-${invoice}`,
  };
}

export function buyerEnvelope(invoice: string, clientEmail: string, lang: string) {
  return {
    to: z.string().email().parse(clientEmail),
    replyTo: INTERNAL_RECIPIENT,
    subject: lang === "es" ? `Tu reserva Sant Jordi 2027 · Factura ${invoice}` : `La teva reserva Sant Jordi 2027 · Factura ${invoice}`,
    idempotencyKey: `buyer-invoice-${invoice}`,
  };
}
