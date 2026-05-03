"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { Compass, Map, Calendar, DollarSign, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 sm:pt-24 lg:pt-32 pb-16 border-b border-border">
        {/* Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl opacity-50"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/20 blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Plan your dream trip with <span className="text-primary">AI</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-text-muted mb-10">
            Tell us where you want to go, what you want to spend, and what you love doing. Our AI builds a complete, day-by-day itinerary instantly.
          </p>

          <div className="flex justify-center items-center gap-4">
            {isLoading ? (
              <div className="w-40 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            ) : session ? (
              <Link 
                href="/planner" 
                className="group flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/30"
              >
                Start Planning
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button 
                onClick={() => signIn("github")}
                className="flex items-center gap-2 bg-foreground text-background hover:opacity-90 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Log in to Start
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Map className="text-primary" size={32} />}
              title="Interactive Maps"
              description="Visualize your entire journey with automatically generated pins for every restaurant, museum, and hotel."
            />
            <FeatureCard 
              icon={<Calendar className="text-secondary" size={32} />}
              title="Day-by-Day Itinerary"
              description="No more guessing what to do next. Get a perfectly paced schedule tailored to your exact travel dates."
            />
            <FeatureCard 
              icon={<DollarSign className="text-green-500" size={32} />}
              title="Budget Tracking"
              description="See a visual breakdown of your estimated costs for food, lodging, and activities so you stay on track."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass p-8 rounded-2xl flex flex-col items-center text-center transform transition-transform hover:-translate-y-2">
      <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-text-muted">{description}</p>
    </div>
  );
}
