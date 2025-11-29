// import { useEffect, useRef, useState } from "react";
// import mapboxgl from "mapbox-gl";
// import "mapbox-gl/dist/mapbox-gl.css";
// import { MapPin } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// interface MapDisplayProps {
//   lat: number;
//   lng: number;
//   title?: string;
// }

// const MapDisplay = ({ lat, lng, title = "Car Location" }: MapDisplayProps) => {
//   const mapContainer = useRef<HTMLDivElement>(null);
//   const map = useRef<mapboxgl.Map | null>(null);
//   const [mapboxToken, setMapboxToken] = useState(localStorage.getItem("mapbox_token") || "");
//   const [needsToken, setNeedsToken] = useState(!localStorage.getItem("mapbox_token"));

//   useEffect(() => {
//     if (!mapContainer.current || !mapboxToken) return;

//     try {
//       mapboxgl.accessToken = mapboxToken;
//       localStorage.setItem("mapbox_token", mapboxToken);

//       map.current = new mapboxgl.Map({
//         container: mapContainer.current,
//         style: "mapbox://styles/mapbox/streets-v12",
//         center: [lng, lat],
//         zoom: 13,
//       });

//       map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

//       // Add marker
//       new mapboxgl.Marker({ color: "#3b82f6" })
//         .setLngLat([lng, lat])
//         .setPopup(new mapboxgl.Popup().setHTML(`<h3 class="font-semibold">${title}</h3>`))
//         .addTo(map.current);

//       setNeedsToken(false);
//     } catch (error) {
//       console.error("Map initialization error:", error);
//     }

//     return () => {
//       map.current?.remove();
//     };
//   }, [mapboxToken, lat, lng, title]);

//   if (needsToken) {
//     return (
//       <div className="space-y-3 rounded-lg border border-dashed bg-muted/30 p-6">
//         <div className="flex items-center gap-2 text-muted-foreground">
//           <MapPin className="h-5 w-5" />
//           <p className="text-sm font-medium">Location Map</p>
//         </div>
//         <p className="text-sm text-muted-foreground">
//           To view the location map, please enter your Mapbox token. Get one free at{" "}
//           <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
//             mapbox.com
//           </a>
//         </p>
//         <div className="space-y-2">
//           <Label htmlFor="mapbox-token-display">Mapbox Token</Label>
//           <Input
//             id="mapbox-token-display"
//             type="text"
//             placeholder="pk.ey..."
//             value={mapboxToken}
//             onChange={(e) => setMapboxToken(e.target.value)}
//           />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-2">
//       <div ref={mapContainer} className="h-[400px] w-full rounded-lg border shadow-sm animate-fade-in" />
//     </div>
//   );
// };

// export default MapDisplay;