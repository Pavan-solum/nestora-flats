import { isStaffRole } from "@/lib/staff-roles";
import { staffAllows } from "@/lib/supabase/admin-auth";
import {
  createStaff,
  listDeskRoles,
  listStaff,
  resetStaffPassword,
  updateStaffRole,
} from "@/lib/supabase/staff-admin";

async function isAssignableRole(value: string) {
  if (isStaffRole(value)) return true;
  const roles = await listDeskRoles();
  return roles.some((role) => role.role === value);
}

export async function GET() {
  if (!(await staffAllows("manageStaff"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return Response.json(await listStaff());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load staff";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await staffAllows("manageStaff"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    displayName?: string;
    role?: string;
  };
  const email = body.email?.trim() ?? "";
  const displayName = body.displayName?.trim() ?? "";
  const role = body.role ?? "";
  if (!email.includes("@") || !displayName || !body.password || body.password.length < 8 || !(await isAssignableRole(role))) {
    return Response.json(
      { error: "Email, display name, a role, and a password of at least 8 characters are required." },
      { status: 400 },
    );
  }
  try {
    const account = await createStaff({
      email,
      password: body.password,
      displayName,
      role,
    });
    return Response.json(account);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create staff";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await staffAllows("manageStaff"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { id?: string; role?: string; password?: string };
  if (!body.id) return Response.json({ error: "Staff id is required." }, { status: 400 });
  try {
    if (body.role) {
      if (!(await isAssignableRole(body.role))) {
        return Response.json({ error: "Choose a desk role." }, { status: 400 });
      }
      await updateStaffRole(body.id, body.role);
    }
    if (body.password) {
      if (body.password.length < 8) {
        return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
      }
      await resetStaffPassword(body.id, body.password);
    }
    if (!body.role && !body.password) {
      return Response.json({ error: "Change a role or set a new password." }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update staff";
    return Response.json({ error: message }, { status: 400 });
  }
}
