import { beforeEach, describe, expect, it, vi } from "vitest";

const staffAllows = vi.fn();
const saveFlat = vi.fn();

vi.mock("@/lib/supabase/admin-auth", () => ({
  staffAllows: () => staffAllows(),
}));

vi.mock("@/lib/supabase/records", () => ({
  saveFlat: (...args: unknown[]) => saveFlat(...args),
  removeFlat: vi.fn(),
}));

describe("PATCH /api/flats/[id]", () => {
  beforeEach(() => {
    staffAllows.mockReset();
    saveFlat.mockReset();
  });

  it("returns 401 for a non-staff session", async () => {
    staffAllows.mockResolvedValue(false);
    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/flats/flat-1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Mars Mount", price: 1, city: "Bengaluru", area: "JP Nagar" }),
      }),
      { params: Promise.resolve({ id: "flat-1" }) },
    );
    expect(response.status).toBe(401);
  });

  it("returns 400 for an invalid edit and saves a valid one", async () => {
    staffAllows.mockResolvedValue(true);
    saveFlat.mockImplementation(async (flat: { id: string }) => flat);
    const { PATCH } = await import("./route");
    const invalid = await PATCH(
      new Request("http://localhost/api/flats/flat-1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Mars Mount", price: -5, city: "Bengaluru", area: "JP Nagar" }),
      }),
      { params: Promise.resolve({ id: "flat-1" }) },
    );
    expect(invalid.status).toBe(400);

    const valid = await PATCH(
      new Request("http://localhost/api/flats/flat-1", {
        method: "PATCH",
        body: JSON.stringify({
          title: "Mars Mount",
          price: 13500000,
          city: "Bengaluru",
          area: "JP Nagar",
        }),
      }),
      { params: Promise.resolve({ id: "flat-1" }) },
    );
    expect(valid.status).toBe(200);
    expect(saveFlat).toHaveBeenCalledWith(expect.objectContaining({ id: "flat-1", title: "Mars Mount" }));
  });
});
