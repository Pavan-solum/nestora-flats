import Link from "next/link";
import type { Flat } from "@/lib/types";
import { formatPrice } from "@/lib/storage";

export function HeroCopy({ featured }: { featured?: Flat | null }) {
  if (featured) {
    const facts = [
      featured.carpetArea != null ? `${featured.carpetArea} sq.ft` : null,
      featured.facing ? `${featured.facing} facing` : null,
      featured.ocCcApproved ? "OC CC approved" : null,
      featured.khata,
      featured.totalUnits != null
        ? featured.independentWalls
          ? `${featured.totalUnits} units, independent walls`
          : `${featured.totalUnits} units`
        : null,
    ].filter((item): item is string => Boolean(item));

    return (
      <div className="hero-copy flex h-full flex-col justify-center py-2">
        <div className="space-y-4 sm:space-y-5">
          <p className="chip chip-sage w-fit">Nestora property brokers</p>
          <div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              {featured.projectName || featured.title}
            </h1>
            <p className="mt-3 max-w-lg text-base leading-snug text-ink-soft sm:text-lg">
              {featured.location}, {featured.area}, {featured.city}
            </p>
          </div>
          <p className="font-display text-2xl text-sage-deep sm:text-3xl">
            {formatPrice(featured.price)}
          </p>
          {facts.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {facts.map((fact) => (
                <li key={fact} className="chip">
                  {fact}
                </li>
              ))}
            </ul>
          )}
          <div className="mobile-stack pt-1">
            <Link href={`/flats/${featured.id}`} className="btn btn-primary btn-full-mobile">
              View this flat
            </Link>
            <Link
              href={`/enquiry?flat=${featured.id}`}
              className="btn btn-secondary btn-full-mobile"
            >
              Contact agent
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-copy flex h-full flex-col justify-center py-2">
      <div className="space-y-4 sm:space-y-5">
        <p className="chip chip-sage w-fit">Nestora property brokers</p>
        <div>
          <p className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            Nestora
          </p>
          <h1 className="mt-3 max-w-lg font-display text-xl leading-snug text-ink-soft sm:text-2xl">
            Buy or sell flats through a Nestora marketing agent.
          </h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
          Browse curated listings by city and area. When you are ready, contact
          Nestora — our agents connect buyers and sellers and guide every step.
        </p>
        <div className="mobile-stack pt-1">
          <Link href="/explore/bengaluru" className="btn btn-primary btn-full-mobile">
            Explore Bengaluru
          </Link>
          <Link href="/enquiry" className="btn btn-secondary btn-full-mobile">
            Contact agent
          </Link>
        </div>
      </div>
    </div>
  );
}
