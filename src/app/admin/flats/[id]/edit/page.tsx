"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { RoleGate } from "@/components/RoleGate";
import { FlatForm } from "@/components/FlatForm";
import { useApp } from "@/context/AppContext";
import { roleCan } from "@/lib/staff-roles";
import type { FlatInput } from "@/lib/types";

export default function EditFlatPage() {
  return (
    <AdminGuard>
      <RoleGate action="writeFlat">
        <EditFlat />
      </RoleGate>
    </AdminGuard>
  );
}

function EditFlat() {
  const params = useParams<{ id: string }>();
  const { getFlat, updateFlat, ready, ensureFlatDetails, staffRole } = useApp();
  const router = useRouter();
  const flat = getFlat(params.id);
  const [detailsReady, setDetailsReady] = useState(false);
  const [sync, setSync] = useState<SyncState | null>(null);
  const canSync = roleCan(staffRole, "publishSocial");

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void ensureFlatDetails(params.id).finally(() => {
      if (!cancelled) setDetailsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, params.id, ensureFlatDetails]);

  if (!ready || !detailsReady) {
    return (
      <div className="container-shell section-space">
        <p className="text-ink-soft">Loading…</p>
      </div>
    );
  }

  if (!flat) {
    return (
      <div className="container-shell section-space text-center">
        <h1 className="font-display text-4xl">Flat not found</h1>
        <Link href="/admin" className="btn btn-primary mt-6">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: FlatInput) => {
    await updateFlat(flat.id, data);
    if (canSync) {
      const response = await fetch(`/api/admin/social?flatId=${encodeURIComponent(flat.id)}`);
      if (response.ok) {
        const body = (await response.json()) as { posts?: unknown[] };
        const count = body.posts?.length ?? 0;
        if (count > 0) {
          setSync({ count, results: null, error: "", pending: false });
          return;
        }
      }
    }
    router.push(`/flats/${flat.id}`);
  };

  const finish = () => router.push(`/flats/${flat.id}`);

  const updateSocial = async () => {
    if (!sync || sync.pending) return;
    setSync({ ...sync, pending: true, error: "" });
    try {
      const response = await fetch("/api/admin/social/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flatId: flat.id }),
      });
      const body = (await response.json()) as { results?: SyncResult[]; error?: string };
      if (!response.ok) {
        setSync({ ...sync, pending: false, error: body.error || "Could not update the social posts." });
        return;
      }
      setSync({ count: sync.count, pending: false, error: "", results: body.results ?? [] });
    } catch {
      setSync({ ...sync, pending: false, error: "Could not update the social posts." });
    }
  };

  return (
    <div className="container-shell section-space !pt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">Update flat</h1>
          <p className="mt-2 text-ink-soft">Edit details for {flat.title}</p>
        </div>
        <Link href="/admin" className="btn btn-secondary">
          Back to dashboard
        </Link>
      </div>
      <FlatForm initial={flat} onSubmit={onSubmit} submitLabel="Save changes" />
      {sync && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="sync-title" className="surface w-full max-w-lg space-y-4 p-6">
            <h2 id="sync-title" className="font-display text-3xl">Update social posts?</h2>
            <p className="text-ink-soft">
              The listing was updated. Update its {sync.count === 1 ? "linked social post" : `${sync.count} linked social posts`} too?
              Captions will use the new listing details. Existing hashtags stay, and published photos stay as they are.
            </p>
            {sync.results && (
              <ul className="space-y-2 text-sm">
                {sync.results.map((result) => (
                  <li key={result.id} className={result.ok ? "text-ink" : "text-red-700"}>
                    {result.title}: {result.ok ? "Updated" : result.error || "Could not update this post."}
                  </li>
                ))}
              </ul>
            )}
            {sync.error && <p className="text-sm text-red-700" role="alert">{sync.error}</p>}
            <div className="flex flex-wrap gap-3">
              {(!sync.results || sync.results.some((result) => !result.ok)) && (
                <button type="button" className="btn btn-primary" disabled={sync.pending} onClick={() => void updateSocial()}>
                  {sync.pending ? "Updating…" : "Update social posts"}
                </button>
              )}
              <button type="button" className="btn btn-secondary" disabled={sync.pending} onClick={finish}>
                {sync.results ? "Continue" : "Keep current social posts"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type SyncResult = { id: string; title: string; ok: boolean; error?: string };
type SyncState = { count: number; results: SyncResult[] | null; error: string; pending: boolean };
