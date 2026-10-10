import { staffAllows } from "@/lib/supabase/admin-auth";
import { resetInventory } from "@/lib/supabase/records";

export const maxDuration = 60;

export async function POST() {
  if (!(await staffAllows("resetInventory"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await resetInventory();
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reset listings";
    return Response.json({ error: message }, { status: 500 });
  }
}
