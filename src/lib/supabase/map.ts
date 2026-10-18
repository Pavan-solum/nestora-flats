import { isEnquiryStatus, type Enquiry, type Flat, type Furnishing, type SpecField } from "@/lib/types";

export const BUCKET = "flat-images";
export const EXTRAS_PATH = "meta/extras.json";
export const FOLLOWUPS_PATH = "meta/enquiry-followups.json";

export const CATALOG_COLUMNS = [
  "id",
  "title",
  "description",
  "price",
  "location",
  "city",
  "area",
  "bedrooms",
  "bathrooms",
  "balconies",
  "carpet_area",
  "facing",
  "floor",
  "total_floors",
  "age_years",
  "furnishing",
  "amenities",
  "images",
  "status",
  "featured",
  "listed_at",
  "updated_at",
  "project_name",
  "oc_cc_approved",
  "khata",
  "total_units",
  "independent_walls",
  "map_url",
  "latitude",
  "longitude",
].join(", ");

export const NEARBY_COLUMNS =
  "id, nearby_schools, nearby_colleges, nearby_hospitals, nearby_transport, map_url, latitude, longitude";

export function bucketObjectPath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index < 0) return null;
  const path = url.slice(index + marker.length).split("?")[0];
  if (!path || path.startsWith("meta/")) return null;
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

export type FlatExtra = {
  projectName?: string | null;
  ocCcApproved?: boolean | null;
  khata?: string | null;
  totalUnits?: number | null;
  independentWalls?: boolean | null;
  mapUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  omitSpecs?: SpecField[];
};

const SPEC_FIELDS: SpecField[] = [
  "bedrooms",
  "bathrooms",
  "balconies",
  "floor",
  "totalFloors",
  "ageYears",
  "furnishing",
];

type FlatRow = {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  area: string;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  carpet_area: number | null;
  facing: Flat["facing"];
  floor: number | null;
  total_floors: number | null;
  age_years: number | null;
  furnishing: Furnishing | null;
  amenities: string[] | null;
  nearby_schools: Flat["nearbySchools"] | null;
  nearby_colleges: Flat["nearbyColleges"] | null;
  nearby_hospitals: Flat["nearbyHospitals"] | null;
  nearby_transport: Flat["nearbyTransport"] | null;
  images: string[] | null;
  status: Flat["status"];
  featured: boolean;
  listed_at: string;
  updated_at: string;
  project_name?: string | null;
  oc_cc_approved?: boolean | null;
  khata?: string | null;
  total_units?: number | null;
  independent_walls?: boolean | null;
  map_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type EnquiryRow = {
  id: string;
  intent: Enquiry["intent"];
  flat_id: string | null;
  flat_title: string | null;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferred_visit: string | null;
  city: string | null;
  area: string | null;
  created_at: string;
  status?: string | null;
  reply?: string | null;
  follow_up_at?: string | null;
};

export function rowToFlat(row: FlatRow): Flat {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    location: row.location,
    city: row.city,
    area: row.area,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    balconies: row.balconies,
    carpetArea: row.carpet_area,
    facing: row.facing,
    floor: row.floor,
    totalFloors: row.total_floors,
    ageYears: row.age_years,
    furnishing: row.furnishing,
    amenities: row.amenities ?? [],
    nearbySchools: row.nearby_schools ?? [],
    nearbyColleges: row.nearby_colleges ?? [],
    nearbyHospitals: row.nearby_hospitals ?? [],
    nearbyTransport: row.nearby_transport ?? [],
    images: row.images ?? [],
    status: row.status,
    featured: row.featured,
    listedAt: row.listed_at,
    updatedAt: row.updated_at,
    projectName: row.project_name ?? null,
    ocCcApproved: row.oc_cc_approved ?? null,
    khata: row.khata ?? null,
    totalUnits: row.total_units ?? null,
    independentWalls: row.independent_walls ?? null,
    mapUrl: row.map_url ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
  };
}

