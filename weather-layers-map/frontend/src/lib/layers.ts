import type { Map } from "maplibre-gl";

export type LayerKey = "radar" | "wind" | "temperature" | "clouds";

export type LayersState = Record<LayerKey, boolean>;

type LayerDef = {
  key: LayerKey;
  label: string;
  add: (map: Map) => void;
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
    add: (map) => {
      const sourceId = "radar-source";
      const layerId = "radar";

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "raster",
          tiles: ["/api/rv-tile?z={z}&x={x}&y={y}"],
          tileSize: 256,
        });
      }

      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "raster",
          source: sourceId,
          layout: { visibility: "none" },
          paint: { "raster-opacity": 0.6 },
        });
      }
    },
    setVisible: (map, on) => setLayerVisibility(map, "radar", on),
  },

  wind: {
    key: "wind",
    label: "Wind",
    add: () => {},
    setVisible: () => {},
  },

  temperature: {
    key: "temperature",
    label: "Temperature",
    add: () => {},
    setVisible: () => {},
  },

  clouds: {
    key: "clouds",
    label: "Clouds",
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
