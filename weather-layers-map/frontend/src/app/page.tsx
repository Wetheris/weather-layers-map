'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import LayerPanel from '@/components/LayerPanel';

const WIND_LAYER_ID = 'wind';
const WIND_SOURCE_ID = 'wind-source';

export default function Home() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const [windOn, setWindOn] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return; // prevent double-init in dev

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 20],
      zoom: 2,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      // Add a free radar overlay source (RainViewer)
      map.addSource(WIND_SOURCE_ID, {
        type: 'raster',
        tiles: ['/api/rv-tile?z={z}&x={x}&y={y}'],
        tileSize: 256,
      });

      // Add it as a raster layer (start hidden)
      map.addLayer({
        id: WIND_LAYER_ID,
        type: 'raster',
        source: WIND_SOURCE_ID,
        layout: { visibility: 'none' },
        paint: { 'raster-opacity': 0.6 },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Toggle layer visibility when checkbox changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) return;

    // Layer might not exist until after load
    const hasLayer = !!map.getLayer(WIND_LAYER_ID);
    if (!hasLayer) return;

    map.setLayoutProperty(
      WIND_LAYER_ID,
      'visibility',
      windOn ? 'visible' : 'none'
    );
  }, [windOn]);

  return (
    <main className="h-screen w-screen relative">
      <LayerPanel windOn={windOn} setWindOn={setWindOn} />
      <div ref={mapContainer} className="h-full w-full" />
    </main>
  );
}
