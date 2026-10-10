import { beforeEach, describe, expect, it, vi } from "vitest";

const getSupabaseServer = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServer: () => getSupabaseServer(),
}));

function staffClient() {
  return {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    rpc: vi.fn(),
  };
}

describe("POST /api/admin/login", () => {
  beforeEach(() => {
    getSupabaseServer.mockReset();
  });

  it("returns 400 when email or password is missing", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email: "  ", password: "" }),
      }),
    );
    expect(response.status).toBe(400);
    expect(getSupabaseServer).not.toHaveBeenCalled();
  });

  it("returns 401 for a rejected password", async () => {
    const supabase = staffClient();
    supabase.auth.signInWithPassword.mockResolvedValue({ error: { message: "Invalid" } });
    getSupabaseServer.mockResolvedValue(supabase);
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email: "ada@example.com", password: "secret" }),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("signs out and returns 403 when the user is not staff", async () => {
    const supabase = staffClient();
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    supabase.rpc.mockResolvedValue({ data: false, error: null });
    getSupabaseServer.mockResolvedValue(supabase);
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email: "ada@example.com", password: "secret" }),
      }),
    );
    expect(response.status).toBe(403);
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it("returns ok when is_staff passes", async () => {
    const supabase = staffClient();
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    supabase.rpc.mockResolvedValue({ data: true, error: null });
    getSupabaseServer.mockResolvedValue(supabase);
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email: "ada@example.com", password: "secret" }),
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(supabase.rpc).toHaveBeenCalledWith("is_staff");
  });
});
