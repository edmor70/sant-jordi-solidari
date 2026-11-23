import { CAMPAIGN } from "./campaign";

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function donationAmount(roses: number) {
  return round2(roses * CAMPAIGN.donation.perRose);
}

export function roseLine(qty: number) {
  const { basePrice, vatRate } = CAMPAIGN.rose;
  const unitVat = round2(basePrice * vatRate);
  const base = round2(qty * basePrice);
  const vat = round2(base * vatRate);
  return {
    qty,
    unitBase: basePrice,
    unitGross: round2(basePrice + unitVat),
    vatRate,
    base,
    vat,
    total: round2(base + vat),
  };
}

/** Fixed transport tariff for one independently verified destination. */
export function shippingCost(inBarcelona: boolean, _km = 0) {
  const s = CAMPAIGN.shipping;
  if (inBarcelona) return s.barcelonaFlat;
  return s.outsideBase;
}

/** Returns null while the tax treatment of transport is not configured. */
export function shippingTax(amount: number) {
  const s = CAMPAIGN.shipping;
  if (!s.taxConfigured) return null;
  if (s.pricesIncludeVat) {
    const base = round2(amount / (1 + s.vatRate));
    return { base, vat: round2(amount - base), total: amount };
  }
  const vat = round2(amount * s.vatRate);
  return { base: amount, vat, total: round2(amount + vat) };
}

/** Order-level VAT: 10 % (campaign rate) on roses base + transport base. */
export function orderVat(roseBase: number, shippingBase: number) {
  const base = round2(roseBase + shippingBase);
  const vat = round2(base * CAMPAIGN.rose.vatRate);
  return { base, vat, total: round2(base + vat) };
}

export type Mode = "pickup" | "delivery";

/** shipping: one entry per destination; null = pending confirmation. */
export function buildSummary(input: { mode: Mode; roses: number; shipping: (number | null)[] }) {
  const roses = roseLine(input.roses);
  const shipping = input.mode === "pickup" ? [] : input.shipping;
  const shippingPending = shipping.some((c) => c === null);
  const shippingKnown = round2(shipping.reduce<number>((a, c) => a + (c ?? 0), 0));
  const tax = shipping.length && !shippingPending ? shippingTax(shippingKnown) : null;
  // VAT is charged once on the combined taxable base (roses + transport); the
  // transport VAT line is the residual so the parts always add up exactly.
  const orderTax = input.mode === "pickup" ? orderVat(roses.base, 0) : tax ? orderVat(roses.base, tax.base) : null;
  const shippingTaxLine = tax && orderTax ? { ...tax, vat: round2(orderTax.vat - roses.vat), total: round2(tax.base + orderTax.vat - roses.vat) } : tax;
  const grandTotal = orderTax ? orderTax.total : null;
  return { mode: input.mode, roses, shipping, shippingKnown, shippingPending, shippingTax: shippingTaxLine, orderTax, grandTotal };
}

export type Summary = ReturnType<typeof buildSummary>;
