"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navigation, Trash2, Calendar, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";

export default function SavedTrips() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchTrips();
    }
  }, [status, router]);

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    
    try {
      const response = await fetch(`/api/trips?tripId=${tripId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      
      // Remove from UI
      setTrips(trips.filter(t => t.TripId !== tripId));
    } catch (error) {
      console.error(error);
      alert("Failed to delete trip.");
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-10 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">Saved Trips</h1>
          <p className="text-lg text-text-muted">Your personal collection of AI-generated itineraries.</p>
        </div>
        <Link 
          href="/planner"
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors hidden sm:block"
        >
          Plan New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Navigation size={32} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No trips saved yet</h3>
          <p className="text-text-muted mb-8 max-w-md">
            You haven't saved any itineraries to your AWS DynamoDB database yet.
          </p>
          <Link 
            href="/planner"
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Your First Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => {
            const data = trip.TripData;
            return (
              <div key={trip.TripId} className="glass rounded-2xl overflow-hidden shadow-lg border border-border group hover:border-primary/50 transition-colors flex flex-col">
                <div className="bg-primary/10 p-6 border-b border-border">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-foreground line-clamp-2">{data.title}</h2>
                    <button 
                      onClick={() => deleteTrip(trip.TripId)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-colors shrink-0"
                      title="Delete trip"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm text-text-muted font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-primary" />
                      {data.destination}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-secondary" />
                      {data.days?.length || 0} Days
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-green-500" />
                      {data.estimatedTotalCost}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-surface flex-grow">
                  <p className="text-sm text-text-muted mb-4 line-clamp-3">
                    {data.days?.[0]?.theme} and more...
                  </p>
                  
                  {/* Note: In a real app, we'd make a separate detailed view page. For now, we just show a preview. */}
                  <div className="mt-auto text-xs font-medium text-gray-400">
                    Saved on {new Date(trip.CreatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
