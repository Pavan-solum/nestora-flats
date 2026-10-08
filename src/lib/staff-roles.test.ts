import { describe, expect, it } from "vitest";
import { ROLE_LABELS, STAFF_ROLES, roleCan, slugRoleName } from "./staff-roles";

describe("staff roles", () => {
  it("turns a role label into a slug", () => {
    expect(slugRoleName("Finance manager")).toBe("finance-manager");
  });

  it("offers the five desk roles", () => {
    expect(STAFF_ROLES).toEqual([
      "admin",
      "agent",
      "staff",
      "lead-manager",
      "social-media-manager",
    ]);
    expect(ROLE_LABELS["social-media-manager"]).toBe("Social media manager");
  });

  it("lets only an admin manage staff, reset, or clear every enquiry", () => {
    for (const action of ["manageStaff", "resetInventory", "clearEnquiries"] as const) {
      expect(roleCan("admin", action)).toBe(true);
      expect(roleCan("agent", action)).toBe(false);
      expect(roleCan("staff", action)).toBe(false);
    }
  });

  it("limits listing edits, deletes, and lead follow-up", () => {
    expect(roleCan("social-media-manager", "writeFlat")).toBe(true);
    expect(roleCan("social-media-manager", "deleteFlat")).toBe(false);
    expect(roleCan("social-media-manager", "readEnquiries")).toBe(false);
    expect(roleCan("lead-manager", "writeFlat")).toBe(false);
    expect(roleCan("lead-manager", "writeEnquiry")).toBe(true);
    expect(roleCan("staff", "readEnquiries")).toBe(true);
    expect(roleCan("staff", "writeEnquiry")).toBe(false);
    expect(roleCan("agent", "deleteFlat")).toBe(true);
    expect(roleCan("social-media-manager", "publishSocial")).toBe(true);
    expect(roleCan("agent", "publishSocial")).toBe(false);
    expect(roleCan("admin", "deleteSocialHistory")).toBe(true);
    expect(roleCan("social-media-manager", "deleteSocialHistory")).toBe(false);
    expect(roleCan(null, "writeFlat")).toBe(false);
  });
});
