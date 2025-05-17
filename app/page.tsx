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

  // Handle the authentication and user flow
  useEffect(() => {
    // Wait for the session to be loaded
    if (status === "loading") return;

    if (status === "unauthenticated") {
      // If no session, redirect to login after showing PreAuthLanding
      if (!showingPreAuth) {
        router.push("/auth/login");
      }
      return;
    }

    // If we reach here, user is authenticated
    if (session) {
      // User is authenticated, hide PreAuthLanding
      setShowingPreAuth(false);
      
      // All users go directly to ThemeSelector
      setShowingThemeSelector(true);
    }
  }, [session, status, router, showingPreAuth]);

  // Render logic
  if (showingPreAuth) {
    return <PreAuthLanding onComplete={() => setShowingPreAuth(false)} />;
  }

  if (showingThemeSelector) {
    return <ThemeSelector />;
  }

  // Fallback while transitions happen
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
