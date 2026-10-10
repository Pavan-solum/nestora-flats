import Link from "next/link";
import { EnquiryForm } from "@/components/EnquiryForm";
import {
  googleMapsDirectionsUrl,
  googleMapsEmbedUrl,
  NESTORA_OFFICE,
} from "@/lib/maps";

export default function ContactPage() {
  return (
    <div className="container-shell section-space !pt-10">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-5xl">Contact Nestora</h1>
            <p className="mt-3 text-ink-soft">
              Speak with a Nestora marketing agent for buying, selling, site
              visits, or listing support. We represent both sides of the deal.
            </p>
          </div>
          <div className="surface space-y-4 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">Agent desk</p>
              <p className="mt-1 font-semibold">+91 98765 43210</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">Email</p>
              <p className="mt-1 font-semibold">agents@nestora.demo</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">Hours</p>
              <p className="mt-1 font-semibold">Mon–Sat · 9:30 AM – 7:00 PM</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">Office</p>
              <p className="mt-1 font-semibold">{NESTORA_OFFICE.label}</p>
              <div className="map-actions !mt-3">
                <a
                  href={googleMapsDirectionsUrl(
                    NESTORA_OFFICE.latitude,
                    NESTORA_OFFICE.longitude,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link map-link--solid"
                >
                  View on map
                </a>
                <a
                  href={googleMapsDirectionsUrl(
                    NESTORA_OFFICE.latitude,
                    NESTORA_OFFICE.longitude,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  Get directions
                </a>
              </div>
            </div>
          </div>
          <div className="surface overflow-hidden p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">Office map</p>
            <div className="map-embed mt-3">
              <iframe
                title="Nestora office on Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={googleMapsEmbedUrl(NESTORA_OFFICE.latitude, NESTORA_OFFICE.longitude)}
                allowFullScreen
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/enquiry?intent=buy" className="btn btn-primary">
              Buy a flat
            </Link>
            <Link href="/enquiry?intent=sell" className="btn btn-secondary">
              Sell a flat
            </Link>
          </div>
        </div>
        <EnquiryForm />
      </div>
    </div>
  );
}
