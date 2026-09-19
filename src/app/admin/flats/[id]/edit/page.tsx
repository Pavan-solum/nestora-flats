"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminGuard } from "@/components/AdminGuard";
import { FlatForm } from "@/components/FlatForm";
import { useApp } from "@/context/AppContext";
import type { FlatInput } from "@/lib/types";

export default function EditFlatPage() {
  return (
    <AdminGuard>
      <EditFlat />
    </AdminGuard>
  );
}

function EditFlat() {
  const params = useParams<{ id: string }>();
  const { getFlat, updateFlat, ready } = useApp();
  const router = useRouter();
  const flat = getFlat(params.id);

  if (!ready) {
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

  const onSubmit = (data: FlatInput) => {
    updateFlat(flat.id, data);
    router.push(`/flats/${flat.id}`);
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
    </div>
  );
}
