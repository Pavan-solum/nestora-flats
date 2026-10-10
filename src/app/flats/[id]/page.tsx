"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ImageGallery } from "@/components/ImageGallery";
import { NearbyPlaces } from "@/components/NearbyPlaces";
import { FlatSkeleton } from "@/components/Skeletons";
import { useApp } from "@/context/AppContext";
import { formatPrice, statusLabel } from "@/lib/storage";
import {
  externalMapUrl,
  googleMapsDirectionsUrl,
  googleMapsEmbedUrl,
  hasMapLocation,
} from "@/lib/maps";

export default function FlatDetailPage() {
  const params = useParams<{ id: string }>();
  const { ready, getFlat, favorites, toggleFavorite, ensureFlatDetails } = useApp();
  const flat = getFlat(params.id);
  const [detailsReady, setDetailsReady] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setDetailsReady(false);
    void ensureFlatDetails(params.id).finally(() => {
      if (!cancelled) setDetailsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, params.id, ensureFlatDetails]);

  if (!ready || !detailsReady) return <FlatSkeleton />;

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
  const showMap = hasMapLocation(flat);
  const mapHref = showMap ? externalMapUrl(flat) : null;
  const canEmbed =
    flat.latitude != null && flat.longitude != null;

  const scan = [
    flat.area,
    flat.facing ? `${flat.facing} facing` : null,
    flat.ocCcApproved ? "OC CC approved" : null,
    flat.khata,
    flat.totalUnits != null
      ? flat.independentWalls
        ? `${flat.totalUnits} units, independent walls`
        : `${flat.totalUnits} units`
      : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="container-shell section-space !pt-8 pb-28 lg:pb-10">
      <div className="mb-6 flex flex-col gap-4 sm:gap-5">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className={`chip status-${flat.status}`}>{statusLabel(flat.status)}</span>
            {flat.featured && <span className="chip chip-gold">Featured</span>}
            {flat.projectName && <span className="chip chip-sage">{flat.projectName}</span>}
            {flat.ageYears != null && (
              <span className="chip">
                {flat.ageYears === 0 ? "New launch" : `${flat.ageYears} yr old`}
              </span>
            )}
          </div>
          <h1 className="font-display max-w-3xl text-3xl leading-tight sm:text-4xl">
            {flat.title}
          </h1>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">
            {flat.location}, {flat.area}, {flat.city}
          </p>
          {showMap && mapHref && (
            <div className="map-actions">
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="map-link map-link--solid"
              >
                View on map
              </a>
              {canEmbed && (
                <a
                  href={googleMapsDirectionsUrl(flat.latitude!, flat.longitude!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  Get directions
                </a>
              )}
            </div>
          )}
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
        <div className="min-w-0 space-y-8">
          <ImageGallery images={flat.images} title={flat.title} />

          {canEmbed && (
            <section className="surface overflow-hidden p-4 md:p-5">
              <h2 className="font-display text-xl sm:text-2xl">Location</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {flat.location}, {flat.area}, {flat.city}
              </p>
              <div className="map-embed mt-4">
                <iframe
                  title={`Map — ${flat.title}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={googleMapsEmbedUrl(flat.latitude!, flat.longitude!)}
                  allowFullScreen
                />
              </div>
              {mapHref && (
                <div className="map-actions !mt-4">
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    Open in Google Maps
                  </a>
                </div>
              )}
            </section>
          )}

          <section className="surface p-5 md:p-6">
            {scan.length > 0 && (
              <ul className="mb-5 flex flex-wrap gap-2">
                {scan.map((item) => (
                  <li key={item} className="chip chip-sage">
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <h2 className="font-display text-2xl sm:text-3xl">About this flat</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{flat.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {flat.bedrooms != null && <Detail label="Bedrooms" value={`${flat.bedrooms} BHK`} />}
              {flat.bathrooms != null && <Detail label="Bathrooms" value={String(flat.bathrooms)} />}
              {flat.balconies != null && <Detail label="Balconies" value={String(flat.balconies)} />}
              {flat.facing && <Detail label="Facing" value={flat.facing} />}
              {flat.carpetArea != null && (
                <Detail label="Carpet area" value={`${flat.carpetArea} sq.ft`} />
              )}
              {flat.floor != null && flat.totalFloors != null && (
                <Detail label="Floor" value={`${flat.floor} / ${flat.totalFloors}`} />
              )}
              {flat.furnishing && <Detail label="Furnishing" value={flat.furnishing} />}
              {flat.ageYears != null && (
                <Detail
                  label="Age"
                  value={flat.ageYears === 0 ? "New" : `${flat.ageYears} years`}
                />
              )}
              {flat.ocCcApproved && <Detail label="Approval" value="OC CC Approved" />}
              {flat.khata && <Detail label="Khata" value={flat.khata} />}
              {flat.totalUnits != null && (
                <Detail
                  label="Units"
                  value={
                    flat.independentWalls
                      ? `${flat.totalUnits} units, all independent walls`
                      : String(flat.totalUnits)
                  }
                />
              )}
              {flat.independentWalls && flat.totalUnits == null && (
                <Detail label="Walls" value="Independent walls" />
              )}
              <Detail label="Status" value={statusLabel(flat.status)} />
            </div>
          </section>

          <section className="surface p-5 md:p-6">
            <h2 className="font-display text-2xl sm:text-3xl">Amenities available</h2>
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

      <div className="contact-bar lg:hidden">
        <p className="min-w-0 font-display text-lg leading-tight text-sage-deep sm:text-xl">
          {formatPrice(flat.price)}
        </p>
        <Link href={`/enquiry?flat=${flat.id}`} className="btn btn-primary shrink-0 !px-4 !py-2.5 text-sm">
          Contact agent
        </Link>
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
