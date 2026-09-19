"use client";

import type { FlatFilters } from "@/lib/types";
import { FACING_OPTIONS } from "@/lib/seed";
import { CITY_OPTIONS, getAreasForCity } from "@/lib/locations";

type Props = {
  filters: FlatFilters;
  onChange: (next: FlatFilters) => void;
  onReset: () => void;
};

export function FlatFilters({ filters, onChange, onReset }: Props) {
  const areas = filters.city ? getAreasForCity(filters.city) : [];

  const set = (key: keyof FlatFilters, value: string) => {
    if (key === "city") {
      onChange({ ...filters, city: value, area: "" });
      return;
    }
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="surface p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl">Filter flats</h2>
        <button type="button" className="btn btn-ghost !px-3 !py-2 text-sm" onClick={onReset}>
          Reset
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="field sm:col-span-2">
          <label htmlFor="query">Search</label>
          <input
            id="query"
            placeholder="Title, amenities..."
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <select
            id="city"
            value={filters.city}
            onChange={(e) => set("city", e.target.value)}
          >
            <option value="">All cities</option>
            {CITY_OPTIONS.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="area">Area</label>
          <select
            id="area"
            value={filters.area}
            onChange={(e) => set("area", e.target.value)}
            disabled={!filters.city}
          >
            <option value="">
              {filters.city ? "All areas" : "Select a city first"}
            </option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="bedrooms">Bedrooms</label>
          <select
            id="bedrooms"
            value={filters.bedrooms}
            onChange={(e) => set("bedrooms", e.target.value)}
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {n} BHK
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="facing">Facing</label>
          <select
            id="facing"
            value={filters.facing}
            onChange={(e) => set("facing", e.target.value)}
          >
            <option value="">Any</option>
            {FACING_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="furnishing">Furnishing</label>
          <select
            id="furnishing"
            value={filters.furnishing}
            onChange={(e) => set("furnishing", e.target.value)}
          >
            <option value="">Any</option>
            <option value="Unfurnished">Unfurnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
            <option value="Fully Furnished">Fully Furnished</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="under-offer">Under Offer</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="minPrice">Min starting from (₹)</label>
          <input
            id="minPrice"
            type="number"
            placeholder="e.g. 4000000"
            value={filters.minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="maxPrice">Max starting from (₹)</label>
          <input
            id="maxPrice"
            type="number"
            placeholder="e.g. 15000000"
            value={filters.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
