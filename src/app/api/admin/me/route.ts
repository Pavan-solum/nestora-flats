import { requestStaffRole } from "@/lib/supabase/admin-auth";

export async function GET() {
  const role = await requestStaffRole();
  if (!role) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ role });
}
