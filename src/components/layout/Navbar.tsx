"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { MapPin, LogIn, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLoading = status === "loading";

  // Avoid hydration mismatch by only rendering the toggle after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-surface dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-lg">
              <MapPin size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">AI Travel Planner</span>
          </Link>

          {/* Auth & Theme Buttons */}
          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}

            {!isLoading && (
              <>
                {session ? (
                  <div className="flex items-center gap-4">
                    <Link 
                      href="/saved" 
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                    >
                      Saved Trips
                    </Link>
                    <span className="text-sm text-text-muted hidden md:block border-l border-border pl-4">
                      {session.user?.name}
                    </span>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => signIn("github")}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <LogIn size={18} />
                    Sign in with GitHub
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
