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
  lines.push("Enquire with Prop Nexa Homes.");
  return lines.join("\n");
}

export function hashtagLines(caption: string) {
  return caption
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.split(/\s+/).every((token) => token.startsWith("#")));
}

export function captionWithHashtags(listingText: string, previousCaption: string) {
  const tags = hashtagLines(previousCaption);
  return tags.length ? `${listingText}\n${tags.join("\n")}` : listingText;
}
