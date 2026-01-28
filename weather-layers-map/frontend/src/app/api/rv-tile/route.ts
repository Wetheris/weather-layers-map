import { NextResponse } from 'next/server';

let cachedFrame: string | null = null;
let cachedAt = 0;
const CACHE_MS = 60_000; // 1 minute

async function getLatestFrame(): Promise<string> {
  const now = Date.now();
  if (cachedFrame && now - cachedAt < CACHE_MS) return cachedFrame;

  const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
  if (!res.ok) throw new Error(`RainViewer frames fetch failed: ${res.status}`);

  const data = await res.json();

  // data.radar.past is an array of frames with a "time" value
  const past = data?.radar?.past;
  if (!Array.isArray(past) || past.length === 0) {
    throw new Error('RainViewer returned no radar frames');
  }

  const latest = past[past.length - 1];
  const frameTime = String(latest.time);

  cachedFrame = frameTime;
  cachedAt = now;
  return frameTime;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const z = searchParams.get('z');
  const x = searchParams.get('x');
  const y = searchParams.get('y');

  if (!z || !x || !y) {
    return NextResponse.json({ error: 'Missing z/x/y query params' }, { status: 400 });
  }

  try {
    const frame = await getLatestFrame();

    // Use a real frame timestamp so the tile definitely exists
    const upstreamUrl = `https://tilecache.rainviewer.com/v2/radar/${frame}/256/${z}/${x}/${y}/2/1_1.png`;

    const upstream = await fetch(upstreamUrl);
    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Upstream tile fetch failed', status: upstream.status },
        { status: 502 }
      );
    }

    const bytes = await upstream.arrayBuffer();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Proxy error', message: err?.message ?? String(err) },
      { status: 502 }
    );
  }
}
