"use client";

import { useMemo, useState } from "react";

type Props = {
  show: boolean;
};

type Unit = "C" | "F";

function cToF(c: number) {
  return Math.round((c * 9) / 5 + 32);
}

export default function TemperatureLegend({ show }: Props) {
  const [unit, setUnit] = useState<Unit>("F");

  const ticksC = useMemo(() => [-30, -10, 0, 15, 30, 45], []);
  const ticks = useMemo(() => {
    if (unit === "C") return ticksC.map((v) => `${v}°C`);
    return ticksC.map((v) => `${cToF(v)}°F`);
  }, [ticksC, unit]);

  if (!show) return null;

  return (
    <div className="absolute bottom-4 right-4 z-10 w-56 rounded bg-white/95 shadow p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Temperature</div>

        <div className="flex gap-1 text-xs">
          <button
            className={`rounded px-2 py-1 ${
              unit === "F" ? "bg-slate-900 text-white" : "bg-slate-100"
            }`}
            onClick={() => setUnit("F")}
          >
            °F
          </button>
          <button
            className={`rounded px-2 py-1 ${
              unit === "C" ? "bg-slate-900 text-white" : "bg-slate-100"
            }`}
            onClick={() => setUnit("C")}
          >
            °C
          </button>
        </div>
      </div>

      <div className="mt-2">
        <div
          className="h-3 w-full rounded"
          style={{
            background:
              "linear-gradient(to right, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)",
          }}
        />
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-slate-700">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>

      <div className="mt-2 text-[11px] text-slate-500">
        Approximate scale (OpenWeather tiles)
      </div>
    </div>
  );
}
