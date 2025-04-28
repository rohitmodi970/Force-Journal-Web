import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "destructive";
  className?: string;
}

export function Badge({ 
  children, 
  variant = "default", 
  className = "" 
}: BadgeProps) {
  const baseStyle = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
  
  const variantStyles = {
    default: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700",
    outline: "border border-gray-200 text-gray-900 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-50 dark:hover:bg-gray-800",
    destructive: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900"
  };

  return (
    <span className={`${baseStyle} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
