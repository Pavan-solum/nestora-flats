import { describe, expect, it } from "vitest";
import { dayKey, dueLeads, followUpWindow } from "./leads";
import type { Enquiry } from "./types";

const now = new Date(2026, 9, 8, 12, 0, 0);

function lead(status: Enquiry["status"], followUpAt: string | null): Enquiry {
  return {
    id: followUpAt ?? status ?? "lead",
    intent: "buy",
    name: "Ada",
    email: "ada@example.com",
    phone: "9876543210",
    message: "Visit",
    createdAt: now.toISOString(),
    status,
    followUpAt,
  };
}

describe("lead follow-up dates", () => {
  it("sorts overdue leads before leads due today", () => {
    const leads = dueLeads(
      [
        lead("visit-scheduled", new Date(2026, 9, 8, 15).toISOString()),
        lead("follow-up", new Date(2026, 9, 7, 9).toISOString()),
        lead("new", new Date(2026, 9, 7, 9).toISOString()),
      ],
      now,
    );
    expect(leads.map((item) => item.status)).toEqual(["follow-up", "visit-scheduled"]);
    expect(followUpWindow(leads[0].followUpAt, now)).toBe("overdue");
  });

  it("uses the local calendar day", () => {
    expect(dayKey(new Date(2026, 9, 8, 18).toISOString())).toBe("2026-10-08");
  });
});
