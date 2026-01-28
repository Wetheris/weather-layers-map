"use client";

import type { Dispatch, SetStateAction } from "react";
import { LAYERS, type LayersState, type LayerKey } from "@/lib/layers";

type Props = {
  layers: LayersState;
  setLayers: Dispatch<SetStateAction<LayersState>>;
};

export default function LayerPanel({ layers, setLayers }: Props) {
  const toggle = (key: LayerKey, checked: boolean) => {
    setLayers((prev) => ({ ...prev, [key]: checked }));
  };

  const items = Object.values(LAYERS);

  return (
    <div className="absolute top-4 left-4 z-10 w-64 rounded bg-white shadow p-4">
      <h2 className="mb-2 font-semibold">Layers</h2>

      <div className="space-y-2 text-sm">
        {items.map((layer) => {
          const isOn = layers[layer.key];
          const disabled = !layer.enabled;

          return (
            <label
              key={layer.key}
              className={`flex items-center gap-2 ${
                disabled ? "opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={isOn}
                disabled={disabled}
                onChange={(e) => toggle(layer.key, e.target.checked)}
              />
              {layer.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
