export type AreaConfig = {
  name: string;
  slug: string;
  blurb: string;
};

export type CityConfig = {
  name: string;
  slug: string;
  tagline: string;
  featured?: boolean;
  areas: AreaConfig[];
};

export const CITIES: CityConfig[] = [
  {
    name: "Bengaluru",
    slug: "bengaluru",
    featured: true,
    tagline: "IT corridors, lakeside pockets, and established neighbourhoods",
    areas: [
      { name: "Whitefield", slug: "whitefield", blurb: "ITPL belt with gated communities" },
      { name: "Koramangala", slug: "koramangala", blurb: "Central living near startups & cafes" },
      { name: "Indiranagar", slug: "indiranagar", blurb: "Metro-linked, premium residential" },
      { name: "HSR Layout", slug: "hsr-layout", blurb: "Planned layout with family homes" },
      { name: "Jayanagar", slug: "jayanagar", blurb: "Classic South Bengaluru locality" },
      { name: "Electronic City", slug: "electronic-city", blurb: "Tech parks and newer towers" },
      { name: "Hebbal", slug: "hebbal", blurb: "North Bengaluru with lake views" },
      { name: "Yelahanka", slug: "yelahanka", blurb: "Airport-side expanding suburb" },
      { name: "Sarjapur Road", slug: "sarjapur-road", blurb: "ORR stretch with new launches" },
      { name: "Marathahalli", slug: "marathahalli", blurb: "Outer Ring Road connectivity" },
      { name: "JP Nagar", slug: "jp-nagar", blurb: "South-side residential favourite" },
      { name: "Bellandur", slug: "bellandur", blurb: "ORR & lake-proximate apartments" },
    ],
  },
  {
    name: "Mumbai",
    slug: "mumbai",
    tagline: "Coastal towers and established suburbs",
    areas: [
      { name: "Powai", slug: "powai", blurb: "Lake-facing residential pockets" },
      { name: "Andheri West", slug: "andheri-west", blurb: "Metro & airport access" },
      { name: "Bandra", slug: "bandra", blurb: "Prime west Mumbai living" },
      { name: "Thane", slug: "thane", blurb: "Family-friendly satellite city" },
    ],
  },
  {
    name: "Hyderabad",
    slug: "hyderabad",
    tagline: "Financial district and growing corridors",
    areas: [
      { name: "Gachibowli", slug: "gachibowli", blurb: "IT & financial hub" },
      { name: "Madhapur", slug: "madhapur", blurb: "Hitech City neighbourhood" },
      { name: "Kondapur", slug: "kondapur", blurb: "Residential near Cyberabad" },
      { name: "Banjara Hills", slug: "banjara-hills", blurb: "Premium central locality" },
    ],
  },
  {
    name: "Pune",
    slug: "pune",
    tagline: "IT parks and calm residential belts",
    areas: [
      { name: "Wakad", slug: "wakad", blurb: "Hinjewadi-adjacent living" },
      { name: "Baner", slug: "baner", blurb: "North Pune lifestyle hub" },
      { name: "Kharadi", slug: "kharadi", blurb: "East Pune IT corridor" },
      { name: "Hinjewadi", slug: "hinjewadi", blurb: "Close to major tech parks" },
    ],
  },
  {
    name: "Chennai",
    slug: "chennai",
    tagline: "OMR corridor and established city areas",
    areas: [
      { name: "Sholinganallur", slug: "sholinganallur", blurb: "OMR IT stretch" },
      { name: "Velachery", slug: "velachery", blurb: "South Chennai connectivity" },
      { name: "Adyar", slug: "adyar", blurb: "Leafy premium neighbourhood" },
      { name: "Anna Nagar", slug: "anna-nagar", blurb: "Planned west Chennai locality" },
    ],
  },
  {
    name: "Gurugram",
    slug: "gurugram",
    tagline: "Golf course road and sector living",
    areas: [
      { name: "Sector 65", slug: "sector-65", blurb: "Golf Course Extension" },
      { name: "DLF Phase 5", slug: "dlf-phase-5", blurb: "Established DLF pocket" },
      { name: "Sector 49", slug: "sector-49", blurb: "Sohna Road access" },
      { name: "Sector 57", slug: "sector-57", blurb: "Residential sector living" },
    ],
  },
];

export const CITY_OPTIONS = CITIES.map((c) => c.name);

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getCityBySlug(slug: string) {
  return CITIES.find((c) => c.slug === slug);
}

export function getCityByName(name: string) {
  return CITIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function getAreaBySlug(city: CityConfig, areaSlug: string) {
  return city.areas.find((a) => a.slug === areaSlug);
}

export function getAreasForCity(cityName: string) {
  return getCityByName(cityName)?.areas.map((a) => a.name) ?? [];
}

export function cityPath(citySlug: string) {
  return `/explore/${citySlug}`;
}

export function areaPath(citySlug: string, areaSlug: string) {
  return `/explore/${citySlug}/${areaSlug}`;
}
