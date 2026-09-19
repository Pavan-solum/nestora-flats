import type { NearbyPlace } from "@/lib/types";

export function NearbyPlaces({
  title,
  places,
}: {
  title: string;
  places: NearbyPlace[];
}) {
  return (
    <div className="surface p-5">
      <h3 className="font-display text-2xl">{title}</h3>
      <ul className="mt-4 space-y-3">
        {places.length === 0 && (
          <li className="text-sm text-ink-soft">No places listed yet.</li>
        )}
        {places.map((place) => (
          <li
            key={`${place.name}-${place.distance}`}
            className="flex items-start justify-between gap-3 border-b border-line/70 pb-3 last:border-0 last:pb-0"
          >
            <span className="font-medium">{place.name}</span>
            <span className="chip whitespace-nowrap">{place.distance}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
