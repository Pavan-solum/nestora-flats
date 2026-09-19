import type { FlatFilters, Flat } from "@/lib/types";

export const emptyFilters: FlatFilters = {
  query: "",
  city: "",
  area: "",
  bedrooms: "",
  facing: "",
  minPrice: "",
  maxPrice: "",
  status: "",
  furnishing: "",
};

export function filterFlats(flats: Flat[], filters: FlatFilters) {
  const q = filters.query.trim().toLowerCase();
  return flats.filter((flat) => {
    if (filters.city && flat.city !== filters.city) return false;
    if (filters.area && flat.area !== filters.area) return false;
    if (filters.bedrooms && flat.bedrooms !== Number(filters.bedrooms)) return false;
    if (filters.facing && flat.facing !== filters.facing) return false;
    if (filters.status && flat.status !== filters.status) return false;
    if (filters.furnishing && flat.furnishing !== filters.furnishing) return false;
    if (filters.minPrice && flat.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && flat.price > Number(filters.maxPrice)) return false;
    if (q) {
      const hay = [
        flat.title,
        flat.description,
        flat.city,
        flat.area,
        flat.location,
        flat.facing,
        ...flat.amenities,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
