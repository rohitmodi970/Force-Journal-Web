import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/quilted-gallery/ui/card';
import { Button } from './ui/button2';
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from '@/utilities/context/ThemeContext';

interface CollapsibleCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  icon,
  children,
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { currentTheme, isDarkMode } = useTheme();

  return (
    <Card className={cn("overflow-hidden border transition-all duration-300 h-auto", 
      isOpen ? "shadow-md" : "shadow-sm", className)}>
      <CardHeader className="p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex justify-between items-center h-auto">
          <div className="flex items-center gap-2">
            {icon && <span style={{ color: currentTheme.primary }}>{icon}</span>}
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            style={{ 
              '--theme-hover': currentTheme.hover,
              '--theme-active': currentTheme.active
            } as React.CSSProperties}
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="p-4 pt-0">
            {children}
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default CollapsibleCard;