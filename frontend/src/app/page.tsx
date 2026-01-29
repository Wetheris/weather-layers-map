"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import LayerPanel from "@/components/LayerPanel";
import { DEFAULT_LAYERS, LAYERS, type LayersState } from "@/lib/layers";
import TemperatureLegend from "@/components/TemperatureLegend";

function formatMinutesAgo(tsSeconds: number | null): string {
  if (!tsSeconds) return "";
  const diffMs = Math.max(0, Date.now() - tsSeconds * 1000);
  const mins = Math.round(diffMs / 60000);

  if (mins <= 0) return "just now";
  if (mins === 1) return "1 minute ago";
  return `${mins} minutes ago`;
}

const BASEMAPS = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
} as const;

type BasemapKey = keyof typeof BASEMAPS;

export default function Home() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const [basemap, setBasemap] = useState<BasemapKey>("light");
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

  // Re-add overlays after style changes (or initial load)
  const applyOverlays = (map: Map) => {
    LAYERS.radar.add(map, { radarTs: selectedRadarTs });
    LAYERS.clouds.add(map);
    LAYERS.wind.add(map);
    LAYERS.temperature.add(map);

    (Object.keys(layers) as Array<keyof LayersState>).forEach((k) => {
      LAYERS[k].setVisible(map, layers[k]);
    });
  };

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAPS[basemap],
      center: [0, 20],
      zoom: 2,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      applyOverlays(map);
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

  // Switch basemap and then re-add overlays after the new style loads
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onStyleLoad = () => {
      applyOverlays(map);
    };

    map.once("style.load", onStyleLoad);
    map.setStyle(BASEMAPS[basemap]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basemap]);

  // Toggle visibility for all layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    (Object.keys(layers) as Array<keyof LayersState>).forEach((k) => {
      // Ensure non-radar layers exist if user turns them on later
      if (layers[k] && k !== "radar") {
        LAYERS[k].add(map);
      }
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

      <div className="absolute top-4 right-20 z-10 rounded bg-white/95 shadow p-2 text-sm">
        <button
          type="button"
          className={`px-2 py-1 rounded ${
            basemap === "light" ? "bg-slate-900 text-white" : "bg-slate-100"
          }`}
          onClick={() => setBasemap("light")}
        >
          Light
        </button>
        <button
          type="button"
          className={`ml-2 px-2 py-1 rounded ${
            basemap === "dark" ? "bg-slate-900 text-white" : "bg-slate-100"
          }`}
          onClick={() => setBasemap("dark")}
        >
          Dark
        </button>
      </div>

      <TemperatureLegend show={layers.temperature} />

      <div ref={mapContainer} className="h-full w-full" />
    </main>
  );
}
