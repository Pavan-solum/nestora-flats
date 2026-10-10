"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Facing, Flat, FlatInput, Furnishing, NearbyPlace } from "@/lib/types";
import {
  AMENITY_OPTIONS,
  DEFAULT_IMAGES,
  FACING_OPTIONS,
} from "@/lib/seed";
import { CITY_OPTIONS, getAreasForCity } from "@/lib/locations";
import { FieldError, invalidField } from "@/components/FieldError";
import { BusyButton } from "@/components/BusyButton";
import { firstFieldError, validateFlatInput, type FieldErrors } from "@/lib/validation";

type Props = {
  initial?: Flat;
  onSubmit: (data: FlatInput) => void | Promise<void>;
  submitLabel?: string;
};

function optionalNumber(value: string) {
  return value.trim() === "" ? null : Number(value);
}

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
  const [projectName, setProjectName] = useState(initial?.projectName ?? "");
  const [khata, setKhata] = useState(initial?.khata ?? "");
  const [totalUnits, setTotalUnits] = useState(
    initial?.totalUnits == null ? "" : String(initial.totalUnits),
  );
  const [ocCcApproved, setOcCcApproved] = useState(Boolean(initial?.ocCcApproved));
  const [independentWalls, setIndependentWalls] = useState(Boolean(initial?.independentWalls));
  const [mapUrl, setMapUrl] = useState(initial?.mapUrl ?? "");
  const [latitude, setLatitude] = useState(
    initial?.latitude == null ? "" : String(initial.latitude),
  );
  const [longitude, setLongitude] = useState(
    initial?.longitude == null ? "" : String(initial.longitude),
  );
  const [city, setCity] = useState(initial?.city ?? CITY_OPTIONS[0]);
  const [area, setArea] = useState(
    initial?.area ?? getAreasForCity(initial?.city ?? CITY_OPTIONS[0])[0] ?? "",
  );
  const [bedrooms, setBedrooms] = useState(
    initial?.bedrooms == null ? "" : String(initial.bedrooms),
  );
  const [bathrooms, setBathrooms] = useState(
    initial?.bathrooms == null ? "" : String(initial.bathrooms),
  );
  const [balconies, setBalconies] = useState(
    initial?.balconies == null ? "" : String(initial.balconies),
  );
  const [carpetArea, setCarpetArea] = useState(
    initial?.carpetArea == null ? "" : String(initial.carpetArea),
  );
  const [facing, setFacing] = useState(initial?.facing ?? "");
  const [floor, setFloor] = useState(initial?.floor == null ? "" : String(initial.floor));
  const [totalFloors, setTotalFloors] = useState(
    initial?.totalFloors == null ? "" : String(initial.totalFloors),
  );
  const [ageYears, setAgeYears] = useState(
    initial?.ageYears == null ? "" : String(initial.ageYears),
  );
  const [furnishing, setFurnishing] = useState(initial?.furnishing ?? "");
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
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [uploading, setUploading] = useState(false);

  const amenitySet = useMemo(() => new Set(amenities), [amenities]);
  const areaOptions = useMemo(() => getAreasForCity(city), [city]);

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item],
    );
  };

  const uploadImages = async (list: FileList | null) => {
    if (!list?.length) return;
    setError("");
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of list) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/admin/images", { method: "POST", body });
        const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!response.ok || !payload.url) {
          throw new Error(payload.error || "Could not upload image");
        }
        urls.push(payload.url);
      }
      setImages((current) => [...current.split("\n").map((line) => line.trim()).filter(Boolean), ...urls].join("\n"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError("");
    const imageList = images
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const payload: FlatInput = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      location: location.trim(),
      city,
      area: area.trim(),
      bedrooms: optionalNumber(bedrooms),
      bathrooms: optionalNumber(bathrooms),
      balconies: optionalNumber(balconies),
      carpetArea: optionalNumber(carpetArea),
      facing: (facing || null) as Facing | null,
      floor: optionalNumber(floor),
      totalFloors: optionalNumber(totalFloors),
      ageYears: optionalNumber(ageYears),
      furnishing: (furnishing || null) as Furnishing | null,
      amenities,
      nearbySchools: textToPlaces(schools),
      nearbyColleges: textToPlaces(colleges),
      nearbyHospitals: textToPlaces(hospitals),
      nearbyTransport: textToPlaces(transport),
      images: imageList.length ? imageList : DEFAULT_IMAGES,
      status: status as Flat["status"],
      featured,
      projectName: projectName.trim() || null,
      khata: khata.trim() || null,
      totalUnits: optionalNumber(totalUnits),
      ocCcApproved,
      independentWalls,
      mapUrl: mapUrl.trim() || null,
      latitude: optionalNumber(latitude),
      longitude: optionalNumber(longitude),
    };
    const errors = validateFlatInput(payload);
    setFieldErrors(errors);
    if (firstFieldError(errors)) return;

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this flat.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="surface space-y-6 p-5 md:p-7" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="field md:col-span-2">
          <label htmlFor="title">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} {...invalidField("title", fieldErrors)} />
          <FieldError id="title" errors={fieldErrors} />
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
          <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} {...invalidField("price", fieldErrors)} />
          <FieldError id="price" errors={fieldErrors} />
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
            {...invalidField("city", fieldErrors)}
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
          <FieldError id="city" errors={fieldErrors} />
        </div>
        <div className="field">
          <label htmlFor="area">Area / locality</label>
          <select id="area" value={area} onChange={(e) => setArea(e.target.value)} {...invalidField("area", fieldErrors)}>
            {areaOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <FieldError id="area" errors={fieldErrors} />
        </div>
        <div className="field md:col-span-2">
          <label htmlFor="location">Street / landmark</label>
          <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="projectName">Project name</label>
          <input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="khata">Khata</label>
          <input id="khata" value={khata} onChange={(e) => setKhata(e.target.value)} placeholder="A-Katha" />
        </div>
        <div className="field">
          <label htmlFor="totalUnits">Total units</label>
          <input id="totalUnits" type="number" value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)} {...invalidField("totalUnits", fieldErrors)} />
          <FieldError id="totalUnits" errors={fieldErrors} />
        </div>
        <div className="field md:col-span-2">
          <label htmlFor="mapUrl">Map link</label>
          <input id="mapUrl" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="latitude">Latitude</label>
          <input id="latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} {...invalidField("latitude", fieldErrors)} />
          <FieldError id="latitude" errors={fieldErrors} />
        </div>
        <div className="field">
          <label htmlFor="longitude">Longitude</label>
          <input id="longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} {...invalidField("longitude", fieldErrors)} />
          <FieldError id="longitude" errors={fieldErrors} />
        </div>
        <div className="field justify-end">
          <label className="flex items-center gap-2 pt-7 text-sm font-semibold">
            <input
              type="checkbox"
              checked={ocCcApproved}
              onChange={(e) => setOcCcApproved(e.target.checked)}
            />
            OC CC approved
          </label>
        </div>
        <div className="field justify-end">
          <label className="flex items-center gap-2 pt-7 text-sm font-semibold">
            <input
              type="checkbox"
              checked={independentWalls}
              onChange={(e) => setIndependentWalls(e.target.checked)}
            />
            Independent walls
          </label>
        </div>
        <div className="field">
          <label htmlFor="bedrooms">Bedrooms</label>
          <input id="bedrooms" type="number" min={0} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} {...invalidField("bedrooms", fieldErrors)} />
          <FieldError id="bedrooms" errors={fieldErrors} />
        </div>
        <div className="field">
          <label htmlFor="bathrooms">Bathrooms</label>
          <input id="bathrooms" type="number" min={1} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} {...invalidField("bathrooms", fieldErrors)} />
          <FieldError id="bathrooms" errors={fieldErrors} />
        </div>
        <div className="field">
          <label htmlFor="balconies">Balconies</label>
          <input id="balconies" type="number" min={0} value={balconies} onChange={(e) => setBalconies(e.target.value)} {...invalidField("balconies", fieldErrors)} />
          <FieldError id="balconies" errors={fieldErrors} />
        </div>
        <div className="field">
          <label htmlFor="carpetArea">Carpet area (sq.ft)</label>
          <input id="carpetArea" type="number" value={carpetArea} onChange={(e) => setCarpetArea(e.target.value)} {...invalidField("carpetArea", fieldErrors)} />
          <FieldError id="carpetArea" errors={fieldErrors} />
        </div>
        <div className="field">
          <label htmlFor="facing">Facing</label>
          <select id="facing" value={facing} onChange={(e) => setFacing(e.target.value)}>
            <option value="">—</option>
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
            onChange={(e) => setFurnishing(e.target.value)}
          >
            <option value="">—</option>
            <option value="Unfurnished">Unfurnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
            <option value="Fully Furnished">Fully Furnished</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="floor">Floor</label>
          <input id="floor" type="number" value={floor} onChange={(e) => setFloor(e.target.value)} {...invalidField("floor", fieldErrors)} />
          <FieldError id="floor" errors={fieldErrors} />
        </div>
        <div className="field">
          <label htmlFor="totalFloors">Total floors</label>
          <input id="totalFloors" type="number" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} {...invalidField("totalFloors", fieldErrors)} />
          <FieldError id="totalFloors" errors={fieldErrors} />
        </div>
        <div className="field">
          <label htmlFor="ageYears">Age (years)</label>
          <input id="ageYears" type="number" min={0} value={ageYears} onChange={(e) => setAgeYears(e.target.value)} {...invalidField("ageYears", fieldErrors)} />
          <FieldError id="ageYears" errors={fieldErrors} />
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
          <label htmlFor="imageFiles" className="mt-3">
            Or upload photos to the flat-images bucket
          </label>
          <input
            id="imageFiles"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={uploading}
            onChange={(e) => {
              void uploadImages(e.target.files);
              e.target.value = "";
            }}
          />
          {uploading && <p className="text-sm text-ink-soft">Uploading photos…</p>}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <BusyButton
        type="submit"
        pending={saving}
        pendingLabel={submitLabel.startsWith("Publish") ? "Publishing…" : "Saving…"}
        className="btn btn-primary"
      >
        {submitLabel}
      </BusyButton>
    </form>
  );
}
