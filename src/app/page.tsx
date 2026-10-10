"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FlatCard } from "@/components/FlatCard";
import { HeroCopy } from "@/components/HeroCopy";
import { ListingImage } from "@/components/ListingImage";
import { HomeSkeleton } from "@/components/Skeletons";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/storage";
import { areaPath, getCityBySlug } from "@/lib/locations";

const MARS_ID = "flat-mars-mount";

const features = [
  {
    title: "City → area discovery",
    text: "Start with a city like Bengaluru, then open key localities to see flats Nestora is marketing.",
  },
  {
    title: "Buyer agent support",
    text: "Shortlist homes, then contact a Nestora agent for visits, pricing guidance, and deal support.",
  },
  {
    title: "Seller marketing desk",
    text: "Sellers reach Nestora to list flats — our agents promote inventory and connect serious buyers.",
  },
  {
    title: "Brokered introductions",
    text: "Buyers and sellers both deal with Nestora. We coordinate introductions.",
  },
  {
    title: "Rich listing details",
    text: "Facing, amenities, nearby schools, colleges, hospitals, and transport for confident decisions.",
  },
  {
    title: "Agent inventory admin",
    text: "Nestora staff update new and older flats, mark under-offer or sold, and track buy/sell leads.",
  },
];

const areaNames = ["JP Nagar", "Whitefield", "Koramangala", "Indiranagar", "HSR Layout"];
const bengaluru = getCityBySlug("bengaluru");

export default function HomePage() {
  const { ready, flats } = useApp();
  const mars = useMemo(() => flats.find((flat) => flat.id === MARS_ID) ?? null, [flats]);
  const others = useMemo(() => {
    const pool = flats.filter((flat) => flat.id !== MARS_ID && flat.status !== "sold");
    const featured = pool.filter((flat) => flat.featured);
    const rest = pool.filter((flat) => !flat.featured);
    return [...featured, ...rest].slice(0, 3);
  }, [flats]);
  const heroImage = mars?.images[0];
  const secondaryImage = mars?.images[1] ?? mars?.images[0];

  if (!ready) return <HomeSkeleton />;

  return (
    <div>
      <section className="container-shell hero-grid section-space !pt-6 !pb-8 sm:!pt-8 sm:!pb-10">
        <HeroCopy featured={mars} />

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] shadow-[var(--shadow)] sm:rounded-[2rem] md:aspect-[5/6]">
            {mars ? (
              <ListingImage
                src={heroImage}
                alt={`${mars.title} interior`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 45vw"
              />
            ) : (
              <div className="absolute inset-0 bg-mist" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#14212b]/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="text-sm uppercase tracking-[0.16em] text-gold-soft">
                {mars ? "Featured home" : "Featured lifestyle"}
              </p>
              <p className="mt-1 font-display text-2xl sm:text-3xl">
                {mars ? mars.title : "Homes that feel finished"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line/70 bg-white">
        <div className="container-shell grid gap-6 py-6 sm:grid-cols-3 sm:py-8">
          {mars ? (
            <>
              <Stat label="Mars Mount" value={ready ? formatPrice(mars.price) : "—"} />
              <Stat
                label="Carpet area"
                value={ready && mars.carpetArea != null ? `${mars.carpetArea} sq.ft` : "—"}
              />
              <Stat
                label="Units"
                value={ready && mars.totalUnits != null ? String(mars.totalUnits) : "—"}
              />
            </>
          ) : (
            <>
              <Stat
                label="Available"
                value={ready ? String(flats.filter((flat) => flat.status === "available").length) : "—"}
              />
              <Stat
                label="Cities covered"
                value={ready ? String(new Set(flats.map((flat) => flat.city)).size) : "—"}
              />
            </>
          )}
        </div>
      </section>

      <section className="container-shell section-space">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">More listings</h2>
            <p className="mt-2 text-ink-soft">Other homes Nestora is marketing.</p>
          </div>
          <Link href="/listings" className="btn btn-secondary">
            View all listings
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {others.map((flat) => (
            <FlatCard key={flat.id} flat={flat} />
          ))}
        </div>
      </section>

      <section className="bg-[#14212b] text-white">
        <div className="container-shell section-space">
          <div className="mb-8 max-w-2xl sm:mb-10">
            <h2 className="font-display text-3xl sm:text-4xl">How Nestora brokerage works</h2>
            <p className="mt-3 text-white/70">
              We market flats, advise buyers and sellers, and keep every
              conversation with a Nestora agent.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p className="text-sm font-semibold text-gold-soft">0{index + 1}</p>
                <h3 className="mt-2 font-display text-2xl">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell section-space !pt-8">
        <div className="surface overflow-hidden p-5 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-8 md:p-8">
          <div>
            <p className="chip chip-sage mb-3 w-fit">Browse by location</p>
            <h2 className="font-display text-3xl sm:text-4xl">City first, then your area</h2>
            <p className="mt-3 max-w-xl text-ink-soft">
              Pick Bengaluru or another city, choose a neighbourhood, and view
              flats Nestora is marketing there. Ready to move? Contact our agent.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/explore/bengaluru/jp-nagar" className="btn btn-primary">
                JP Nagar
              </Link>
              <Link href="/explore/bengaluru" className="btn btn-secondary">
                Bengaluru areas
              </Link>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:mt-0">
            {areaNames.map((name) => {
              const area = bengaluru?.areas.find((item) => item.name === name);
              const href = area
                ? areaPath("bengaluru", area.slug)
                : `/explore/bengaluru/${name.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <Link
                  key={name}
                  href={href}
                  className="cursor-pointer rounded-2xl border border-line bg-mist/70 px-4 py-4 text-sm font-semibold transition hover:border-sage hover:bg-white"
                >
                  {name}
                  <span className="mt-1 block text-xs font-normal text-ink-soft">Bengaluru</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-shell section-space !pt-0">
        <div className="surface overflow-hidden md:grid md:grid-cols-2">
          <div className="relative min-h-[220px] sm:min-h-[260px]">
            {mars ? (
              <ListingImage
                src={secondaryImage}
                alt="Mars Mount interior"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-mist" />
            )}
          </div>
          <div className="space-y-4 p-5 md:p-10">
            <h2 className="font-display text-3xl sm:text-4xl">Selling your flat?</h2>
            <p className="text-ink-soft">
              Contact a Nestora marketing agent. We list your home, promote it
              to buyers, and coordinate the deal.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/enquiry?intent=sell" className="btn btn-primary">
                Sell with Nestora
              </Link>
              <Link href="/admin/login" className="btn btn-secondary">
                Agent admin
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-3xl sm:text-4xl">{value}</p>
    </div>
  );
}
