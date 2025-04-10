// components/AuthCheck.tsx
"use client"
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { usePathname } from "next/navigation";

interface AuthCheckProps {
    children: ReactNode;
    fallback: ReactNode;
    allowedRoutes?: string[];
}

export default function AuthCheck({ 
    children, 
    fallback, 
    allowedRoutes = [] 
}: AuthCheckProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    
    // Check if current path is in allowed routes
    const isAllowedRoute = allowedRoutes.some(route => pathname === route || pathname.startsWith(route));
    
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center p-4 h-screen">
                <ClimbingBoxLoader color="#3b82f6" size={30} />
            </div>
        );
    }

    // Allow access if user is authenticated or the route is in allowedRoutes
    if (!session && !isAllowedRoute) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}