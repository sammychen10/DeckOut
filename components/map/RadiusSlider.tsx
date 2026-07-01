"use client";

interface RadiusSliderProps {
  radius: number;
  onChange: (value: number) => void;
}

export function RadiusSlider({ radius, onChange }: RadiusSliderProps) {
  const pct = ((radius - 5) / 95) * 100;
  const label = radius >= 100 ? "Any distance" : `${radius} mi`;

  return (
    <div className="absolute bottom-10 right-4 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-xl px-3.5 py-3 w-52 shadow-xl pointer-events-auto">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-slate-300">Radius</span>
        <span className="text-xs font-mono text-brand-400 tabular-nums">{label}</span>
      </div>

      <input
        type="range"
        min={5}
        max={100}
        step={5}
        value={radius}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Search radius in miles"
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer focus:outline-none"
        style={{
          background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${pct}%, #334155 ${pct}%, #334155 100%)`,
        }}
      />

      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-slate-600">5 mi</span>
        <span className="text-[10px] text-slate-600">Any</span>
      </div>
    </div>
  );
}
