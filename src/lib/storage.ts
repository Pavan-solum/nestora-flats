import type { Flat } from "./types";

const FAVORITES_KEY = "nestora_favorites_v1";

function canUseStorage() {
  return typeof window !== "undefined";
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
