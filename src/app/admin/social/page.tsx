"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { BusyButton } from "@/components/BusyButton";
import { RoleGate } from "@/components/RoleGate";
import { useApp } from "@/context/AppContext";
import { listingCaption } from "@/lib/social/caption";
import { publishFailureMessage, type SocialPost, type SocialPostStatus } from "@/lib/social/types";
import { roleCan } from "@/lib/staff-roles";

type Network = { id: string; label: string; configured: boolean };

export default function SocialPage() {
  return (
    <AdminGuard>
      <RoleGate action="publishSocial">
        <SocialDesk />
      </RoleGate>
    </AdminGuard>
  );
}

function SocialDesk() {
  const { flats, staffRole } = useApp();
  const canDeleteHistory = roleCan(staffRole, "deleteSocialHistory");
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [flatId, setFlatId] = useState("");
  const [caption, setCaption] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [editingId, setEditingId] = useState("");
  const [composerOpen, setComposerOpen] = useState(true);
  const [busy, setBusy] = useState<"save" | "post" | "">("");

  const flat = useMemo(() => flats.find((item) => item.id === flatId) ?? null, [flats, flatId]);
  const connected = networks.some((network) => network.configured);

  async function load() {
    const response = await fetch("/api/admin/social");
    const body = (await response.json()) as { posts?: SocialPost[]; networks?: Network[]; error?: string };
    setPosts(body.posts ?? []);
    setNetworks(body.networks ?? []);
    setNotice(body.error ?? "");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function applyFlat(nextId: string) {
    const next = flats.find((item) => item.id === nextId);
    setFlatId(nextId);
    setEditingId("");
    setError("");
    if (!next) {
      setCaption("");
      setPhotos([]);
      return;
    }
    setCaption(listingCaption(next));
    setPhotos(next.images.slice(0, 1));
  }

  function togglePhoto(url: string) {
    setPhotos((current) => (current.includes(url) ? current.filter((item) => item !== url) : [...current, url]));
  }

  function toggleNetwork(id: string) {
    setChosen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function closeComposer() {
    setComposerOpen(false);
    setEditingId("");
    setFlatId("");
    setCaption("");
    setPhotos([]);
    setChosen([]);
  }

  function openDraft(post: SocialPost) {
    if (post.status === "published" || post.status === "publishing") return;
    setComposerOpen(true);
    setEditingId(post.id);
    setFlatId(post.flatId);
    setCaption(post.caption);
    setPhotos(post.imageUrls);
    setChosen(post.networks);
    setError("");
  }

  async function save(publish: boolean) {
    setError("");
    setBusy(publish ? "post" : "save");
    try {
      const payload = {
        flatId,
        flatTitle: flat?.title ?? posts.find((post) => post.id === editingId)?.flatTitle ?? "",
        caption,
        imageUrls: photos,
        networks: chosen,
      };
      const response = await fetch(editingId ? `/api/admin/social/${editingId}` : "/api/admin/social", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await readSocialResponse(response);
      if (!response.ok) {
        setError(saved.error || "Could not save the draft.");
        return;
      }
      if (!publish) {
        closeComposer();
        await load();
        return;
      }
      const published = await fetch("/api/admin/social/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: saved.id }),
        signal: AbortSignal.timeout(70000),
      });
      const result = await readSocialResponse(published);
      if (!published.ok || result.status === "failed") {
        setEditingId(saved.id);
        const detail = result.results?.find((item) => !item.ok)?.error || result.error;
        setError(publishFailureMessage(detail));
        await load();
        return;
      }
      closeComposer();
      await load();
    } catch (error) {
      const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
      setError(
        timedOut
          ? "The post did not finish in time. The draft is still here so you can try again."
          : publishFailureMessage(error instanceof Error ? error.message : ""),
      );
      await load();
    } finally {
      setBusy("");
    }
  }

  async function remove(post: SocialPost) {
    if (post.status === "published" && !canDeleteHistory) return;
    setBusy("");
    const response = await fetch(`/api/admin/social/${post.id}`, { method: "DELETE" });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(body.error || "Could not delete the post.");
      return;
    }
    if (editingId === post.id) {
      setEditingId("");
      setCaption("");
      setPhotos([]);
    }
    await load();
  }

  return (
    <div className="container-shell section-space">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Social</p>
          <h1 className="font-display text-4xl">Post a listing</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {!composerOpen && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setError("");
                setComposerOpen(true);
              }}
            >
              New post
            </button>
          )}
          <Link href="/admin" className="btn btn-secondary">
            Dashboard
          </Link>
        </div>
      </div>

      {!connected && (
        <p className="mb-6 rounded-2xl bg-sand px-4 py-3 text-sm text-ink-soft">
          Publishing is not connected yet. Add the Facebook Page id, Page access token, and Instagram user id on the
          server, then restart the app. You can still save drafts.
        </p>
      )}
      {notice && <p className="mb-6 text-sm text-red-700">{notice}</p>}
      {error && !composerOpen && <p className="mb-6 text-sm text-red-700">{error}</p>}

      {composerOpen && (
      <form
        className="mb-12 grid gap-5 rounded-3xl border border-line bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void save(false);
        }}
      >
        <div className="field">
          <label htmlFor="social-flat">Listing</label>
          <select id="social-flat" value={flatId} onChange={(event) => applyFlat(event.target.value)}>
            <option value="">Choose a flat</option>
            {flats.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="social-caption">Caption</label>
          <textarea id="social-caption" value={caption} onChange={(event) => setCaption(event.target.value)} />
        </div>
        {flat && (
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold">Photos</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {flat.images.map((url) => (
                <label key={url} className="grid gap-2 text-xs">
                  <img src={url} alt="" className="h-24 w-full rounded-xl object-cover" />
                  <span className="flex items-center gap-2">
                    <input type="checkbox" checked={photos.includes(url)} onChange={() => togglePhoto(url)} />
                    Include
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-ink-soft">
              {photos.length > 1 ? "Several photos publish as a carousel." : "One photo publishes as a single post."}
            </p>
          </fieldset>
        )}
        <fieldset className="flex flex-wrap gap-4">
          <legend className="sr-only">Networks</legend>
          {networks.map((network) => (
            <label key={network.id} className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={chosen.includes(network.id)}
                disabled={!network.configured}
                onChange={() => toggleNetwork(network.id)}
              />
              {network.label}
              {!network.configured && <span className="font-normal text-ink-soft">Not connected</span>}
            </label>
          ))}
        </fieldset>
        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <BusyButton
            type="submit"
            className="btn btn-secondary"
            pending={busy === "save"}
            disabled={busy === "post"}
            pendingLabel="Saving…"
          >
            Save draft
          </BusyButton>
          <BusyButton
            type="button"
            className="btn btn-primary"
            pending={busy === "post"}
            disabled={busy === "save"}
            pendingLabel="Posting…"
            onClick={() => void save(true)}
          >
            Post now
          </BusyButton>
        </div>
      </form>
      )}

      <h2 className="mb-4 font-display text-2xl">History</h2>
      <div className="overflow-x-auto rounded-3xl border border-line">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sand text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-semibold">Listing</th>
              <th className="px-4 py-3 font-semibold">Networks</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-ink-soft" colSpan={5}>
                  No posts yet.
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-line">
                <td className="px-4 py-3">{post.flatTitle || "Untitled"}</td>
                <td className="px-4 py-3">{post.networks.join(", ") || "—"}</td>
                <td className="px-4 py-3">
                  <StatusLabel status={post.status} />
                  {post.results.some((result) => result.error) && (
                    <p className="mt-1 text-xs text-red-700">
                      {post.results
                        .filter((result) => result.error)
                        .map((result) => publishFailureMessage(result.error))
                        .join(" ")}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">{new Date(post.updatedAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  {post.status !== "published" && post.status !== "publishing" && (
                    <button type="button" className="btn btn-secondary mr-2" onClick={() => openDraft(post)}>
                      Edit
                    </button>
                  )}
                  {(post.status !== "published" || canDeleteHistory) && post.status !== "publishing" && (
                    <button type="button" className="btn btn-secondary" onClick={() => void remove(post)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function readSocialResponse(response: Response) {
  const text = await response.text();
  if (!text) return { error: "Could not publish the post." } as SocialPost & { error?: string };
  try {
    return JSON.parse(text) as SocialPost & { error?: string };
  } catch {
    return { error: "Could not publish the post." } as SocialPost & { error?: string };
  }
}

function StatusLabel({ status }: { status: SocialPostStatus }) {
  const labels: Record<SocialPostStatus, string> = {
    draft: "Draft",
    publishing: "Publishing",
    published: "Published",
    failed: "Failed",
  };
  return <span>{labels[status]}</span>;
}
