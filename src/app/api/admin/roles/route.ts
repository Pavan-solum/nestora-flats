import { isStaffRole } from "@/lib/staff-roles";
import { staffAllows } from "@/lib/supabase/admin-auth";
import { createDeskRole, listDeskRoles } from "@/lib/supabase/staff-admin";

export async function GET() {
  if (!(await staffAllows("manageStaff"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return Response.json(await listDeskRoles());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load roles";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await staffAllows("manageStaff"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { label?: string; access?: string };
  const label = body.label?.trim() ?? "";
  if (!label || !isStaffRole(body.access)) {
    return Response.json({ error: "Enter a role name and choose the access it should have." }, { status: 400 });
  }
  try {
    return Response.json(await createDeskRole(label, body.access));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create role";
    return Response.json({ error: message }, { status: 400 });
  }
}
