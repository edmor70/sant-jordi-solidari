import { describe, expect, it } from "vitest";
import { CAMPAIGN } from "./campaign";

describe("reservation integration activation", () => {
  it("enables authorized internal notices", () => {
    expect(CAMPAIGN.integrations.reservationEmailsEnabled).toBe(true);
  });
  it("keeps buyer confirmations disabled", () => {
    expect(CAMPAIGN.integrations.buyerConfirmationsEnabled).toBe(false);
  });
  it("enables requested automatic Notion synchronization", () => {
    expect(CAMPAIGN.integrations.notionAutomationEnabled).toBe(true);
  });
});