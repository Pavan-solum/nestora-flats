import { beforeEach, describe, expect, it, vi } from "vitest";

const staffAllows = vi.fn();
const saveEnquiry = vi.fn();
const fetchEnquiries = vi.fn();

vi.mock("@/lib/supabase/admin-auth", () => ({
  staffAllows: () => staffAllows(),
}));

vi.mock("@/lib/supabase/records", () => ({
  saveEnquiry: (...args: unknown[]) => saveEnquiry(...args),
  fetchEnquiries: () => fetchEnquiries(),
  clearEnquiryRows: vi.fn(),
}));

const enquiry = {
  intent: "buy",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "9876543210",
  message: "I want to see Mars Mount.",
};

describe("enquiries API", () => {
  beforeEach(() => {
    staffAllows.mockReset();
    saveEnquiry.mockReset();
    fetchEnquiries.mockReset();
  });

  it("returns 401 when a non-staff session lists enquiries", async () => {
    staffAllows.mockResolvedValue(false);
    const { GET } = await import("./route");
    const response = await GET();
    expect(response.status).toBe(401);
    expect(fetchEnquiries).not.toHaveBeenCalled();
  });

  it("returns 400 for an incomplete enquiry", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/enquiries", {
        method: "POST",
        body: JSON.stringify({ ...enquiry, email: "bad", phone: "12" }),
      }),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.fields.email).toBe("Enter a valid email.");
    expect(saveEnquiry).not.toHaveBeenCalled();
  });

  it("saves a valid public enquiry", async () => {
    saveEnquiry.mockImplementation(async (row: { name: string }) => row);
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/enquiries", {
        method: "POST",
        body: JSON.stringify(enquiry),
      }),
    );
    expect(response.status).toBe(200);
    expect(saveEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ada Lovelace",
        email: "ada@example.com",
        intent: "buy",
      }),
    );
  });
});
