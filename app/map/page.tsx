import { MapView } from "@/components/MapView";

export const metadata = {
  title: "Find Shows Near You — DeckOut",
};

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="px-4 py-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">Discover Shows</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Click a pin to see details, dates, and who&apos;s going
        </p>
      </div>
      <div className="flex-1">
        <MapView />
      </div>
    </div>
  );
}
