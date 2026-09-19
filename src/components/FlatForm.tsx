"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Flat, FlatInput, NearbyPlace } from "@/lib/types";
import {
  AMENITY_OPTIONS,
  DEFAULT_IMAGES,
  FACING_OPTIONS,
} from "@/lib/seed";
import { CITY_OPTIONS, getAreasForCity } from "@/lib/locations";

type Props = {
  initial?: Flat;
  onSubmit: (data: FlatInput) => void;
  submitLabel?: string;
};

function placesToText(places: NearbyPlace[]) {
  return places.map((p) => `${p.name}|${p.distance}`).join("\n");
}

function textToPlaces(value: string): NearbyPlace[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, distance = ""] = line.split("|").map((p) => p.trim());
      return { name, distance: distance || "Nearby" };
    });
}

export function FlatForm({ initial, onSubmit, submitLabel = "Save flat" }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [location, setLocation] = useState(initial?.location ?? "");
  const [city, setCity] = useState(initial?.city ?? CITY_OPTIONS[0]);
  const [area, setArea] = useState(
    initial?.area ?? getAreasForCity(initial?.city ?? CITY_OPTIONS[0])[0] ?? "",
  );
  const [bedrooms, setBedrooms] = useState(String(initial?.bedrooms ?? 2));
  const [bathrooms, setBathrooms] = useState(String(initial?.bathrooms ?? 2));
  const [balconies, setBalconies] = useState(String(initial?.balconies ?? 1));
  const [carpetArea, setCarpetArea] = useState(String(initial?.carpetArea ?? ""));
  const [facing, setFacing] = useState(initial?.facing ?? "East");
  const [floor, setFloor] = useState(String(initial?.floor ?? 1));
  const [totalFloors, setTotalFloors] = useState(String(initial?.totalFloors ?? 10));
  const [ageYears, setAgeYears] = useState(String(initial?.ageYears ?? 0));
  const [furnishing, setFurnishing] = useState(initial?.furnishing ?? "Semi-Furnished");
  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);
  const [schools, setSchools] = useState(placesToText(initial?.nearbySchools ?? []));
  const [colleges, setColleges] = useState(placesToText(initial?.nearbyColleges ?? []));
  const [hospitals, setHospitals] = useState(placesToText(initial?.nearbyHospitals ?? []));
  const [transport, setTransport] = useState(placesToText(initial?.nearbyTransport ?? []));
  const [images, setImages] = useState(
    (initial?.images ?? DEFAULT_IMAGES).join("\n"),
  );
  const [status, setStatus] = useState(initial?.status ?? "available");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [error, setError] = useState("");

  const amenitySet = useMemo(() => new Set(amenities), [amenities]);
  const areaOptions = useMemo(() => getAreasForCity(city), [city]);

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item],
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !price || !city || !area.trim()) {
      setError("Title, starting price, city, and area are required.");
      return;
    }
    const imageList = images
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      location: location.trim(),
      city,
      area: area.trim(),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      balconies: Number(balconies),
      carpetArea: Number(carpetArea),
      facing: facing as Flat["facing"],
      floor: Number(floor),
      totalFloors: Number(totalFloors),
      ageYears: Number(ageYears),
      furnishing: furnishing as Flat["furnishing"],
      amenities,
      nearbySchools: textToPlaces(schools),
      nearbyColleges: textToPlaces(colleges),
      nearbyHospitals: textToPlaces(hospitals),
      nearbyTransport: textToPlaces(transport),
      images: imageList.length ? imageList : DEFAULT_IMAGES,
      status: status as Flat["status"],
      featured,
    });
  };

  return (
    <form className="surface space-y-6 p-5 md:p-7" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="field md:col-span-2">
          <label htmlFor="title">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field md:col-span-2">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="price">Starting from (₹)</label>
          <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value as Flat["status"])}>
            <option value="available">Available</option>
            <option value="under-offer">Under Offer</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <select
            id="city"
            value={city}
            onChange={(e) => {
              const nextCity = e.target.value;
              setCity(nextCity);
              const nextAreas = getAreasForCity(nextCity);
              setArea(nextAreas[0] ?? "");
            }}
          >
            {CITY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="area">Area / locality</label>
          <select id="area" value={area} onChange={(e) => setArea(e.target.value)}>
            {areaOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="field md:col-span-2">
          <label htmlFor="location">Street / landmark</label>
          <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="bedrooms">Bedrooms</label>
          <input id="bedrooms" type="number" min={1} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="bathrooms">Bathrooms</label>
          <input id="bathrooms" type="number" min={1} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="balconies">Balconies</label>
          <input id="balconies" type="number" min={0} value={balconies} onChange={(e) => setBalconies(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="carpetArea">Carpet area (sq.ft)</label>
          <input id="carpetArea" type="number" value={carpetArea} onChange={(e) => setCarpetArea(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="facing">Facing</label>
          <select id="facing" value={facing} onChange={(e) => setFacing(e.target.value as Flat["facing"])}>
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
            value={furnishing}
            onChange={(e) => setFurnishing(e.target.value as Flat["furnishing"])}
          >
            <option value="Unfurnished">Unfurnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
            <option value="Fully Furnished">Fully Furnished</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="floor">Floor</label>
          <input id="floor" type="number" value={floor} onChange={(e) => setFloor(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="totalFloors">Total floors</label>
          <input id="totalFloors" type="number" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ageYears">Age (years)</label>
          <input id="ageYears" type="number" min={0} value={ageYears} onChange={(e) => setAgeYears(e.target.value)} />
        </div>
        <div className="field justify-end">
          <label className="flex items-center gap-2 pt-7 text-sm font-semibold">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Mark as featured
          </label>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-ink-soft">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleAmenity(item)}
              className={`chip ${amenitySet.has(item) ? "chip-sage" : ""}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="field">
          <label htmlFor="schools">Nearby schools (name|distance per line)</label>
          <textarea id="schools" rows={4} value={schools} onChange={(e) => setSchools(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="colleges">Nearby colleges</label>
          <textarea id="colleges" rows={4} value={colleges} onChange={(e) => setColleges(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="hospitals">Nearby hospitals</label>
          <textarea id="hospitals" rows={4} value={hospitals} onChange={(e) => setHospitals(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="transport">Nearby transport</label>
          <textarea id="transport" rows={4} value={transport} onChange={(e) => setTransport(e.target.value)} />
        </div>
        <div className="field md:col-span-2">
          <label htmlFor="images">Image URLs (one per line)</label>
          <textarea id="images" rows={4} value={images} onChange={(e) => setImages(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button type="submit" className="btn btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}
