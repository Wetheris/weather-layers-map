import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const z = searchParams.get("z");
  const x = searchParams.get("x");
  const y = searchParams.get("y");

  if (!z || !x || !y) {
    return NextResponse.json({ error: "Missing z/x/y" }, { status: 400 });
  }

  // Guard: prevent insane zooms
  const zNum = Number(z);
  if (!Number.isFinite(zNum) || zNum < 0 || zNum > 19) {
    return NextResponse.json({ error: "Invalid z", z }, { status: 400 });
  }

  const key = process.env.OWM_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Missing OWM_API_KEY" }, { status: 500 });
  }

  const upstreamUrl = `https://tile.openweathermap.org/map/clouds_new/${z}/${x}/${y}.png?appid=${key}`;

  const upstream = await fetch(upstreamUrl);
  if (!upstream.ok) {
    return NextResponse.json(
      {
        error: "Upstream tile fetch failed",
        upstreamStatus: upstream.status,
        upstreamUrl: upstreamUrl.replace(key, "REDACTED"),
      },
      { status: 502 }
    );
  }

  const bytes = await upstream.arrayBuffer();

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
