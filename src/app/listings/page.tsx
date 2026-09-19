"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FlatCard } from "@/components/FlatCard";
import { FlatFilters } from "@/components/FlatFilters";
import { useApp } from "@/context/AppContext";
import { emptyFilters, filterFlats } from "@/lib/filters";
import type { FlatFilters as Filters } from "@/lib/types";
import { getCityByName, slugify } from "@/lib/locations";

function ListingsContent() {
  const { flats, ready } = useApp();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const city = searchParams.get("city") ?? "";
    const area = searchParams.get("area") ?? "";
    setFilters((prev) => ({
      ...prev,
      city,
      area,
    }));
  }, [searchParams]);

  const results = useMemo(() => {
    const filtered = filterFlats(flats, filters);
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "area-desc") sorted.sort((a, b) => b.carpetArea - a.carpetArea);
    else sorted.sort((a, b) => +new Date(b.listedAt) - +new Date(a.listedAt));
    return sorted;
  }, [flats, filters, sort]);

  const cityConfig = filters.city ? getCityByName(filters.city) : undefined;

  return (
    <div className="container-shell section-space !pt-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl">Flats for sale</h1>
          <p className="mt-3 text-sm text-ink-soft sm:text-base">
            Filter by city and area, or{" "}
            <Link href="/explore" className="font-semibold text-sage">
              explore locations
            </Link>{" "}
            starting with Bengaluru neighbourhoods.
          </p>
          {(filters.city || filters.area) && (
            <p className="mt-3 text-sm">
              Showing
              {filters.area ? (
                <>
                  {" "}
                  <strong>{filters.area}</strong>
                </>
              ) : null}
              {filters.city ? (
                <>
                  {" "}
                  in <strong>{filters.city}</strong>
                </>
              ) : null}
              {cityConfig && filters.area && (
                <>
                  {" · "}
                  <Link
                    href={`/explore/${cityConfig.slug}/${slugify(filters.area)}`}
                    className="text-sage font-semibold"
                  >
                    Open area page
                  </Link>
                </>
              )}
            </p>
          )}
        </div>
        <Link href="/explore" className="btn btn-secondary btn-full-mobile">
          Browse by city →
        </Link>
      </div>

      <FlatFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters)}
      />

      <div className="mt-6 mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">
          {ready ? `${results.length} listing${results.length === 1 ? "" : "s"}` : "Loading…"}
        </p>
        <div className="field w-full !flex-col gap-2 sm:w-auto sm:!flex-row sm:!items-center">
          <label htmlFor="sort" className="!mb-0 whitespace-nowrap">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full min-w-0 sm:min-w-[180px]"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Starting from: low to high</option>
            <option value="price-desc">Starting from: high to low</option>
            <option value="area-desc">Largest carpet area</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {results.map((flat) => (
          <FlatCard key={flat.id} flat={flat} />
        ))}
      </div>

      {ready && results.length === 0 && (
        <div className="surface mt-6 p-8 text-center">
          <h2 className="font-display text-3xl">No flats matched</h2>
          <p className="mt-2 text-ink-soft">Try another area or reset filters.</p>
          <Link href="/explore/bengaluru" className="btn btn-primary mt-6">
            Explore Bengaluru areas
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-shell section-space">
          <p className="text-ink-soft">Loading listings…</p>
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
