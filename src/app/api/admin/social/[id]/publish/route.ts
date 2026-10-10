import { publishSocialPost } from "@/lib/social/store";
import { staffAllows } from "@/lib/supabase/admin-auth";

type RouteContext = { params: Promise<{ id: string }> };

export const maxDuration = 60;

export async function POST(_request: Request, context: RouteContext) {
  if (!(await staffAllows("publishSocial"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    return Response.json(await publishSocialPost(id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not publish the post";
    return Response.json({ error: message }, { status: 400 });
  }
}
