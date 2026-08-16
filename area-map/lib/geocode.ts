export type GeocodeResult = {
  id: string;
  label: string;
  lng: number;
  lat: number;
  /** [west, south, east, north] if available */
  bbox?: [number, number, number, number];
};

type NominatimHit = {
  place_id?: number;
  osm_id?: number;
  lat: string;
  lon: string;
  display_name: string;
  boundingbox?: [string, string, string, string];
};

export function parseNominatimResults(data: unknown): GeocodeResult[] {
  if (!Array.isArray(data)) return [];

  const results: GeocodeResult[] = [];

  for (const [index, raw] of (data as NominatimHit[]).entries()) {
    const hit = raw;
    const lng = Number(hit.lon);
    const lat = Number(hit.lat);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;

    let bbox: GeocodeResult["bbox"];
    if (hit.boundingbox?.length === 4) {
      const south = Number(hit.boundingbox[0]);
      const north = Number(hit.boundingbox[1]);
      const west = Number(hit.boundingbox[2]);
      const east = Number(hit.boundingbox[3]);
      if ([south, north, west, east].every(Number.isFinite)) {
        bbox = [west, south, east, north];
      }
    }

    results.push({
      id: String(hit.place_id ?? hit.osm_id ?? `${lng},${lat},${index}`),
      label: hit.display_name,
      lng,
      lat,
      bbox,
    });
  }

  return results;
}

/**
 * Server-side Nominatim search (OpenStreetMap).
 * No API key. Callers must debounce and respect ~1 req/s.
 */
export async function searchNominatim(
  query: string,
  options?: { email?: string; limit?: number; signal?: AbortSignal },
): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const params = new URLSearchParams({
    q,
    format: "json",
    addressdetails: "0",
    limit: String(options?.limit ?? 5),
  });
  if (options?.email) {
    params.set("email", options.email);
  }

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      signal: options?.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": `PlotMeasure/1.0 (${options?.email ?? "hello@averonsoft.com"})`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Geocode failed (${res.status})`);
  }

  return parseNominatimResults(await res.json());
}
