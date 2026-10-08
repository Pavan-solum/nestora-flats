import { publishSocialPost } from "@/lib/social/store";
import { staffAllows } from "@/lib/supabase/admin-auth";

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!(await staffAllows("publishSocial"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  const id = body?.id?.trim() ?? "";
  if (!id) {
    return Response.json({ error: "Social post not found." }, { status: 400 });
  }
  try {
    return Response.json(await publishSocialPost(id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not publish the post";
    return Response.json({ error: message }, { status: 400 });
  }
}
