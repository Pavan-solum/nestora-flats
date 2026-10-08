export type FieldErrors = Partial<Record<string, string>>;

const NON_NEGATIVE_FIELDS = [
  ["bedrooms", "Bedrooms"],
  ["bathrooms", "Bathrooms"],
  ["balconies", "Balconies"],
  ["carpetArea", "Carpet area"],
  ["floor", "Floor"],
  ["totalFloors", "Total floors"],
  ["ageYears", "Age"],
  ["totalUnits", "Total units"],
] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return null;
}

function nonNegativeMessage(value: unknown, label: string) {
  if (value == null || value === "") return null;
  const number = asNumber(value);
  if (number == null || !Number.isFinite(number) || number < 0) {
    return `${label} must be blank or a number that is 0 or greater.`;
  }
  return null;
}

export function firstFieldError(errors: FieldErrors) {
  return Object.values(errors).find((message) => Boolean(message)) ?? null;
}

export function validateFlatInput(input: {
  title?: string | null;
  price?: unknown;
  city?: string | null;
  area?: string | null;
  bedrooms?: unknown;
  bathrooms?: unknown;
  balconies?: unknown;
  carpetArea?: unknown;
  floor?: unknown;
  totalFloors?: unknown;
  ageYears?: unknown;
  totalUnits?: unknown;
  latitude?: unknown;
  longitude?: unknown;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.title?.trim()) errors.title = "Title is required.";
  const price = asNumber(input.price);
  if (price == null || !Number.isFinite(price) || price <= 0) {
    errors.price = "Starting price must be greater than 0.";
  }
  if (!input.city?.trim()) errors.city = "City is required.";
  if (!input.area?.trim()) errors.area = "Area is required.";

  for (const [key, label] of NON_NEGATIVE_FIELDS) {
    const message = nonNegativeMessage(input[key], label);
    if (message) errors[key] = message;
  }

  for (const key of ["latitude", "longitude"] as const) {
    const value = input[key];
    if (value == null || value === "") continue;
    const number = asNumber(value);
    if (number == null || !Number.isFinite(number)) errors[key] = "Enter a valid number.";
  }

  return errors;
}

export function validateEnquiry(input: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  intent?: string | null;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.name?.trim()) errors.name = "Name is required.";
  if (!input.email?.trim() || !EMAIL.test(input.email.trim())) {
    errors.email = "Enter a valid email.";
  }
  const digits = (input.phone ?? "").replace(/\D/g, "");
  if (digits.length < 8) errors.phone = "Enter a phone number with at least 8 digits.";
  if (!input.message?.trim()) errors.message = "Message is required.";
  if (input.intent !== "buy" && input.intent !== "sell") {
    errors.intent = "Intent must be buy or sell.";
  }
  return errors;
}
