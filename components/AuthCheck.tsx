// components/AuthCheck.tsx
"use client"
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { ClimbingBoxLoader } from "react-spinners";
interface AuthCheckProps {
  children: ReactNode;
  fallback: ReactNode;
}

export default function AuthCheck({ children, fallback }: AuthCheckProps) {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    // Optional: Add a loading state here
    return (
    <div className="flex items-center justify-center p-4 h-screen">
      <ClimbingBoxLoader color="#3b82f6" size={30} />
    </div>
    );
  }

  if (!session) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}