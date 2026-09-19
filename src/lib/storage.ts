import type { Enquiry, Flat } from "./types";
import { SEED_FLATS } from "./seed";

const FLATS_KEY = "nestora_flats_v2";
const ENQUIRIES_KEY = "nestora_enquiries_v2";
const FAVORITES_KEY = "nestora_favorites_v1";
const AUTH_KEY = "nestora_admin_auth_v1";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function loadFlats(): Flat[] {
  if (!canUseStorage()) return SEED_FLATS;
  try {
    const raw = localStorage.getItem(FLATS_KEY);
    if (!raw) {
      localStorage.setItem(FLATS_KEY, JSON.stringify(SEED_FLATS));
      return SEED_FLATS;
    }
    return JSON.parse(raw) as Flat[];
  } catch {
    return SEED_FLATS;
  }
}

export function saveFlats(flats: Flat[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(FLATS_KEY, JSON.stringify(flats));
}

export function resetFlatsToSeed(): Flat[] {
  if (!canUseStorage()) return SEED_FLATS;
  localStorage.setItem(FLATS_KEY, JSON.stringify(SEED_FLATS));
  return SEED_FLATS;
}

export function loadEnquiries(): Enquiry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(ENQUIRIES_KEY);
    return raw ? (JSON.parse(raw) as Enquiry[]) : [];
  } catch {
    return [];
  }
}

export function saveEnquiries(enquiries: Enquiry[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));
}

export function loadFavorites(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(ids: string[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function isAdminAuthenticated(): boolean {
  if (!canUseStorage()) return false;
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

export function setAdminAuthenticated(value: boolean) {
  if (!canUseStorage()) return;
  if (value) sessionStorage.setItem(AUTH_KEY, "true");
  else sessionStorage.removeItem(AUTH_KEY);
}

export function formatPrice(value: number) {
  let amount = "";
  if (value >= 10000000) {
    amount = `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    amount = `₹${(value / 100000).toFixed(2)} L`;
  } else {
    amount = `₹${value.toLocaleString("en-IN")}`;
  }
  return `Starting from ${amount}`;
}

export function statusLabel(status: Flat["status"]) {
  switch (status) {
    case "available":
      return "Available";
    case "under-offer":
      return "Under Offer";
    case "sold":
      return "Sold";
    default:
      return status;
  }
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
