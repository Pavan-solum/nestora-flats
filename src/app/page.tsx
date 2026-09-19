"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { FlatCard } from "@/components/FlatCard";
import { HeroCopy } from "@/components/HeroCopy";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/storage";

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
    title: "Brokered, not peer-to-peer",
    text: "Buyers and sellers both deal with Nestora. We coordinate introductions — no direct public contact.",
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

export default function HomePage() {
  const { ready, flats } = useApp();
  const featured = useMemo(
    () => flats.filter((f) => f.featured && f.status !== "sold").slice(0, 3),
    [flats],
  );
  const availableCount = flats.filter((f) => f.status === "available").length;
  const cities = new Set(flats.map((f) => f.city)).size;
  const avgPrice =
    flats.length > 0
      ? Math.round(flats.reduce((sum, f) => sum + f.price, 0) / flats.length)
      : 0;

  return (
    <div>
      <section className="container-shell hero-grid section-space !pt-8 !pb-14">
        <HeroCopy />

        <div className="relative reveal floaty">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[var(--shadow)] md:aspect-[5/6]">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80"
              alt="Modern flat living room"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 900px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14212b]/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="text-sm uppercase tracking-[0.16em] text-gold-soft">
                Featured lifestyle
              </p>
              <p className="mt-1 font-display text-3xl">Homes that feel finished</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line/70 bg-white/55">
        <div className="container-shell grid gap-6 py-8 sm:grid-cols-3">
          <div>
            <p className="text-sm uppercase tracking-[0.14em] text-ink-soft">Available</p>
            <p className="mt-1 font-display text-4xl">{ready ? availableCount : "—"}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.14em] text-ink-soft">Cities covered</p>
            <p className="mt-1 font-display text-4xl">{ready ? cities : "—"}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.14em] text-ink-soft">Avg. starting from</p>
            <p className="mt-1 font-display text-4xl">
              {ready ? formatPrice(avgPrice) : "—"}
            </p>
          </div>
        </div>
      </section>

      <section className="container-shell section-space">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl">Featured flats</h2>
            <p className="mt-2 text-ink-soft">Handpicked homes ready for viewing.</p>
          </div>
          <Link href="/listings" className="btn btn-secondary">
            View all listings
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((flat) => (
            <FlatCard key={flat.id} flat={flat} />
          ))}
        </div>
      </section>

      <section className="bg-[#14212b] text-white">
        <div className="container-shell section-space">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-4xl">How Nestora brokerage works</h2>
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
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <p className="text-gold-soft text-sm font-semibold">0{index + 1}</p>
                <h3 className="mt-2 font-display text-2xl">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell section-space !pt-0">
        <div className="surface overflow-hidden p-6 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-8 md:p-8">
          <div>
            <p className="chip chip-sage mb-3 w-fit">Browse by location</p>
            <h2 className="font-display text-3xl md:text-4xl">
              City first, then your area
            </h2>
            <p className="mt-3 max-w-xl text-ink-soft">
              Pick Bengaluru or another city, choose a neighbourhood, and view
              flats Nestora is marketing there. Ready to move? Contact our agent.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/explore/bengaluru" className="btn btn-primary">
                Bengaluru areas
              </Link>
              <Link href="/explore" className="btn btn-secondary">
                All cities
              </Link>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:mt-0">
            {["Whitefield", "Koramangala", "Indiranagar", "HSR Layout"].map(
              (area) => (
                <Link
                  key={area}
                  href={`/explore/bengaluru/${area.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rounded-2xl border border-line bg-mist/70 px-4 py-4 text-sm font-semibold transition hover:border-sage hover:bg-white"
                >
                  {area}
                  <span className="mt-1 block text-xs font-normal text-ink-soft">
                    Bengaluru
                  </span>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="container-shell section-space">
        <div className="surface overflow-hidden md:grid md:grid-cols-2">
          <div className="relative min-h-[260px]">
            <Image
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80"
              alt="Apartment interior"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-4 p-6 md:p-10">
            <h2 className="font-display text-4xl">Selling your flat?</h2>
            <p className="text-ink-soft">
              Contact a Nestora marketing agent. We list your home, promote it
              to buyers, and coordinate the deal — you stay with Nestora, not
              random enquiries.
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
