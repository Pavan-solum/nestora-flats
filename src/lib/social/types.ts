export type SocialResult = {
  network: string;
  ok: boolean;
  remoteId?: string;
  error?: string;
};

export type SocialPostStatus = "draft" | "publishing" | "published" | "failed";

export type SocialPost = {
  id: string;
  flatId: string;
  flatTitle: string;
  caption: string;
  imageUrls: string[];
  networks: string[];
  status: SocialPostStatus;
  results: SocialResult[];
  createdAt: string;
  updatedAt: string;
};

export type SocialPublishInput = {
  caption: string;
  imageUrls: string[];
};

export type SocialAdapter = {
  id: string;
  label: string;
  configured: () => boolean;
  publish: (input: SocialPublishInput) => Promise<SocialResult>;
};

export function networksToPublish(networks: string[], results: SocialResult[]) {
  const done = new Set(results.filter((result) => result.ok).map((result) => result.network));
  return networks.filter((network) => !done.has(network));
}

export function publishFailureMessage(detail?: string) {
  const text = detail?.trim() ?? "";
  if (/pages_manage_posts/i.test(text) || /permissions error/i.test(text)) {
    return "Facebook refused this post. The Page token needs the pages_manage_posts permission.";
  }
  if (/publish_actions/i.test(text) || /posted to a page as the page itself/i.test(text)) {
    return "Facebook refused this post. It has to be published as the Page, not from a personal login.";
  }
  return text || "The post could not be published. The draft is still here so you can try again.";
}
