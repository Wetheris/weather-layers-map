"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import LayerPanel from "@/components/LayerPanel";
import { DEFAULT_LAYERS, LAYERS, type LayersState } from "@/lib/layers";

function formatMinutesAgo(tsSeconds: number | null): string {
  if (!tsSeconds) return "";
  const diffMs = Math.max(0, Date.now() - tsSeconds * 1000);
  const mins = Math.round(diffMs / 60000);

  if (mins <= 0) return "just now";
  if (mins === 1) return "1 minute ago";
  return `${mins} minutes ago`;
}

export default function Home() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const [layers, setLayers] = useState<LayersState>(DEFAULT_LAYERS);

  // Radar frames
  const [radarTimes, setRadarTimes] = useState<number[]>([]);
  const [radarIndex, setRadarIndex] = useState<number>(0);

  // ticker so "minutes ago" updates while app is open
  const [nowTick, setNowTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setNowTick((x) => x + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch("/api/rv-frames");
      if (!res.ok) return;

      const data = (await res.json()) as { times: number[] };
      if (cancelled) return;

      const times = Array.isArray(data.times) ? data.times : [];
      setRadarTimes(times);

      if (times.length > 0) setRadarIndex(times.length - 1); // newest
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedRadarTs = useMemo(() => {
    if (radarTimes.length === 0) return null;
    const idx = Math.min(Math.max(radarIndex, 0), radarTimes.length - 1);
    return radarTimes[idx];
  }, [radarTimes, radarIndex]);

  const radarLabel = useMemo(() => {
    void nowTick; // depend on tick so label updates
    return formatMinutesAgo(selectedRadarTs);
  }, [selectedRadarTs, nowTick]);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 20],
      zoom: 2,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      // Add radar (ts may be null at first, that’s ok)
      LAYERS.radar.add(map, { radarTs: selectedRadarTs });

      // radar is created as visibility "none", so flip it immediately
      LAYERS.radar.setVisible(map, layers.radar);

      // Add other implemented layers here (clouds, etc) when ready:
      LAYERS.clouds.add(map);

      // Apply visibility for all layers
      (Object.keys(layers) as Array<keyof LayersState>).forEach((k) => {
        LAYERS[k].setVisible(map, layers[k]);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When radar frame changes, rebuild tiles and restore visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      LAYERS.radar.add(map, { radarTs: selectedRadarTs });
      LAYERS.radar.setVisible(map, layers.radar);
    };

    if (!map.isStyleLoaded()) {
      map.once("load", apply);
      return;
    }

    apply();
  }, [selectedRadarTs, layers.radar]);

  // Toggle visibility for all layers (safe, no re-add)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    (Object.keys(layers) as Array<keyof LayersState>).forEach((k) => {
      LAYERS[k].setVisible(map, layers[k]);
    });
  }, [layers]);

  return (
    <main className="h-screen w-screen relative">
      <LayerPanel
        layers={layers}
        setLayers={setLayers}
        radarTimes={radarTimes}
        radarIndex={radarIndex}
        setRadarIndex={setRadarIndex}
        radarLabel={radarLabel}
      />
      <div ref={mapContainer} className="h-full w-full" />
    </main>
  );
}
