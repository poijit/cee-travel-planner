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
  activities: { 
    name: string; 
    description: string;
    coordinates?: { lat: number; lng: number };
  }[];
}

export default function Map({ destination, activities }: MapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    async function fetchCoordinates() {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          // Default fallback (London) if destination is extremely obscure
          setPosition([51.5074, -0.1278]);
        }
      } catch (error) {
        console.error("Geocoding failed:", error);
        setPosition([51.5074, -0.1278]);
      }
    }

    if (destination) {
      fetchCoordinates();
    }
  }, [destination]);

  if (!position) return <div className="h-64 sm:h-96 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl flex items-center justify-center">Loading Map...</div>;

  return (
    <div className="h-64 sm:h-96 w-full rounded-2xl overflow-hidden shadow-lg border border-border z-0">
      <MapContainer key={`${position[0]}-${position[1]}`} center={position} zoom={11} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
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

        {/* Activity Markers */}
        {activities?.map((activity, index) => {
          if (activity.coordinates && activity.coordinates.lat && activity.coordinates.lng) {
            const createNumberedIcon = (num: number) => new L.DivIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);">${num}</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -14]
            });

            return (
              <Marker 
                key={`activity-${index}`} 
                position={[Number(activity.coordinates.lat), Number(activity.coordinates.lng)]} 
                icon={createNumberedIcon(index + 1)}
              >
                <Popup>
                  <strong className="text-md text-primary font-bold">{index + 1}. {activity.name}</strong>
                  <p className="text-xs mt-1 leading-tight">{activity.description}</p>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}
