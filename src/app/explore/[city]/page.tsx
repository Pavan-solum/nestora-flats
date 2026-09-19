"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { areaPath, getCityBySlug } from "@/lib/locations";

export default function ExploreCityPage() {
  const params = useParams<{ city: string }>();
  const { flats, ready } = useApp();
  const city = getCityBySlug(params.city);

  if (!city) {
    return (
      <div className="container-shell section-space text-center">
        <h1 className="font-display text-4xl">City not found</h1>
        <Link href="/explore" className="btn btn-primary mt-6">
          Back to cities
        </Link>
      </div>
    );
  }

  const cityFlats = flats.filter((f) => f.city === city.name);

  return (
    <div className="container-shell section-space !pt-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <Link href="/explore" className="hover:text-sage">
          Explore
        </Link>
        <span>/</span>
        <span className="font-semibold text-ink">{city.name}</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl">{city.name}</h1>
          <p className="mt-3 text-ink-soft">{city.tagline}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {ready
              ? `${cityFlats.length} flats across ${city.areas.length} areas — pick a locality to view listings.`
              : "Loading areas…"}
          </p>
        </div>
        <Link
          href={`/listings?city=${encodeURIComponent(city.name)}`}
          className="btn btn-secondary"
        >
          View all in {city.name}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {city.areas.map((area) => {
          const areaFlats = cityFlats.filter((f) => f.area === area.name);
          const available = areaFlats.filter((f) => f.status === "available").length;

          return (
            <Link
              key={area.slug}
              href={areaPath(city.slug, area.slug)}
              className="surface group block p-5 transition duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-2xl group-hover:text-sage-deep">
                  {area.name}
                </h2>
                <span className="text-sage opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100">
                  →
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{area.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`chip ${areaFlats.length ? "chip-sage" : ""}`}>
                  {ready
                    ? areaFlats.length
                      ? `${areaFlats.length} flat${areaFlats.length === 1 ? "" : "s"}`
                      : "No listings yet"
                    : "…"}
                </span>
                {available > 0 && (
                  <span className="chip">{available} available</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
