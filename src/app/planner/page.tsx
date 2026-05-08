"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, DollarSign, Send, Navigation, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import CostChart from "@/components/ui/CostChart";
import WeatherCard from "@/components/ui/WeatherCard";
import UnsplashImage from "@/components/ui/UnsplashImage";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";

const itinerarySchema = z.object({
  title: z.string(),
  destination: z.string(),
  estimatedTotalCost: z.string(),
  days: z.array(z.object({
    dayNumber: z.number(),
    theme: z.string(),
    activities: z.array(z.object({
      time: z.string(),
      name: z.string(),
      description: z.string(),
      estimatedCost: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number()
      }).optional()
    }))
  }))
});

// Dynamically import the map so Leaflet doesn't crash during Server-Side Rendering
const DynamicMap = dynamic(() => import("@/components/ui/Map"), { 
  ssr: false,
  loading: () => <div className="h-64 sm:h-96 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl flex items-center justify-center">Loading Interactive Map...</div>
});

export default function TripPlanner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("3");
  const [budget, setBudget] = useState("Medium");
  const [interests, setInterests] = useState("");
  const [provider, setProvider] = useState("gemini");
  const [isSaving, setIsSaving] = useState(false);

  const { object: itinerary, submit, isLoading: isGenerating } = useObject({
    api: '/api/generate-itinerary',
    schema: itinerarySchema,
    onError: (error) => {
      console.error(error);
      alert("There was an error generating your trip. Please check your API keys in .env.local.");
    }
  });

  const setItinerary = (val: any) => {
    // This is a shim to maintain compatibility with the "Plan another trip" button
    if (val === null) {
      window.location.reload(); // Simplest way to reset the hook state for now
    }
  };

  // If the user is not logged in, we shouldn't let them plan a trip
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <Navigation size={32} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-text-muted max-w-md">
          You must be logged in to generate a travel itinerary. Please return to the home page and sign in with GitHub.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="mt-8 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Go back home
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit({ destination, duration, budget, interests, provider });
  };

  const handleSaveTrip = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itinerary),
      });

      if (!response.ok) {
        throw new Error('Failed to save trip');
      }

      alert("Trip saved successfully! You can view it in your Saved Trips.");
      router.push('/saved');
    } catch (error) {
      console.error("Error saving trip:", error);
      alert("Failed to save the trip. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('itinerary-content');
    if (!element || !itinerary || !itinerary.destination) return;
    
    // Dynamically import html2pdf.js on the client side only
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt = {
      margin:       10,
      filename:     `${itinerary.destination.replace(/[^a-zA-Z0-9]/g, '_')}_Trip.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  // If we have an itinerary (even a partial one), render the results
  if (itinerary && itinerary.title) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setItinerary(null)}
            className="text-primary hover:text-primary-hover font-semibold flex items-center gap-2"
          >
            &larr; Plan another trip
          </button>
          
          <div className="flex gap-4">
            {!isGenerating && (
              <>
                <button 
                  onClick={handleDownloadPDF}
                  className="px-6 py-2 rounded-lg font-medium text-primary bg-primary/10 transition-all hover:bg-primary/20 hover:-translate-y-0.5"
                >
                  ⬇️ Download PDF
                </button>
                <button 
                  onClick={handleSaveTrip}
                  disabled={isSaving}
                  className={`px-6 py-2 rounded-lg font-medium text-white transition-all shadow-md ${
                    isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:-translate-y-0.5'
                  }`}
                >
                  {isSaving ? "Saving..." : "Save Trip"}
                </button>
              </>
            )}
            {isGenerating && (
              <div className="flex items-center gap-2 text-primary animate-pulse font-medium">
                <Sparkles size={18} />
                AI is crafting your trip...
              </div>
            )}
          </div>
        </div>
        
        <div id="itinerary-content" className="glass rounded-2xl p-6 sm:p-10 shadow-xl border border-border">
          {itinerary.destination && (
            <UnsplashImage 
              query={itinerary.destination} 
              alt={itinerary.destination} 
              className="w-full h-64 sm:h-80 rounded-xl mb-6 shadow-md"
            />
          )}
          <h1 className="text-4xl font-extrabold text-foreground mb-2">{itinerary.title}</h1>
          <p className="text-lg text-text-muted mb-6">Estimated Total Cost: <span className="font-bold text-green-500">{itinerary.estimatedTotalCost || "Calculating..."}</span></p>
          
          {itinerary.destination && (
            <div className="mb-8">
              <WeatherCard destination={itinerary.destination} />
            </div>
          )}

          <div className="mb-10">
            {itinerary.destination && (
              <DynamicMap 
                destination={itinerary.destination} 
                activities={itinerary.days?.flatMap((d: any) => d.activities || []) || []} 
              />
            )}
            {itinerary.days && itinerary.days.length > 0 && (
              <CostChart days={itinerary.days as any} />
            )}
          </div>

          <div className="space-y-8">
            {itinerary.days?.map((day: any) => (
              <div key={day.dayNumber} className="bg-surface rounded-xl p-6 border border-border">
                <h3 className="text-xl font-bold text-primary mb-1">Day {day.dayNumber}</h3>
                <p className="text-text-muted font-medium mb-4">{day.theme}</p>
                
                <div className="space-y-4">
                  {day.activities?.map((activity: any, index: number) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 border-l-2 border-primary/30 pl-4 py-2 bg-background/50 rounded-r-lg hover:bg-background transition-colors">
                      {activity.name && (
                        <UnsplashImage 
                          query={`${activity.name} ${itinerary.destination}`} 
                          alt={activity.name} 
                          className="w-full sm:w-32 h-32 shrink-0 rounded-lg shadow-sm"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{index + 1}</span>
                          {activity.time && <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">{activity.time}</span>}
                        </div>
                        <h4 className="font-semibold text-foreground text-xl mb-1">{activity.name}</h4>
                        <p className="text-text-muted text-sm">{activity.description}</p>
                        <p className="text-sm font-bold text-green-500 mt-1">{activity.estimatedCost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
          Where to next, <span className="text-primary">{session?.user?.name?.split(' ')[0] || 'Traveler'}</span>?
        </h1>
        <p className="text-lg text-text-muted">
          Fill out the details below and let our AI craft your perfect itinerary.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 sm:p-10 shadow-xl border border-border">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Destination */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Destination
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Tokyo, Japan or Paris, France"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Calendar size={18} className="text-secondary" />
                Duration (Days)
              </label>
              <input
                type="number"
                required
                min="1"
                max="14"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-surface text-foreground focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <DollarSign size={18} className="text-green-500" />
                Budget Level
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-surface text-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Budget">Budget (Backpacker)</option>
                <option value="Medium">Moderate (Standard)</option>
                <option value="Luxury">Luxury (Premium)</option>
              </select>
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Navigation size={18} className="text-purple-500" />
              What do you love doing?
            </label>
            <textarea
              required
              rows={3}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g., I love trying street food, visiting historical museums, and hiking..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-surface text-foreground focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* AI Model Selector */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              AI Model
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setProvider("gemini")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  provider === "gemini"
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-gray-300 dark:border-gray-700 hover:border-primary/50"
                }`}
              >
                <p className="font-bold text-foreground">Gemini 1.5 Flash</p>
                <p className="text-xs text-text-muted mt-1">by Google — Fast & accurate</p>
              </button>
              <button
                type="button"
                onClick={() => setProvider("groq")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  provider === "groq"
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-gray-300 dark:border-gray-700 hover:border-primary/50"
                }`}
              >
                <p className="font-bold text-foreground">Llama 3.3 70B</p>
                <p className="text-xs text-text-muted mt-1">by Meta via Groq — Ultra fast</p>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isGenerating || status === "loading"}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-2 transition-all transform
              ${isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-hover hover:-translate-y-1 shadow-lg shadow-primary/30'
              }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating Itinerary...
              </>
            ) : (
              <>
                <Send size={20} />
                Generate My Trip
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
