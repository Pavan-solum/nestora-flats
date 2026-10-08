export type Facing =
  | "North"
  | "South"
  | "East"
  | "West"
  | "North-East"
  | "North-West"
  | "South-East"
  | "South-West";

export type FlatStatus = "available" | "sold" | "under-offer";

export type NearbyPlace = {
  name: string;
  distance: string;
};

export type Furnishing = "Unfurnished" | "Semi-Furnished" | "Fully Furnished";

export type SpecField =
  | "bedrooms"
  | "bathrooms"
  | "balconies"
  | "floor"
  | "totalFloors"
  | "ageYears"
  | "furnishing";

export type Flat = {
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
  carpetArea: number | null;
  facing: Facing | null;
  floor: number | null;
  totalFloors: number | null;
  ageYears: number | null;
  furnishing: Furnishing | null;
  amenities: string[];
  nearbySchools: NearbyPlace[];
  nearbyColleges: NearbyPlace[];
  nearbyHospitals: NearbyPlace[];
  nearbyTransport: NearbyPlace[];
  images: string[];
  status: FlatStatus;
  featured: boolean;
  listedAt: string;
  updatedAt: string;
  projectName?: string | null;
  ocCcApproved?: boolean | null;
  khata?: string | null;
  totalUnits?: number | null;
  independentWalls?: boolean | null;
  mapUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type EnquiryIntent = "buy" | "sell";

export const ENQUIRY_STATUSES = [
  "new",
  "follow-up",
  "contacted",
  "visit-scheduled",
  "revisit",
  "visited",
  "negotiating",
  "closed",
  "not-interested",
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  "follow-up": "Follow up",
  contacted: "Contacted",
  "visit-scheduled": "Visit scheduled",
  revisit: "Revisit",
  visited: "Visited",
  negotiating: "Negotiating",
  closed: "Closed",
  "not-interested": "Not interested",
};

export const DATED_FOLLOW_UPS: readonly EnquiryStatus[] = ["follow-up", "visit-scheduled", "revisit"];

export function isEnquiryStatus(value: unknown): value is EnquiryStatus {
  return typeof value === "string" && (ENQUIRY_STATUSES as readonly string[]).includes(value);
}

export function needsFollowUpDate(status: EnquiryStatus) {
  return (DATED_FOLLOW_UPS as readonly string[]).includes(status);
}

export type Enquiry = {
  id: string;
  intent: EnquiryIntent;
  flatId?: string;
  flatTitle?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredVisit?: string;
  city?: string;
  area?: string;
  createdAt: string;
  status?: EnquiryStatus;
  reply?: string;
  followUpAt?: string | null;
};

export type FlatFilters = {
  query: string;
  city: string;
  area: string;
  bedrooms: string;
  facing: string;
  minPrice: string;
  maxPrice: string;
  status: string;
  furnishing: string;
};

export type FlatInput = Omit<Flat, "id" | "listedAt" | "updatedAt">;
