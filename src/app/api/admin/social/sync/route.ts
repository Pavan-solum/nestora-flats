import { syncLinkedCaptions } from "@/lib/social/store";
import { staffAllows } from "@/lib/supabase/admin-auth";
import { fetchFlats } from "@/lib/supabase/records";

export async function POST(request: Request) {
  if (!(await staffAllows("publishSocial"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { flatId?: string };
  const flatId = body.flatId?.trim() ?? "";
  if (!flatId) return Response.json({ error: "Choose a listing." }, { status: 400 });
  try {
    const flat = (await fetchFlats()).find((item) => item.id === flatId);
    if (!flat) return Response.json({ error: "Listing not found." }, { status: 404 });
    const results = await syncLinkedCaptions(flat);
    return Response.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the social posts";
    return Response.json({ error: message }, { status: 500 });
  }
}
