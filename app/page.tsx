"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/utilities/context/ThemeContext";
import PreAuthLanding from "@/components/PreAuthLanding";
import ThemeSelector from "@/components/ThemeSelector";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showingPreAuth, setShowingPreAuth] = useState(true);
  const [showingThemeSelector, setShowingThemeSelector] = useState(false);
  const { currentTheme, isDarkMode } = useTheme();

  // Debug state information
  console.log("Auth Status:", status);
  console.log("Session:", session);
  console.log("Showing PreAuth:", showingPreAuth);
  console.log("Showing ThemeSelector:", showingThemeSelector);

  // Handle the authentication and user flow
  useEffect(() => {
    // Wait for the session to be loaded
    if (status === "loading") {
      console.log("Session is loading...");
      return;
    }

    console.log("Session loaded, status:", status);
    
    if (status === "unauthenticated") {
      console.log("User is unauthenticated");
      // If no session, show PreAuthLanding first
      if (showingPreAuth) {
        return; // Keep showing PreAuthLanding
      } else {
        // Only redirect after PreAuthLanding is done showing
        console.log("Redirecting to login...");
        router.push("/auth/login");
      }
      return;
    }

    // If we reach here, user is authenticated
    if (status === "authenticated" && session) {
      console.log("User is authenticated, showing theme selector");
      // User is authenticated, hide PreAuthLanding
      setShowingPreAuth(false);
      
      // All users go directly to ThemeSelector
      setShowingThemeSelector(true);
    }
  }, [session, status, router, showingPreAuth]);

  // Render based on current state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Loading session...</p>
      </div>
    );
  }

  if (showingPreAuth) {
    return <PreAuthLanding onComplete={() => setShowingPreAuth(false)} />;
  }

  if (showingThemeSelector) {
    return <ThemeSelector />;
  }

  // Fallback while transitions happen
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4">Loading your experience...</p>
    </div>
  );
}