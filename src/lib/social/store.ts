import { createId } from "@/lib/storage";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { networksToPublish, type SocialPost, type SocialPostStatus, type SocialResult } from "./types";
import { publishToNetworks } from "./adapters";

type Row = {
  id: string;
  flat_id: string | null;
  flat_title: string | null;
  caption: string | null;
  image_urls: string[] | null;
  networks: string[] | null;
  status: SocialPostStatus;
  results: SocialResult[] | null;
  created_at: string;
  updated_at: string;
};

function toPost(row: Row): SocialPost {
  return {
    id: row.id,
    flatId: row.flat_id ?? "",
    flatTitle: row.flat_title ?? "",
    caption: row.caption ?? "",
    imageUrls: row.image_urls ?? [],
    networks: row.networks ?? [],
    status: row.status,
    results: row.results ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function missingTable(message: string) {
  return /social_desk_posts|schema cache|could not find the table/i.test(message)
    ? "Run supabase/social-posts.sql in the Supabase SQL editor, then open Social again."
    : message;
}

export async function listSocialPosts() {
  const { data, error } = await getSupabaseAdmin()
    .from("social_desk_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(missingTable(error.message));
  return ((data ?? []) as Row[]).map(toPost);
}

export async function getSocialPost(id: string) {
  const { data, error } = await getSupabaseAdmin().from("social_desk_posts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(missingTable(error.message));
  return data ? toPost(data as Row) : null;
}

export async function saveSocialPost(input: {
  id?: string;
  flatId: string;
  flatTitle: string;
  caption: string;
  imageUrls: string[];
  networks: string[];
}) {
  const now = new Date().toISOString();
  const id = input.id || createId("post");
  const existing = input.id ? await getSocialPost(input.id) : null;
  if (existing && existing.status === "publishing") {
    throw new Error("This post is already publishing.");
  }
  if (existing?.status === "published") {
    throw new Error("This post is already published. Start a new draft to post again.");
  }
  const row = {
    id,
    flat_id: input.flatId,
    flat_title: input.flatTitle,
    caption: input.caption,
    image_urls: input.imageUrls,
    networks: input.networks,
    status: existing?.status === "failed" ? "failed" : "draft",
    results: existing?.results ?? [],
    updated_at: now,
    ...(existing ? {} : { created_at: now }),
  };
  const { error } = await getSupabaseAdmin().from("social_desk_posts").upsert(row);
  if (error) throw new Error(missingTable(error.message));
  const saved = await getSocialPost(id);
  if (!saved) throw new Error("Could not save the social post.");
  return saved;
}

export async function removeSocialPost(id: string) {
  const { error } = await getSupabaseAdmin().from("social_desk_posts").delete().eq("id", id);
  if (error) throw new Error(missingTable(error.message));
}

export async function publishSocialPost(id: string) {
  const post = await getSocialPost(id);
  if (!post) throw new Error("Social post not found.");
  if (post.status === "publishing") throw new Error("This post is already publishing.");
  if (post.status === "published") throw new Error("This post is already published.");
  if (!post.caption.trim()) throw new Error("Write a caption before posting.");
  if (post.imageUrls.length === 0) throw new Error("Choose at least one photo.");
  if (post.networks.length === 0) throw new Error("Choose at least one network.");

  const admin = getSupabaseAdmin();
  const locked = await admin
    .from("social_desk_posts")
    .update({ status: "publishing", updated_at: new Date().toISOString() })
    .eq("id", id)
    .neq("status", "publishing");
  if (locked.error) throw new Error(missingTable(locked.error.message));

  try {
    const pending = networksToPublish(post.networks, post.results);
    const fresh = await publishToNetworks(pending, { caption: post.caption, imageUrls: post.imageUrls });
    const merged = [
      ...post.results.filter((result) => result.ok && post.networks.includes(result.network)),
      ...fresh,
    ];
    const status = post.networks.every((network) => merged.some((result) => result.network === network && result.ok))
      ? "published"
      : "failed";
    const { error } = await admin
      .from("social_desk_posts")
      .update({ status, results: merged, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(missingTable(error.message));
    const saved = await getSocialPost(id);
    if (!saved) throw new Error("Could not record the publish result.");
    return saved;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not publish the post.";
    const results: SocialResult[] = post.networks.map((network) => {
      const previous = post.results.find((result) => result.network === network && result.ok);
      return previous ?? { network, ok: false, error: message };
    });
    await admin
      .from("social_desk_posts")
      .update({ status: "failed", results, updated_at: new Date().toISOString() })
      .eq("id", id);
    throw new Error(message);
  }
}
