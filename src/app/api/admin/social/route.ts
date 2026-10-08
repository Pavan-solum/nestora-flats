import { listSocialNetworks } from "@/lib/social/adapters";
import { listSocialPosts, saveSocialPost } from "@/lib/social/store";
import { staffAllows } from "@/lib/supabase/admin-auth";

export async function GET() {
  if (!(await staffAllows("publishSocial"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const posts = await listSocialPosts();
    return Response.json({ posts, networks: listSocialNetworks() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load social posts";
    return Response.json({ error: message, networks: listSocialNetworks(), posts: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await staffAllows("publishSocial"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    flatId?: string;
    flatTitle?: string;
    caption?: string;
    imageUrls?: string[];
    networks?: string[];
  };
  try {
    const post = await saveSocialPost({
      flatId: body.flatId?.trim() ?? "",
      flatTitle: body.flatTitle?.trim() ?? "",
      caption: body.caption?.trim() ?? "",
      imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls.filter(Boolean) : [],
      networks: Array.isArray(body.networks) ? body.networks.filter(Boolean) : [],
    });
    return Response.json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the draft";
    return Response.json({ error: message }, { status: 400 });
  }
}
