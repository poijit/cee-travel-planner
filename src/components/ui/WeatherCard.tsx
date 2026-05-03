"use client";

import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, Wind, Thermometer } from "lucide-react";

interface WeatherCardProps {
  destination: string;
}

export default function WeatherCard({ destination }: WeatherCardProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Only fetch the first city name if it's a long string (e.g., "Tokyo, Japan" -> "Tokyo")
        const city = destination.split(',')[0].trim();
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
        
        if (!apiKey) {
          throw new Error("Missing API Key");
        }

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );

        if (!res.ok) throw new Error("Weather not found");
        
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error("Failed to fetch weather", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [destination]);

  if (loading) {
    return (
      <div className="h-32 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl"></div>
    );
  }

  if (error || !weather) {
    return null; // Silently fail if weather can't be loaded so it doesn't break the UI
  }

  const temp = Math.round(weather.main.temp);
  const condition = weather.weather[0].main;
  
  // Choose an icon based on the condition
  const WeatherIcon = () => {
    switch (condition) {
      case "Clear": return <Sun className="text-yellow-400" size={48} />;
      case "Rain": 
      case "Drizzle": return <CloudRain className="text-blue-400" size={48} />;
      default: return <Cloud className="text-gray-400" size={48} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
      <div>
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Current Weather</h3>
        <p className="text-2xl font-extrabold text-foreground">{weather.name}</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-text-muted">
            <Thermometer size={16} />
            <span className="font-medium">{temp}°C</span>
          </div>
          <div className="flex items-center gap-1 text-text-muted">
            <Wind size={16} />
            <span className="font-medium">{weather.wind.speed} m/s</span>
          </div>
        </div>
      </div>
      <div className="bg-background p-4 rounded-full shadow-sm">
        <WeatherIcon />
      </div>
    </div>
  );
}
