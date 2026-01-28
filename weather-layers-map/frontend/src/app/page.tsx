"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import LayerPanel from "@/components/LayerPanel";
import { DEFAULT_LAYERS, LAYERS, type LayersState } from "@/lib/layers";

export default function Home() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const [layers, setLayers] = useState<LayersState>(DEFAULT_LAYERS);

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
      // Add only layers you’ve implemented so far
      LAYERS.radar.add(map);

      // Apply initial visibility based on state
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    (Object.keys(layers) as Array<keyof LayersState>).forEach((k) => {
      LAYERS[k].setVisible(map, layers[k]);
    });
  }, [layers]);

  return (
    <main className="h-screen w-screen relative">
      <LayerPanel layers={layers} setLayers={setLayers} />
      <div ref={mapContainer} className="h-full w-full" />
    </main>
  );
}
