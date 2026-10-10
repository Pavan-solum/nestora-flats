import { beforeEach, describe, expect, it, vi } from "vitest";

const staffAllows = vi.fn();
const saveFlat = vi.fn();

vi.mock("@/lib/supabase/admin-auth", () => ({
  staffAllows: () => staffAllows(),
}));

vi.mock("@/lib/supabase/records", () => ({
  saveFlat: (...args: unknown[]) => saveFlat(...args),
}));

const listing = {
  title: "Mars Mount",
  price: 13500000,
  city: "Bengaluru",
  area: "JP Nagar",
  description: "Apartment",
  location: "15th Cross Road",
  amenities: [],
  nearbySchools: [],
  nearbyColleges: [],
  nearbyHospitals: [],
  nearbyTransport: [],
  images: [],
  status: "available",
  featured: true,
};

describe("POST /api/flats", () => {
  beforeEach(() => {
    staffAllows.mockReset();
    saveFlat.mockReset();
  });

  it("returns 401 when the session is not staff", async () => {
    staffAllows.mockResolvedValue(false);
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/flats", {
        method: "POST",
        body: JSON.stringify(listing),
      }),
    );
    expect(response.status).toBe(401);
    expect(saveFlat).not.toHaveBeenCalled();
  });

  it("returns 400 when required fields are missing", async () => {
    staffAllows.mockResolvedValue(true);
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/flats", {
        method: "POST",
        body: JSON.stringify({ ...listing, title: "", price: 0 }),
      }),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.fields.title).toBe("Title is required.");
    expect(saveFlat).not.toHaveBeenCalled();
  });

  it("passes a valid listing through to save", async () => {
    staffAllows.mockResolvedValue(true);
    saveFlat.mockImplementation(async (flat: { title: string }) => flat);
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/flats", {
        method: "POST",
        body: JSON.stringify(listing),
      }),
    );
    expect(response.status).toBe(200);
    expect(saveFlat).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Mars Mount",
        price: 13500000,
        city: "Bengaluru",
        area: "JP Nagar",
      }),
    );
  });
});
