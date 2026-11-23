import { describe, it, expect } from "vitest";
import { buildSummary, donationAmount, roseLine, shippingCost } from "./pricing"
import { round2 } from "./pricing";
import { CAMPAIGN } from "./campaign";

describe("pricing rules", () => {
  it("donates 0,20 € per purchased rose", () => {
    expect(donationAmount(1)).toBe(0.2);
    expect(donationAmount(50)).toBe(10);
    expect(donationAmount(150)).toBe(30);
    expect(donationAmount(10000)).toBe(2000);
  });
  it("donates the stated 12 % profit share", () => {
    expect(CAMPAIGN.donation.profitShare).toBe(0.12);
  });
  it("campaign balances fall due on 7 April 2027", () => {
    expect(CAMPAIGN.payment.balanceDeadlineISO).toBe("2027-04-07");
  });
  it("rose: 3,00 € base + 10 % VAT", () => {
    const r = roseLine(10);
    expect(r.unitBase).toBe(3);
    expect(r.unitGross).toBe(3.3);
    expect(r.base).toBe(30);
    expect(r.vat).toBe(3);
    expect(r.total).toBe(33);
  });
  it("transport inside Barcelona is 4,00 € per destination", () => {
    expect(shippingCost(true, 42)).toBe(4);
  });
  it("transport outside Barcelona is fixed at 6,00 €", () => {
    expect(shippingCost(false, 25)).toBe(6);
    expect(shippingCost(false, 12.34)).toBe(6);
  });
  it("two Barcelona premises cost 8 €", () => {
    expect(buildSummary({mode:'delivery',roses:100,shipping:[shippingCost(true),shippingCost(true)]}).shippingKnown).toBe(8);
  });
  it("one Barcelona and one outside premise cost 10 €", () => {
    expect(buildSummary({mode:'delivery',roses:150,shipping:[shippingCost(true),shippingCost(false)]}).shippingKnown).toBe(10);
  });
  it("two outside premises cost 12 €", () => {
    expect(buildSummary({mode:'delivery',roses:100,shipping:[shippingCost(false),shippingCost(false)]}).shippingKnown).toBe(12);
  });
  it("pickup has no transport and a total", () => {
    const s = buildSummary({ mode: "pickup", roses: 5, shipping: [6] });
    expect(s.shipping).toEqual([]);
    expect(s.grandTotal).toBe(16.5);
  });
  it("pending transport keeps known subtotal and never becomes 0 €", () => {
    const s = buildSummary({ mode: "delivery", roses: 5, shipping: [6, null] });
    expect(s.shippingPending).toBe(true);
    expect(s.shippingKnown).toBe(6);
    expect(s.grandTotal).toBeNull();
  });
  it("adds the agreed 10 % transport VAT to the confirmed net tariffs", () => {
    const s = buildSummary({ mode: "delivery", roses: 50, shipping: [4, 6] });
    expect(s.shippingKnown).toBe(10);
    expect(s.shippingTax).toEqual({base:10,vat:1,total:11});
    expect(s.grandTotal).toBe(176);
  });
  it("applies 10 % VAT once on roses + transport base (165 + 4 = 169 → 185,90)", () => {
    const s = buildSummary({ mode: "delivery", roses: 55, shipping: [4] });
    expect(s.orderTax).toEqual({ base: 169, vat: 16.9, total: 185.9 });
    expect(s.grandTotal).toBe(185.9);
    expect(round2(s.roses.vat + (s.shippingTax?.vat ?? 0))).toBe(16.9);
  });
  it("the reservation summary never carries bookmarks", () => {
    const s = buildSummary({ mode: "pickup", roses: 1, shipping: [] });
    expect("bookmarkEstimate" in s).toBe(false);
    expect(s.grandTotal).toBe(3.3);
  });
});
