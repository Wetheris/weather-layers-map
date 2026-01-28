"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import LayerPanel from "@/components/LayerPanel";

const RADAR_LAYER_ID = "radar";
const RADAR_SOURCE_ID = "radar-source";

export default function Home() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const [layers, setLayers] = useState({
    radar: true,
    wind: false,
    temperature: false,
    clouds: false,
  });

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return; // prevent double-init in dev

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 20],
      zoom: 2,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      map.addSource(RADAR_SOURCE_ID, {
        type: "raster",
        tiles: ["/api/rv-tile?z={z}&x={x}&y={y}"],
        tileSize: 256,
      });

      map.addLayer({
        id: RADAR_LAYER_ID,
        type: "raster",
        source: RADAR_SOURCE_ID,
        layout: { visibility: layers.radar ? "visible" : "none" },
        paint: { "raster-opacity": 0.6 },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Important: keep this effect one-time init
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) return;

    const hasLayer = !!map.getLayer(RADAR_LAYER_ID);
    if (!hasLayer) return;

    map.setLayoutProperty(
      RADAR_LAYER_ID,
      "visibility",
      layers.radar ? "visible" : "none"
    );
  }, [layers.radar]);

  return (
    <main className="relative h-screen w-screen">
      <LayerPanel layers={layers} setLayers={setLayers} />
      <div ref={mapContainer} className="h-full w-full" />
    </main>
  );
}
