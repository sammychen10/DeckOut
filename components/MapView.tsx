"use client";

import { useEffect, useRef } from "react";

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("NEXT_PUBLIC_MAPBOX_TOKEN is not set — map disabled.");
      return;
    }

    const initMap = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css");

      mapboxgl.accessToken = token;

      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-98.5795, 39.8283],
        zoom: 3.5,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      mapRef.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        "top-right"
      );
    };

    initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-3">
        <span className="text-4xl">🗺️</span>
        <p className="text-sm font-medium">Map unavailable</p>
        <p className="text-xs text-slate-600 max-w-xs text-center">
          Set{" "}
          <code className="bg-slate-800 px-1.5 py-0.5 rounded text-brand-400">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{" "}
          in your <code className="text-slate-400">.env.local</code> to enable
          the map.
        </p>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full" />;
}
