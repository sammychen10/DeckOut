import dynamic from "next/dynamic";

export const metadata = {
  title: "Find Shows Near You — DeckOut",
};

// Mapbox GL JS references `window` at module load time, so we must disable SSR
const MapClient = dynamic(
  () =>
    import("@/components/map/MapClient").then((m) => ({ default: m.MapClient })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 text-sm animate-pulse">Loading map…</p>
      </div>
    ),
  }
);

export default function MapPage() {
  return <MapClient />;
}
