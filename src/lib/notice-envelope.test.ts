import { describe, it, expect } from "vitest";
import { buyerEnvelope, formatInvoiceNumber, internalEnvelope } from "./notice-envelope";

describe("internal notice addressing", () => {
  it("always uses solidaristjordi@gmail.com as To and the client only as Reply-To", () => {
    const mail = internalEnvelope("SJ27-TESTES", "contact@example.com");
    expect(mail.to).toBe("solidaristjordi@gmail.com");
    expect(mail.replyTo).toBe("contact@example.com");
    expect(mail.subject).toBe("Nueva reserva Sant Jordi 2027 · Factura SJ27-TESTES");
  });
  it("retries keep the same reference-based provider deduplication key", () => {
    expect(internalEnvelope("SJ27-TESTES", "contact@example.com").idempotencyKey).toBe("internal-quote-SJ27-TESTES");
    expect(internalEnvelope("SJ27-TESTES", "contact@example.com")).toEqual(internalEnvelope("SJ27-TESTES", "contact@example.com"));
  });
  it("rejects invalid Reply-To addresses", () => {
    expect(() => internalEnvelope("SJ27-TESTES", "bad\r\nBcc: other@example.com")).toThrow();
  });
  it("numbers invoices with four digits starting at 0001", () => {
    expect(formatInvoiceNumber(1)).toBe("0001");
    expect(formatInvoiceNumber(42)).toBe("0042");
  });
  it("sends the invoice to the buyer with the team as Reply-To", () => {
    const mail = buyerEnvelope("0001", "buyer@example.com", "ca");
    expect(mail.to).toBe("buyer@example.com");
    expect(mail.replyTo).toBe("solidaristjordi@gmail.com");
    expect(mail.idempotencyKey).toBe("buyer-invoice-0001");
  });
});
