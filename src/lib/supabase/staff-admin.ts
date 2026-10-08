import { builtinDeskRoles, isStaffRole, slugRoleName, type DeskRole, type StaffRole } from "@/lib/staff-roles";
import { getSupabaseAdmin } from "./admin";

export type { StaffRole } from "@/lib/staff-roles";

export type StaffAccount = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

type ProfileRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  role: string | null;
};

function toAccount(row: ProfileRow): StaffAccount {
  return {
    id: row.user_id,
    email: row.email ?? "",
    displayName: row.display_name ?? "",
    role: row.role ?? "",
  };
}

export async function listStaff() {
  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select("user_id, email, display_name, role")
    .order("email");
  if (error) throw new Error(error.message);
  return ((data ?? []) as ProfileRow[]).map(toAccount);
}

export async function createStaff(input: {
  email: string;
  password: string;
  displayName: string;
  role: string;
}) {
  const admin = getSupabaseAdmin();
  const created = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (created.error || !created.data.user) {
    throw new Error(created.error?.message || "Could not create the staff login");
  }
  const userId = created.data.user.id;
  const profile = {
    email: input.email,
    display_name: input.displayName,
    role: input.role,
    updated_at: new Date().toISOString(),
  };
  const existing = await admin.from("profiles").select("user_id").eq("user_id", userId).maybeSingle();
  if (existing.error) {
    await admin.auth.admin.deleteUser(userId);
    throw new Error(existing.error.message);
  }
  const saved = existing.data
    ? await admin.from("profiles").update(profile).eq("user_id", userId)
    : await admin.from("profiles").insert({ user_id: userId, ...profile });
  if (saved.error) {
    await admin.auth.admin.deleteUser(userId);
    throw new Error(saved.error.message);
  }
  return { id: userId, email: input.email, displayName: input.displayName, role: input.role };
}

export async function updateStaffRole(id: string, role: string) {
  const staff = await listStaff();
  const current = staff.find((account) => account.id === id);
  if (!current) throw new Error("Staff account not found");
  const admins = staff.filter((account) => account.role === "admin");
  if (current.role === "admin" && role !== "admin" && admins.length < 2) {
    throw new Error("Keep at least one admin account.");
  }
  const { error } = await getSupabaseAdmin()
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("user_id", id);
  if (error) throw new Error(error.message);
  return { ...current, role };
}

export async function listDeskRoles() {
  const roles = new Map<string, DeskRole>(builtinDeskRoles().map((role) => [role.role, role]));
  const { data, error } = await getSupabaseAdmin().from("staff_roles").select("role, label, access");
  if (error) return [...roles.values()];
  for (const row of (data ?? []) as { role: string; label: string; access: string }[]) {
    if (!row.role || !isStaffRole(row.access)) continue;
    roles.set(row.role, { role: row.role, label: row.label || row.role, access: row.access });
  }
  return [...roles.values()];
}

export async function createDeskRole(label: string, access: StaffRole) {
  const role = slugRoleName(label);
  const cleanLabel = label.trim();
  if (!role || !cleanLabel) throw new Error("Enter a role name.");
  const existing = await listDeskRoles();
  if (existing.some((item) => item.role === role || item.label.toLowerCase() === cleanLabel.toLowerCase())) {
    throw new Error("That role already exists.");
  }
  const admin = getSupabaseAdmin();
  const added = await admin.rpc("add_app_role", { role_name: role });
  if (added.error) {
    const missing = /add_app_role|schema cache|could not find the function/i.test(added.error.message);
    throw new Error(
      missing
        ? "Run supabase/staff-roles.sql in the Supabase SQL editor, then create the role again."
        : added.error.message,
    );
  }
  const { error } = await admin.from("staff_roles").insert({ role, label: cleanLabel, access });
  if (error) throw new Error(error.message);
  return { role, label: cleanLabel, access };
}

export async function resetStaffPassword(id: string, password: string) {
  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(id, { password });
  if (error) throw new Error(error.message);
}
