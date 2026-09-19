"use client";

import Link from "next/link";
import { FlatCard } from "@/components/FlatCard";
import { useApp } from "@/context/AppContext";

export default function FavoritesPage() {
  const { ready, flats, favorites } = useApp();
  const saved = flats.filter((f) => favorites.includes(f.id));

  return (
    <div className="container-shell section-space !pt-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-5xl">Favorites</h1>
        <p className="mt-3 text-ink-soft">
          Your shortlisted flats stay saved in this browser so you can compare
          and enquire later.
        </p>
      </div>

      {!ready && <p className="text-ink-soft">Loading…</p>}

      {ready && saved.length === 0 && (
        <div className="surface p-8 text-center">
          <h2 className="font-display text-3xl">No favorites yet</h2>
          <p className="mt-2 text-ink-soft">Browse listings and tap the heart icon to save homes.</p>
          <Link href="/listings" className="btn btn-primary mt-6">
            Browse listings
          </Link>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {saved.map((flat) => (
          <FlatCard key={flat.id} flat={flat} />
        ))}
      </div>
    </div>
  );
}
