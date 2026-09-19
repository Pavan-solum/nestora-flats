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

export type Flat = {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  carpetArea: number;
  facing: Facing;
  floor: number;
  totalFloors: number;
  ageYears: number;
  furnishing: "Unfurnished" | "Semi-Furnished" | "Fully Furnished";
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
};

export type EnquiryIntent = "buy" | "sell";

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
