"use client";

import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import type { Flat } from "@/lib/types";
import { formatPrice, statusLabel } from "@/lib/storage";

export function FlatCard({ flat }: { flat: Flat }) {
  const { favorites, toggleFavorite } = useApp();
  const liked = favorites.includes(flat.id);

  return (
    <article className="surface group overflow-hidden transition duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={flat.images[0]}
          alt={flat.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={`chip status-${flat.status}`}>{statusLabel(flat.status)}</span>
          {flat.featured && <span className="chip chip-gold">Featured</span>}
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(flat.id)}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-lg shadow"
          aria-label={liked ? "Remove from favorites" : "Save to favorites"}
        >
          {liked ? "♥" : "♡"}
        </button>
        <p className="absolute bottom-3 left-3 right-3 font-display text-lg text-white sm:text-xl md:text-2xl">
          {formatPrice(flat.price)}
        </p>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="font-display text-lg leading-snug sm:text-xl">{flat.title}</h3>
          <p className="mt-1 text-sm text-ink-soft">
            {flat.area}, {flat.city}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="chip">{flat.bedrooms} BHK</span>
          <span className="chip">{flat.carpetArea} sq.ft</span>
          <span className="chip">{flat.facing} facing</span>
          <span className="chip">{flat.furnishing}</span>
        </div>
        <div className="mobile-stack pt-1">
          <Link
            href={`/flats/${flat.id}`}
            className="btn btn-primary btn-full-mobile !py-2.5 !px-4 text-sm"
          >
            View details
          </Link>
          <Link
            href={`/enquiry?flat=${flat.id}`}
            className="btn btn-secondary btn-full-mobile !py-2.5 !px-4 text-sm"
          >
            Contact agent
          </Link>
        </div>
      </div>
    </article>
  );
}
