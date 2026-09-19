import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div>
      <section className="container-shell section-space !pt-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="chip chip-sage mb-4">About Nestora</p>
            <h1 className="font-display text-5xl md:text-6xl">
              Your brokerage for buying and selling flats
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Nestora is a property broker platform. Buyers browse curated
              listings; sellers list through our marketing team. Both sides
              contact a Nestora agent — we connect the right matches and guide
              the deal.
            </p>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] shadow-[var(--shadow)]">
            <Image
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
              alt="Apartment exterior"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-line/70 bg-white/60">
        <div className="container-shell grid gap-6 py-12 md:grid-cols-3">
          {[
            {
              title: "For buyers",
              text: "Explore flats by city and area, then contact a Nestora agent for visits, pricing guidance, and negotiation support.",
            },
            {
              title: "For sellers",
              text: "Share your flat details with our marketing desk. Nestora agents list, promote, and connect you with serious buyers.",
            },
            {
              title: "For Nestora agents",
              text: "Manage inventory, update listing status, and track buyer/seller leads from one admin desk.",
            },
          ].map((item) => (
            <div key={item.title} className="surface p-5">
              <h2 className="font-display text-2xl">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell section-space text-center">
        <h2 className="font-display text-4xl">Talk to Nestora</h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">
          Ready to buy or sell? Reach a marketing agent and we will take it from
          there.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/enquiry?intent=buy" className="btn btn-primary">
            Buy with Nestora
          </Link>
          <Link href="/enquiry?intent=sell" className="btn btn-secondary">
            Sell with Nestora
          </Link>
        </div>
      </section>
    </div>
  );
}
