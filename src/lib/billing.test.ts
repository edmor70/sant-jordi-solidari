import { describe, it, expect } from 'vitest';
import { fiscalNumber, invoiceAmounts, invoiceObligation } from './billing';
describe('billing rules', () => {
  it('does not invoice pending reservations', () => expect(invoiceObligation('pending')).toBe(false));
  it('does not invoice confirmation alone', () => expect(invoiceObligation('confirmation')).toBe(false));
  it('invoices advances', () => expect(invoiceObligation('advance')).toBe(true));
  it('invoices deliveries', () => expect(invoiceObligation('delivery')).toBe(true));
  it('requires rectification for refunded invoiced payments', () => expect(invoiceObligation('refund')).toBe(true));
  it('separates test and real invoice numbering', () => {
    expect(fiscalNumber('F', 2027, 1, false)).toBe('F-2027-0001');
    expect(fiscalNumber('F', 2027, 1)).toBe('TEST-F-2027-0001');
  });
  it('uses a separate rectification series', () => expect(fiscalNumber('R', 2027, 2, false)).toBe('R-2027-0002'));
  it('calculates 50 roses at the existing 3 euros plus 10 percent VAT', () => {
    expect(invoiceAmounts([{description:'Roses',quantity:50,unitBase:3,vatRate:.1,discountPct:0}])).toMatchObject({base:150,vat:15,total:165});
  });
  it('reduces the taxable base for actual commercial discounts', () => {
    expect(invoiceAmounts([{description:'Roses',quantity:50,unitBase:3,vatRate:.1,discountPct:10}])).toMatchObject({base:135,vat:13.5,total:148.5});
  });
  it('does not subtract the solidarity contribution from taxable sales', () => {
    expect(invoiceAmounts([{description:'Roses',quantity:1,unitBase:3,vatRate:.1,discountPct:0}]).base).toBe(3);
  });
});