import { formatPrice } from "@/lib/storage";

export function listingCaption(flat: {
  title: string;
  price: number;
  area: string;
  city: string;
  amenities?: string[];
}) {
  const place = [flat.area, flat.city].filter(Boolean).join(", ");
  const amenities = (flat.amenities ?? []).slice(0, 4).join(", ");
  const lines = [[flat.title, formatPrice(flat.price), place].filter(Boolean).join(" · ")];
  if (amenities) lines.push(amenities);
  lines.push("Enquire with Nestora.");
  return lines.join("\n");
}
