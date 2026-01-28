"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { LAYERS, type LayersState, type LayerKey } from "@/lib/layers";

type Props = {
  layers: LayersState;
  setLayers: Dispatch<SetStateAction<LayersState>>;
  radarTimes: number[];
  radarIndex: number;
  setRadarIndex: Dispatch<SetStateAction<number>>;
};

function formatMinutesAgo(tsSeconds: number | null): string {
  if (!tsSeconds) return "";
  const nowMs = Date.now();
  const tsMs = tsSeconds * 1000;
  const diffMs = Math.max(0, nowMs - tsMs);
  const mins = Math.round(diffMs / 60000);

  if (mins <= 0) return "just now";
  if (mins === 1) return "1 minute ago";
  return `${mins} minutes ago`;
}

export default function LayerPanel({
  layers,
  setLayers,
  radarTimes,
  radarIndex,
  setRadarIndex,
}: Props) {
  const toggle = (key: LayerKey, checked: boolean) => {
    setLayers((prev) => ({ ...prev, [key]: checked }));
  };

  const items = Object.values(LAYERS);

  const selectedRadarTs = useMemo(() => {
    if (radarTimes.length === 0) return null;
    const idx = Math.min(Math.max(radarIndex, 0), radarTimes.length - 1);
    return radarTimes[idx];
  }, [radarTimes, radarIndex]);

  // Keep the "minutes ago" label updating while the app is open
  const [nowTick, setNowTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setNowTick((x) => x + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const minutesAgoLabel = useMemo(() => {
    void nowTick; // depend on tick
    return formatMinutesAgo(selectedRadarTs);
  }, [selectedRadarTs, nowTick]);

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

      {/* Radar frame slider (only show when frames are loaded) */}
      {radarTimes.length > 0 && (
        <div className="mt-4">
          <div className="mb-1 text-xs text-slate-600">Radar frame</div>

          <input
            type="range"
            min={0}
            max={Math.max(0, radarTimes.length - 1)}
            value={Math.min(Math.max(radarIndex, 0), radarTimes.length - 1)}
            onChange={(e) => setRadarIndex(Number(e.target.value))}
            className="w-full"
            disabled={!layers.radar}
          />

          <div className="mt-1 flex justify-between text-xs text-slate-600">
            <span>Older</span>
            <span>
              {Math.min(Math.max(radarIndex, 0), radarTimes.length - 1) + 1} /{" "}
              {radarTimes.length}
            </span>
            <span>Newer</span>
          </div>

          {layers.radar ? (
            <div className="mt-1 text-xs text-slate-600">
              {minutesAgoLabel}
            </div>
          ) : (
            <div className="mt-1 text-xs text-slate-500">
              Enable Radar to preview frames
            </div>
          )}
        </div>
      )}
    </div>
  );
}
