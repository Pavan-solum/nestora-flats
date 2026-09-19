"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ImageGallery } from "@/components/ImageGallery";
import { NearbyPlaces } from "@/components/NearbyPlaces";
import { useApp } from "@/context/AppContext";
import { formatPrice, statusLabel } from "@/lib/storage";

export default function FlatDetailPage() {
  const params = useParams<{ id: string }>();
  const { ready, getFlat, favorites, toggleFavorite } = useApp();
  const flat = getFlat(params.id);

  if (!ready) {
    return (
      <div className="container-shell section-space">
        <p className="text-ink-soft">Loading flat details…</p>
      </div>
    );
  }

  if (!flat) {
    return (
      <div className="container-shell section-space text-center">
        <h1 className="font-display text-4xl">Flat not found</h1>
        <p className="mt-3 text-ink-soft">This listing may have been removed.</p>
        <Link href="/listings" className="btn btn-primary mt-6">
          Back to listings
        </Link>
      </div>
    );
  }

  const liked = favorites.includes(flat.id);

  return (
    <div className="container-shell section-space !pt-10">
      <div className="mb-6 flex flex-col gap-4 sm:gap-5">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className={`chip status-${flat.status}`}>{statusLabel(flat.status)}</span>
            {flat.featured && <span className="chip chip-gold">Featured</span>}
            <span className="chip">{flat.ageYears === 0 ? "New launch" : `${flat.ageYears} yr old`}</span>
          </div>
          <h1 className="font-display max-w-3xl text-3xl leading-tight sm:text-4xl md:text-5xl">
            {flat.title}
          </h1>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">
            {flat.location}, {flat.area}, {flat.city}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="font-display text-3xl text-sage-deep sm:text-4xl">
            {formatPrice(flat.price)}
          </p>
          <div className="mobile-stack w-full sm:w-auto">
            <button
              type="button"
              className="btn btn-secondary btn-full-mobile"
              onClick={() => toggleFavorite(flat.id)}
            >
              {liked ? "Saved ♥" : "Save ♡"}
            </button>
            <Link
              href={`/enquiry?flat=${flat.id}`}
              className="btn btn-primary btn-full-mobile"
            >
              Contact Nestora agent
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <ImageGallery images={flat.images} title={flat.title} />

          <section className="surface p-5 md:p-6">
            <h2 className="font-display text-3xl">About this flat</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{flat.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Bedrooms" value={`${flat.bedrooms} BHK`} />
              <Detail label="Bathrooms" value={String(flat.bathrooms)} />
              <Detail label="Balconies" value={String(flat.balconies)} />
              <Detail label="Facing" value={flat.facing} />
              <Detail label="Carpet area" value={`${flat.carpetArea} sq.ft`} />
              <Detail label="Floor" value={`${flat.floor} / ${flat.totalFloors}`} />
              <Detail label="Furnishing" value={flat.furnishing} />
              <Detail label="Age" value={flat.ageYears === 0 ? "New" : `${flat.ageYears} years`} />
              <Detail label="Status" value={statusLabel(flat.status)} />
            </div>
          </section>

          <section className="surface p-5 md:p-6">
            <h2 className="font-display text-3xl">Amenities available</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {flat.amenities.map((item) => (
                <span key={item} className="chip chip-sage">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <NearbyPlaces title="Nearby schools" places={flat.nearbySchools} />
            <NearbyPlaces title="Nearby colleges" places={flat.nearbyColleges} />
            <NearbyPlaces title="Nearby hospitals" places={flat.nearbyHospitals} />
            <NearbyPlaces title="Transport available" places={flat.nearbyTransport} />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <EnquiryForm defaultFlatId={flat.id} />
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-mist/80 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
