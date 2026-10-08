import type { SocialAdapter, SocialPublishInput, SocialResult } from "./types";

const GRAPH = "https://graph.facebook.com/v21.0";

function pageId() {
  return process.env.META_PAGE_ID?.trim() ?? "";
}

function pageToken() {
  return process.env.META_PAGE_ACCESS_TOKEN?.trim() ?? "";
}

function instagramId() {
  return process.env.META_IG_USER_ID?.trim() ?? "";
}

function networkError(error: unknown, fallback: string) {
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return "The network did not answer in time. Try again.";
  }
  return error instanceof Error ? error.message : fallback;
}

async function facebookPageToken() {
  const token = pageToken();
  const id = pageId();
  if (!token || !id) throw new Error("Facebook is not connected.");
  const meResponse = await fetch(`${GRAPH}/me?fields=id&access_token=${encodeURIComponent(token)}`, {
    signal: AbortSignal.timeout(15000),
  });
  const me = (await meResponse.json()) as { id?: string; error?: { message?: string } };
  if (me.error) throw new Error(me.error.message || "Facebook could not read this token.");
  if (me.id === id) return token;

  const accountsResponse = await fetch(
    `${GRAPH}/me/accounts?fields=id,access_token&limit=50&access_token=${encodeURIComponent(token)}`,
    { signal: AbortSignal.timeout(15000) },
  );
  const accounts = (await accountsResponse.json()) as {
    data?: { id?: string; access_token?: string }[];
    error?: { message?: string };
  };
  if (accounts.error) throw new Error(accounts.error.message || "Facebook could not list Pages for this login.");
  const match = accounts.data?.find((item) => item.id === id && item.access_token);
  if (!match?.access_token) {
    throw new Error("Facebook must post as the Page. This login cannot manage that Page.");
  }
  return match.access_token;
}

async function graph(path: string, body: Record<string, string>, token = pageToken()) {
  let response: Response;
  try {
    response = await fetch(`${GRAPH}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ...body, access_token: token }),
      signal: AbortSignal.timeout(25000),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new Error("The network did not answer in time. Try again.");
    }
    throw error;
  }
  const payload = (await response.json()) as { id?: string; error?: { message?: string } };
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || "Meta could not publish this post.");
  }
  return payload.id ?? "";
}

async function waitForInstagram(containerId: string) {
  const token = pageToken();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await fetch(
      `${GRAPH}/${containerId}?fields=status_code&access_token=${encodeURIComponent(token)}`,
    );
    const payload = (await response.json()) as { status_code?: string; error?: { message?: string } };
    if (payload.status_code === "FINISHED") return;
    if (payload.status_code === "ERROR" || payload.error) {
      throw new Error(payload.error?.message || "Instagram could not process the photo.");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("Instagram is still processing the photo. Try again in a moment.");
}

async function publishFacebook(input: SocialPublishInput): Promise<SocialResult> {
  try {
    const token = await facebookPageToken();
    if (input.imageUrls.length === 1) {
      const remoteId = await graph(
        `${pageId()}/photos`,
        {
          url: input.imageUrls[0],
          caption: input.caption,
        },
        token,
      );
      return { network: "facebook", ok: true, remoteId };
    }
    const photoIds: string[] = [];
    for (const url of input.imageUrls) {
      photoIds.push(await graph(`${pageId()}/photos`, { url, published: "false" }, token));
    }
    const attached = new URLSearchParams({ message: input.caption, access_token: token });
    photoIds.forEach((id, index) => {
      attached.set(`attached_media[${index}]`, JSON.stringify({ media_fbid: id }));
    });
    const response = await fetch(`${GRAPH}/${pageId()}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: attached,
      signal: AbortSignal.timeout(25000),
    });
    const payload = (await response.json()) as { id?: string; error?: { message?: string } };
    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message || "Meta could not publish this post.");
    }
    const remoteId = payload.id ?? "";
    return { network: "facebook", ok: true, remoteId };
  } catch (error) {
    return {
      network: "facebook",
      ok: false,
      error: networkError(error, "Facebook publish failed."),
    };
  }
}

async function publishInstagram(input: SocialPublishInput): Promise<SocialResult> {
  try {
    const userId = instagramId();
    let containerId = "";
    if (input.imageUrls.length === 1) {
      containerId = await graph(`${userId}/media`, {
        image_url: input.imageUrls[0],
        caption: input.caption,
      });
    } else {
      const children: string[] = [];
      for (const url of input.imageUrls) {
        children.push(await graph(`${userId}/media`, { image_url: url, is_carousel_item: "true" }));
      }
      containerId = await graph(`${userId}/media`, {
        media_type: "CAROUSEL",
        children: children.join(","),
        caption: input.caption,
      });
    }
    await waitForInstagram(containerId);
    const remoteId = await graph(`${userId}/media_publish`, { creation_id: containerId });
    return { network: "instagram", ok: true, remoteId };
  } catch (error) {
    return {
      network: "instagram",
      ok: false,
      error: networkError(error, "Instagram publish failed."),
    };
  }
}

export const socialAdapters: SocialAdapter[] = [
  {
    id: "facebook",
    label: "Facebook",
    configured: () => Boolean(pageId() && pageToken()),
    publish: publishFacebook,
  },
  {
    id: "instagram",
    label: "Instagram",
    configured: () => Boolean(instagramId() && pageToken()),
    publish: publishInstagram,
  },
];

export function listSocialNetworks() {
  return socialAdapters.map((adapter) => ({
    id: adapter.id,
    label: adapter.label,
    configured: adapter.configured(),
  }));
}

export async function publishToNetworks(networks: string[], input: SocialPublishInput) {
  const results: SocialResult[] = [];
  for (const network of networks) {
    const adapter = socialAdapters.find((item) => item.id === network);
    if (!adapter) {
      results.push({ network, ok: false, error: "This network is not available." });
      continue;
    }
    if (!adapter.configured()) {
      results.push({ network, ok: false, error: `${adapter.label} is not connected.` });
      continue;
    }
    results.push(await adapter.publish(input));
  }
  return results;
}
