// components/AuthCheck.tsx
"use client"
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { usePathname, useRouter } from "next/navigation";

interface AuthCheckProps {
    children: ReactNode;
    fallback: ReactNode;
    allowedRoutes?: string[];
}

export default function AuthCheck({ 
    children, 
    fallback, 
    allowedRoutes = ['/login', '/register', '/'] 
}: AuthCheckProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    
    // Check if current path is in allowed routes
    const isAllowedRoute = allowedRoutes.some(route => pathname === route || pathname.startsWith(route));
    
    useEffect(() => {
        // If not loading and no session and not on allowed route, redirect to login
        if (status !== "loading" && !session && !isAllowedRoute) {
            router.push('/login');
        }
    }, [session, status, isAllowedRoute, router]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center p-4 h-screen">
                <ClimbingBoxLoader color="#3b82f6" size={30} />
            </div>
        );
    }

    // Show fallback for unauthenticated users on protected routes
    if (!session && !isAllowedRoute) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}