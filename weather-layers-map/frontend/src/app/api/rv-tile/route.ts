import { NextResponse } from "next/server";

export const runtime = "nodejs";

let cachedFrame: string | null = null;
let cachedAt = 0;
const CACHE_MS = 60_000; // 1 minute

async function getLatestFrame(): Promise<string> {
  const now = Date.now();
  if (cachedFrame && now - cachedAt < CACHE_MS) return cachedFrame;

  const res = await fetch("https://api.rainviewer.com/public/weather-maps.json", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RainViewer frames fetch failed: ${res.status}`);

  const data = await res.json();

  const past = data?.radar?.past;
  if (!Array.isArray(past) || past.length === 0) {
    throw new Error("RainViewer returned no radar frames");
  }

  const latest = past[past.length - 1];
  const frameTime = String(latest.time);

  cachedFrame = frameTime;
  cachedAt = now;
  return frameTime;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const z = searchParams.get("z");
  const x = searchParams.get("x");
  const y = searchParams.get("y");
  const ts = searchParams.get("ts"); // optional epoch seconds

  if (!z || !x || !y) {
    return NextResponse.json(
      { error: "Missing z/x/y query params" },
      { status: 400 }
    );
  }

  // If ts is provided and numeric, use it. Otherwise fall back to latest.
  const useProvidedTs = ts && /^\d+$/.test(ts);

  try {
    const frame = useProvidedTs ? ts! : await getLatestFrame();

    const upstreamUrl = `https://tilecache.rainviewer.com/v2/radar/${frame}/256/${z}/${x}/${y}/2/1_1.png`;

    const upstream = await fetch(upstreamUrl, { cache: "no-store" });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Upstream tile fetch failed", status: upstream.status },
        { status: 502 }
      );
    }

    const bytes = await upstream.arrayBuffer();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        // Timestamped frames are immutable, so cache longer.
        // “Latest” should stay short so it updates.
        "Cache-Control": useProvidedTs
          ? "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
          : "public, max-age=60",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Proxy error", message: err?.message ?? String(err) },
      { status: 502 }
    );
  }
}
