"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { CITIES, cityPath } from "@/lib/locations";

export default function ExplorePage() {
  const { flats, ready } = useApp();

  return (
    <div className="container-shell section-space !pt-10">
      <div className="mb-10 max-w-2xl">
        <p className="chip chip-sage mb-3 w-fit">Browse by location</p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl">Choose a city</h1>
        <p className="mt-3 text-ink-soft">
          Start with the city, then pick a neighbourhood to see flats Nestora is
          marketing. Bengaluru is featured with major residential areas. Ready
          to buy or sell? Contact a Nestora agent.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CITIES.map((city) => {
          const count = flats.filter((f) => f.city === city.name).length;
          const available = flats.filter(
            (f) => f.city === city.name && f.status === "available",
          ).length;

          return (
            <Link
              key={city.slug}
              href={cityPath(city.slug)}
              className={`surface group block p-6 transition duration-300 hover:-translate-y-1 ${
                city.featured ? "ring-2 ring-sage/30" : ""
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-3xl group-hover:text-sage-deep">
                    {city.name}
                  </h2>
                  {city.featured && (
                    <span className="chip chip-gold mt-2">Primary city</span>
                  )}
                </div>
                <span className="text-2xl text-sage transition group-hover:translate-x-1">
                  →
                </span>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{city.tagline}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                <span className="chip">
                  {ready ? `${city.areas.length} areas` : "…"}
                </span>
                <span className="chip chip-sage">
                  {ready ? `${count} flats` : "…"}
                </span>
                <span className="chip">
                  {ready ? `${available} available` : "…"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
