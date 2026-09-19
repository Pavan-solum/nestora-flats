"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { FlatCard } from "@/components/FlatCard";
import { useApp } from "@/context/AppContext";
import { areaPath, cityPath, getAreaBySlug, getCityBySlug } from "@/lib/locations";

export default function ExploreAreaPage() {
  const params = useParams<{ city: string; area: string }>();
  const { flats, ready } = useApp();
  const [sort, setSort] = useState("newest");

  const city = getCityBySlug(params.city);
  const area = city ? getAreaBySlug(city, params.area) : undefined;

  const results = useMemo(() => {
    if (!city || !area) return [];
    const filtered = flats.filter(
      (f) => f.city === city.name && f.area === area.name,
    );
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else sorted.sort((a, b) => +new Date(b.listedAt) - +new Date(a.listedAt));
    return sorted;
  }, [flats, city, area, sort]);

  if (!city || !area) {
    return (
      <div className="container-shell section-space text-center">
        <h1 className="font-display text-4xl">Area not found</h1>
        <Link href="/explore" className="btn btn-primary mt-6">
          Back to cities
        </Link>
      </div>
    );
  }

  return (
    <div className="container-shell section-space !pt-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <Link href="/explore" className="hover:text-sage">
          Explore
        </Link>
        <span>/</span>
        <Link href={cityPath(city.slug)} className="hover:text-sage">
          {city.name}
        </Link>
        <span>/</span>
        <span className="font-semibold text-ink">{area.name}</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="chip chip-sage mb-3 w-fit">{city.name}</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl">{area.name}</h1>
          <p className="mt-3 text-ink-soft">{area.blurb}</p>
        </div>
        <Link href={cityPath(city.slug)} className="btn btn-secondary">
          All areas in {city.name}
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {ready
            ? `${results.length} flat${results.length === 1 ? "" : "s"} in ${area.name}`
            : "Loading…"}
        </p>
        <div className="field !flex-row !items-center gap-2">
          <label htmlFor="sort" className="!mb-0 whitespace-nowrap">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="min-w-[180px]"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Starting from: low to high</option>
            <option value="price-desc">Starting from: high to low</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {results.map((flat) => (
          <FlatCard key={flat.id} flat={flat} />
        ))}
      </div>

      {ready && results.length === 0 && (
        <div className="surface mt-2 p-8 text-center">
          <h2 className="font-display text-3xl">No flats in this area yet</h2>
          <p className="mt-2 text-ink-soft">
            Check nearby areas in {city.name}, or browse all listings.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={cityPath(city.slug)} className="btn btn-primary">
              Browse {city.name} areas
            </Link>
            <Link href={areaPath(city.slug, city.areas[0].slug)} className="btn btn-secondary">
              Try another area
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
