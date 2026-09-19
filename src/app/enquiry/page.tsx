"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { EnquiryForm } from "@/components/EnquiryForm";
import type { EnquiryIntent } from "@/lib/types";

function EnquiryContent() {
  const searchParams = useSearchParams();
  const flatId = searchParams.get("flat") ?? "";
  const intentParam = searchParams.get("intent");
  const defaultIntent: EnquiryIntent =
    intentParam === "sell" ? "sell" : "buy";

  return (
    <div className="container-shell section-space !pt-10">
      <div className="mb-8 max-w-2xl">
        <p className="chip chip-sage mb-3 w-fit">Nestora marketing desk</p>
        <h1 className="font-display text-5xl">Contact our agent</h1>
        <p className="mt-3 text-ink-soft">
          Nestora is a brokerage. Buyers and sellers both reach our marketing
          agents — we coordinate visits, negotiations, and listing support. You
          do not deal with the other party directly on this site.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/enquiry?intent=buy"
            className={`chip ${defaultIntent === "buy" ? "chip-sage" : ""}`}
          >
            I want to buy
          </Link>
          <Link
            href="/enquiry?intent=sell"
            className={`chip ${defaultIntent === "sell" ? "chip-sage" : ""}`}
          >
            I want to sell
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-3xl">
        <EnquiryForm defaultFlatId={flatId} defaultIntent={defaultIntent} />
      </div>
    </div>
  );
}

export default function EnquiryPage() {
  return (
    <Suspense
      fallback={
        <div className="container-shell section-space">
          <p className="text-ink-soft">Loading agent contact form…</p>
        </div>
      }
    >
      <EnquiryContent />
    </Suspense>
  );
}
