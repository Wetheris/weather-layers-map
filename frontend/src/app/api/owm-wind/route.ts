export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const z = searchParams.get("z");
  const x = searchParams.get("x");
  const y = searchParams.get("y");

  const key = process.env.OWM_API_KEY;
  if (!key) return new Response(JSON.stringify({ error: "Missing OWM_API_KEY" }), { status: 500 });

  const upstreamUrl =
    `https://tile.openweathermap.org/map/wind_new/${z}/${x}/${y}.png?appid=${key}`;

  const upstream = await fetch(upstreamUrl);

  if (!upstream.ok) {
    const t = await upstream.text().catch(() => "");
    return new Response(`Upstream ${upstream.status}: ${t}`, { status: upstream.status });
  }

  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=300",
    },
  });
}
