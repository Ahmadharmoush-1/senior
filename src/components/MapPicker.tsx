import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

const MapPicker = ({ onLocationSelect, initialLat = 37.7749, initialLng = -122.4194 }: MapPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState(localStorage.getItem("mapbox_token") || "");
  const [needsToken, setNeedsToken] = useState(!localStorage.getItem("mapbox_token"));

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      localStorage.setItem("mapbox_token", mapboxToken);

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [initialLng, initialLat],
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add initial marker
      marker.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([initialLng, initialLat])
        .addTo(map.current);

      // Handle marker drag
      marker.current.on("dragend", () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          onLocationSelect(lngLat.lat, lngLat.lng, `${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`);
        }
      });

      // Handle map click
      map.current.on("click", (e) => {
        if (marker.current && map.current) {
          marker.current.setLngLat(e.lngLat);
          onLocationSelect(e.lngLat.lat, e.lngLat.lng, `${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}`);
        }
      });

      setNeedsToken(false);
    } catch (error) {
      console.error("Map initialization error:", error);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, initialLat, initialLng, onLocationSelect]);

  if (needsToken) {
    return (
      <div className="space-y-3 rounded-lg border border-dashed bg-muted/30 p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-5 w-5" />
          <p className="text-sm font-medium">Map Location Picker</p>
        </div>
        <p className="text-sm text-muted-foreground">
          To use the interactive map, please enter your Mapbox token. Get one free at{" "}
          <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            mapbox.com
          </a>
        </p>
        <div className="space-y-2">
          <Label htmlFor="mapbox-token">Mapbox Token</Label>
          <Input
            id="mapbox-token"
            type="text"
            placeholder="pk.ey..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Click on the map or drag the marker to select your car's location</p>
      <div ref={mapContainer} className="h-[400px] w-full rounded-lg border shadow-sm" />
    </div>
  );
};

export default MapPicker;