import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RainViewerMaps = {
  radar?: {
    past?: Array<{ time: number }>;
    nowcast?: Array<{ time: number }>;
  };
};

export async function GET() {
  const url = "https://api.rainviewer.com/public/weather-maps.json"; // official
  const res = await fetch(url, {
    // Avoid Next caching weirdness, we control cache headers ourselves
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch RainViewer frames" },
      { status: 502 }
    );
  }

  const data = (await res.json()) as RainViewerMaps;

  const past = data.radar?.past ?? [];
  // Keep it simple: use past frames only (most reliable)
  const times = past.map((f) => f.time).filter(Boolean);

  return NextResponse.json(
    { times },
    {
      headers: {
        // Refresh often enough for “live-ish”, but not every request
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
