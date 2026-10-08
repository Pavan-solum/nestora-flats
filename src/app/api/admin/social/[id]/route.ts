import { getSocialPost, removeSocialPost, saveSocialPost } from "@/lib/social/store";
import { staffAllows } from "@/lib/supabase/admin-auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await staffAllows("publishSocial"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = (await request.json()) as {
    flatId?: string;
    flatTitle?: string;
    caption?: string;
    imageUrls?: string[];
    networks?: string[];
  };
  try {
    const post = await saveSocialPost({
      id,
      flatId: body.flatId?.trim() ?? "",
      flatTitle: body.flatTitle?.trim() ?? "",
      caption: body.caption?.trim() ?? "",
      imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls.filter(Boolean) : [],
      networks: Array.isArray(body.networks) ? body.networks.filter(Boolean) : [],
    });
    return Response.json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the draft";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await staffAllows("publishSocial"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const post = await getSocialPost(id);
    if (!post) return Response.json({ error: "Social post not found." }, { status: 404 });
    if (post.status === "published" && !(await staffAllows("deleteSocialHistory"))) {
      return Response.json({ error: "Only an admin can delete a published post from history." }, { status: 403 });
    }
    await removeSocialPost(id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete the post";
    return Response.json({ error: message }, { status: 400 });
  }
}
