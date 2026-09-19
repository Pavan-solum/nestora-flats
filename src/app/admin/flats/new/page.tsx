"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { FlatForm } from "@/components/FlatForm";
import { useApp } from "@/context/AppContext";
import type { FlatInput } from "@/lib/types";

export default function NewFlatPage() {
  return (
    <AdminGuard>
      <NewFlat />
    </AdminGuard>
  );
}

function NewFlat() {
  const { addFlat } = useApp();
  const router = useRouter();

  const onSubmit = (data: FlatInput) => {
    const flat = addFlat(data);
    router.push(`/flats/${flat.id}`);
  };

  return (
    <div className="container-shell section-space !pt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">Add new flat</h1>
          <p className="mt-2 text-ink-soft">
            Publish a fresh listing with photos, amenities, and nearby places.
          </p>
        </div>
        <Link href="/admin" className="btn btn-secondary">
          Back to dashboard
        </Link>
      </div>
      <FlatForm onSubmit={onSubmit} submitLabel="Publish flat" />
    </div>
  );
}
