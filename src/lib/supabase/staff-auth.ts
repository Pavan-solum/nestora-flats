type StaffAuth = {
  getUser: () => Promise<{ data: { user: { id: string } | null } }>;
  signInWithPassword: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<unknown>;
};

type StaffClient = {
  auth: StaffAuth;
  rpc: (fn: "is_staff") => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

async function readStaffFlag(supabase: Pick<StaffClient, "rpc">) {
  const { data, error } = await supabase.rpc("is_staff");
  return !error && data === true;
}

export async function userIsStaff(supabase: StaffClient) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  return readStaffFlag(supabase);
}

export async function signInStaff(supabase: StaffClient, email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false as const, status: 401, error: "Invalid credentials" };
  }
  if (!(await readStaffFlag(supabase))) {
    await supabase.auth.signOut();
    return {
      ok: false as const,
      status: 403,
      error: "This account is not a Nestora staff login.",
    };
  }
  return { ok: true as const };
}
