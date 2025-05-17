"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

interface SessionWrapperProps {
  children: ReactNode;
}

export function SessionWrapper({ children }: SessionWrapperProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/register");
  }

  return <>{children}</>;
} 