"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import LayerPanel from "@/components/LayerPanel";
import { DEFAULT_LAYERS, LAYERS, type LayersState } from "@/lib/layers";

export default function Home() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const [layers, setLayers] = useState<LayersState>(DEFAULT_LAYERS);

  // Radar frames
  const [radarTimes, setRadarTimes] = useState<number[]>([]);
  const [radarIndex, setRadarIndex] = useState<number>(0);

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

  const selectedRadarLabel = useMemo(() => {
    if (!selectedRadarTs) return "";
    const d = new Date(selectedRadarTs * 1000);
    return d.toLocaleString(undefined, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [selectedRadarTs]);

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

      // Critical: radar is created as visibility "none", so set it
      LAYERS.radar.setVisible(map, layers.radar);

      // Apply visibility for the rest
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

  // When the radar frame changes, rebuild tiles and restore visibility
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
        radarLabel={selectedRadarLabel}
      />
      <div ref={mapContainer} className="h-full w-full" />
    </main>
  );
}
