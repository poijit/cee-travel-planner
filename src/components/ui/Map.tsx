"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  destination: string;
  activities: { name: string; description: string }[];
}

export default function Map({ destination, activities }: MapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    // In a real production app, we would use a Geocoding API (like Google Maps or Mapbox) 
    // to convert the 'destination' string into actual coordinates.
    // For this prototype, if it's Tokyo, we hardcode it. Otherwise, default to a random place.
    if (destination.toLowerCase().includes("tokyo")) {
      setPosition([35.6762, 139.6503]);
    } else if (destination.toLowerCase().includes("paris")) {
      setPosition([48.8566, 2.3522]);
    } else {
      // Default fallback (e.g. London)
      setPosition([51.5074, -0.1278]);
    }
  }, [destination]);

  if (!position) return <div className="h-64 sm:h-96 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl flex items-center justify-center">Loading Map...</div>;

  return (
    <div className="h-64 sm:h-96 w-full rounded-2xl overflow-hidden shadow-lg border border-border z-0">
      <MapContainer center={position} zoom={11} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Destination Marker */}
        <Marker position={position} icon={customIcon}>
          <Popup>
            <strong className="text-lg">{destination}</strong>
            <p className="text-sm">Your AI Trip Destination!</p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