export function applyExtra(flat: Flat, extra: FlatExtra | undefined): Flat {
  if (!extra) return flat;
  const next: Flat = { ...flat };
  if (extra.projectName) next.projectName = extra.projectName;
  if (extra.ocCcApproved != null) next.ocCcApproved = extra.ocCcApproved;
  if (extra.khata) next.khata = extra.khata;
  if (extra.totalUnits != null) next.totalUnits = extra.totalUnits;
  if (extra.independentWalls != null) next.independentWalls = extra.independentWalls;
  if (extra.mapUrl) next.mapUrl = extra.mapUrl;
  if (extra.latitude != null) next.latitude = extra.latitude;
  if (extra.longitude != null) next.longitude = extra.longitude;
  for (const field of extra.omitSpecs ?? []) {
    if (field === "furnishing") next.furnishing = null;
    else next[field] = null;
  }
  return next;
}

export function extraFromFlat(flat: Flat): FlatExtra | null {
  const omitSpecs = SPEC_FIELDS.filter((field) => flat[field] == null);
  const hasFacts =
    Boolean(flat.projectName) ||
    flat.ocCcApproved != null ||
    Boolean(flat.khata) ||
    flat.totalUnits != null ||
    flat.independentWalls != null ||
    Boolean(flat.mapUrl) ||
    flat.latitude != null ||
    flat.longitude != null;
  if (!hasFacts && omitSpecs.length === 0) return null;
  return {
    projectName: flat.projectName ?? null,
    ocCcApproved: flat.ocCcApproved ?? null,
    khata: flat.khata ?? null,
    totalUnits: flat.totalUnits ?? null,
    independentWalls: flat.independentWalls ?? null,
    mapUrl: flat.mapUrl ?? null,
    latitude: flat.latitude ?? null,
    longitude: flat.longitude ?? null,
    omitSpecs,
  };
}

export function flatToRow(flat: Flat, includeExtraColumns: boolean) {
  const row: Record<string, unknown> = {
    id: flat.id,
    title: flat.title,
    description: flat.description,
    price: flat.price,
    location: flat.location,
    city: flat.city,
    area: flat.area,
    bedrooms: flat.bedrooms ?? 0,
    bathrooms: flat.bathrooms ?? 0,
    balconies: flat.balconies ?? 0,
    carpet_area: flat.carpetArea ?? 0,
    facing: flat.facing ?? "East",
    floor: flat.floor ?? 0,
    total_floors: flat.totalFloors ?? 0,
    age_years: flat.ageYears ?? 0,
    furnishing: flat.furnishing ?? "Unfurnished",
    amenities: flat.amenities,
    nearby_schools: flat.nearbySchools,
    nearby_colleges: flat.nearbyColleges,
    nearby_hospitals: flat.nearbyHospitals,
    nearby_transport: flat.nearbyTransport,
    images: flat.images,
    status: flat.status,
    featured: flat.featured,
    listed_at: flat.listedAt,
    updated_at: flat.updatedAt,
  };
  if (includeExtraColumns) {
    row.project_name = flat.projectName ?? null;
    row.oc_cc_approved = flat.ocCcApproved ?? null;
    row.khata = flat.khata ?? null;
    row.total_units = flat.totalUnits ?? null;
    row.independent_walls = flat.independentWalls ?? null;
    row.map_url = flat.mapUrl ?? null;
    row.latitude = flat.latitude ?? null;
    row.longitude = flat.longitude ?? null;
  }
  return row;
}

export function rowToEnquiry(row: EnquiryRow): Enquiry {
  return {
    id: row.id,
    intent: row.intent,
    flatId: row.flat_id ?? undefined,
    flatTitle: row.flat_title ?? undefined,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    preferredVisit: row.preferred_visit ?? undefined,
    city: row.city ?? undefined,
    area: row.area ?? undefined,
    createdAt: row.created_at,
    status: isEnquiryStatus(row.status) ? row.status : "new",
    reply: row.reply ?? "",
    followUpAt: row.follow_up_at ?? null,
  };
}

export function enquiryToRow(enquiry: Enquiry) {
  return {
    id: enquiry.id,
    intent: enquiry.intent,
    flat_id: enquiry.flatId ?? null,
    flat_title: enquiry.flatTitle ?? null,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    message: enquiry.message,
    preferred_visit: enquiry.preferredVisit ?? null,
    city: enquiry.city ?? null,
    area: enquiry.area ?? null,
    created_at: enquiry.createdAt,
  };
}
