import { isStaffRole, roleCan, type StaffAction, type StaffRole } from "@/lib/staff-roles";
import { getSupabaseAdmin } from "./admin";
import { getSupabaseServer } from "./server";
import { userIsStaff } from "./staff-auth";

export async function isAdminRequest() {
  try {
    return await userIsStaff(await getSupabaseServer());
  } catch {
    return false;
  }
}

export async function requestStaffRole(): Promise<StaffRole | null> {
  try {
    const supabase = await getSupabaseServer();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const { data: flag, error } = await supabase.rpc("is_staff");
    if (error || flag !== true) return null;
    const profile = await getSupabaseAdmin()
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (profile.error || !profile.data?.role) return null;
    if (isStaffRole(profile.data.role)) return profile.data.role;
    const extra = await getSupabaseAdmin()
      .from("staff_roles")
      .select("access")
      .eq("role", profile.data.role)
      .maybeSingle();
    if (extra.error || !isStaffRole(extra.data?.access)) return null;
    return extra.data.access;
  } catch {
    return null;
  }
}

export async function staffAllows(action: StaffAction) {
  const role = await requestStaffRole();
  return role != null && roleCan(role, action);
}
