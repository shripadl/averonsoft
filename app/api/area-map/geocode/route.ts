import { NextResponse } from "next/server";
import { brand } from "@areamap/config/brand.config";
import { searchNominatim } from "@areamap/lib/geocode";

export const runtime = "nodejs";

/** Simple in-memory throttle (~1 req/s per isolate) for Nominatim policy. */
let lastRequestAt = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const now = Date.now();
  const wait = 1100 - (now - lastRequestAt);
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastRequestAt = Date.now();

  try {
    const results = await searchNominatim(q, {
      email: brand.contactEmail,
      limit: 6,
    });
    return NextResponse.json({ results });
  } catch (error) {
    console.error("area-map geocode:", error);
    return NextResponse.json(
      { error: "Search unavailable. Try again shortly." },
      { status: 502 },
    );
  }
}
