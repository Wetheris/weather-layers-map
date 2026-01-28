import type { Map } from "maplibre-gl";

export type LayerKey = "radar" | "wind" | "temperature" | "clouds";
export type LayersState = Record<LayerKey, boolean>;

type LayerAddOpts = {
  radarTs?: number | null;
};

type LayerDef = {
  key: LayerKey;
  label: string;
  enabled: boolean;

  // allow optional opts for layers that need them (radar frame)
  add: (map: Map, opts?: LayerAddOpts) => void;

  setVisible: (map: Map, on: boolean) => void;
};

const setLayerVisibility = (map: Map, layerId: string, on: boolean) => {
  if (!map.getLayer(layerId)) return;
  map.setLayoutProperty(layerId, "visibility", on ? "visible" : "none");
};

export const LAYERS: Record<LayerKey, LayerDef> = {
  radar: {
    key: "radar",
    label: "Radar (free)",
    enabled: true,
    add: (map, opts) => {
      const sourceId = "radar-source";
      const layerId = "radar";

      const ts = opts?.radarTs;
      const tileUrl = ts
        ? `/api/rv-tile?z={z}&x={x}&y={y}&ts=${ts}`
        : `/api/rv-tile?z={z}&x={x}&y={y}`;

      // Simplest reliable way to swap tiles when ts changes:
      // remove + re-add source/layer
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      map.addSource(sourceId, {
        type: "raster",
        tiles: [tileUrl],
        tileSize: 256,
      });

      map.addLayer({
        id: layerId,
        type: "raster",
        source: sourceId,
        layout: { visibility: "none" },
        paint: { "raster-opacity": 0.6 },
      });
    },
    setVisible: (map, on) => setLayerVisibility(map, "radar", on),
  },

  wind: {
    key: "wind",
    label: "Wind (next)",
    enabled: false,
    add: () => {},
    setVisible: () => {},
  },

  temperature: {
    key: "temperature",
    label: "Temperature (next)",
    enabled: false,
    add: () => {},
    setVisible: () => {},
  },

  clouds: {
    key: "clouds",
    label: "Cloud Cover (next)",
    enabled: false,
    add: () => {},
    setVisible: () => {},
  },
};

export const DEFAULT_LAYERS: LayersState = {
  radar: true,
  wind: false,
  temperature: false,
  clouds: false,
};
