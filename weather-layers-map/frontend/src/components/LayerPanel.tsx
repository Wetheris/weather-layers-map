'use client';

type Props = {
  windOn: boolean;
  setWindOn: (value: boolean) => void;
};

export default function LayerPanel({ windOn, setWindOn }: Props) {
  return (
    <div className="absolute top-4 left-4 z-10 w-64 rounded bg-white shadow p-4">
      <h2 className="mb-2 font-semibold">Layers</h2>

      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={windOn}
            onChange={(e) => setWindOn(e.target.checked)}
          />
          Radar (free)
        </label>

        <label className="flex items-center gap-2 opacity-50">
          <input type="checkbox" disabled />
          Temperature (next)
        </label>

        <label className="flex items-center gap-2 opacity-50">
          <input type="checkbox" disabled />
          Cloud Cover (next)
        </label>
      </div>
    </div>
  );
}
