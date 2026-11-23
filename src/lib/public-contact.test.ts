import { describe, expect, it } from "vitest";
import { CAMPAIGN } from "./campaign";
import { internalEnvelope } from "./notice-envelope";

describe("Public contact and existing campaign rules", () => {
  it('uses the confirmed Passatge fiscal address',()=>{
    expect(CAMPAIGN.company.address.es).toBe('Passatge Maria Llimona, 5, puerta 5, 08019 Barcelona');
  });
  it('uses the supplied IBAN',()=>expect(CAMPAIGN.payment.iban).toBe('ES61 2100 1841 0102 0059 5239'));
  it("uses the approved public email without changing internal addressing", () => {
    expect(CAMPAIGN.publicContact.email).toBe("solidaristjordi@gmail.com");
    expect(CAMPAIGN.contactEmail).toBe("solidaristjordi@gmail.com");
    expect(internalEnvelope("SJ27-CONTACT", "client@example.org").to).toBe("solidaristjordi@gmail.com");
  });
  it("uses the approved telephone", () => {
    expect(CAMPAIGN.publicContact.phone).toBe("+34 665 820 657");
    expect(CAMPAIGN.publicContact.phoneHref).toBe("+34665820657");
  });
  it("retains the current price instead of the imported price", () => {
    expect(CAMPAIGN.rose.basePrice).toBe(3);
    expect(CAMPAIGN.rose.vatRate).toBe(0.1);
  });
});