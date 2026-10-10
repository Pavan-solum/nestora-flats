import type { Flat } from "@/lib/types";

type MapFields = Pick<
  Flat,
  "mapUrl" | "latitude" | "longitude" | "location" | "title" | "city" | "area"
>;

export function hasMapLocation(flat: MapFields) {
  const url = flat.mapUrl?.trim();
  if (url) return true;
  return flat.latitude != null && flat.longitude != null;
}

/** Opens in Google Maps (new tab). */
export function externalMapUrl(flat: MapFields): string | null {
  const raw = flat.mapUrl?.trim();
  if (raw) {
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw.replace(/^\/\//, "")}`;
  }
  if (flat.latitude == null || flat.longitude == null) return null;
  const { latitude, longitude } = flat;
  const label = [flat.location, flat.area, flat.city].filter(Boolean).join(", ");
  const query = encodeURIComponent(label || `${latitude},${longitude}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function googleMapsEmbedUrl(latitude: number, longitude: number) {
  return `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&hl=en&output=embed`;
}

export function googleMapsDirectionsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

/** Nestora office — MG Road, Bengaluru (contact page). */
export const NESTORA_OFFICE = {
  latitude: 12.9758,
  longitude: 77.6064,
  label: "Horizon Plaza, MG Road, Bengaluru",
} as const;
