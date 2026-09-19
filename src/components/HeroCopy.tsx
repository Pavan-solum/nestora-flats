"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const quotes = [
  "A Nestora agent walks you from shortlist to keys.",
  "Buyers and sellers meet through Nestora — never alone.",
  "The right flat sits where life already moves.",
  "Sell smarter with a marketing desk that knows the locality.",
];

export function HeroCopy() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % quotes.length);
        setVisible(true);
      }, 350);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-copy relative flex h-full flex-col justify-center py-4">
      <div className="hero-orbit" aria-hidden="true">
        <span className="hero-orbit__ring" />
        <span className="hero-orbit__dot hero-orbit__dot--a" />
        <span className="hero-orbit__dot hero-orbit__dot--b" />
        <span className="hero-orbit__dot hero-orbit__dot--c" />
      </div>

      <div className="relative z-[1] space-y-5 reveal sm:space-y-6">
        <p className="chip chip-sage w-fit">Nestora property brokers</p>

        <div>
          <p className="font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Nestora
          </p>
          <h1 className="mt-3 max-w-lg font-display text-xl leading-snug text-ink-soft sm:text-2xl md:text-3xl lg:text-[2.05rem]">
            Buy or sell flats through a Nestora marketing agent.
          </h1>
        </div>

        <p className="max-w-md text-sm leading-relaxed text-ink-soft sm:text-base md:text-lg">
          Browse curated listings by city and area. When you are ready, contact
          Nestora — our agents connect buyers and sellers and guide every step.
        </p>

        <blockquote className="hero-quote max-w-md">
          <p
            className={`font-display text-lg leading-snug text-sage-deep transition-all duration-300 sm:text-xl md:text-2xl ${
              visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            “{quotes[index]}”
          </p>
          <div className="mt-3 flex gap-1.5" aria-hidden="true">
            {quotes.map((_, i) => (
              <span
                key={quotes[i]}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-sage" : "w-1.5 bg-line"
                }`}
              />
            ))}
          </div>
        </blockquote>

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
