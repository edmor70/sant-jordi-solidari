import { z } from 'zod';
import { round2 } from './pricing';

export const billingCustomerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  taxId: z.string().trim().min(5).max(30),
  address: z.string().trim().min(8).max(300),
  email: z.string().trim().email().max(200),
});
export const billingLineSchema = z.object({
  description: z.string().trim().min(2).max(200),
  quantity: z.number().int().min(1).max(100000),
  unitBase: z.number().min(0).max(100000),
  vatRate: z.number().min(0).max(1),
  discountPct: z.number().min(0).max(100).default(0),
});
export type BillingLine = z.infer<typeof billingLineSchema>;
export function invoiceAmounts(lines: BillingLine[]) {
  const detail = lines.map(line => {
    const base = round2(line.quantity * line.unitBase * (1 - line.discountPct / 100));
    return { ...line, base, vat: round2(base * line.vatRate) };
  });
  const base = round2(detail.reduce((sum, line) => sum + line.base, 0));
  const vat = round2(detail.reduce((sum, line) => sum + line.vat, 0));
  return { lines: detail, base, vat, total: round2(base + vat) };
}
export function invoiceObligation(kind: string) {
  return ['advance', 'delivery', 'refund'].includes(kind);
}
export function fiscalNumber(series: 'F' | 'R', year: number, sequence: number, test = true) {
  return `${test ? 'TEST-' : ''}${series}-${year}-${String(sequence).padStart(4, '0')}`;
}