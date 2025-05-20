"use client"

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/utilities/context/ThemeContext';
import { 
  BookOpen, 
  PenSquare, 
  BarChart3, 
  Calendar, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const QuickLinks = () => {
  const router = useRouter();
  const { 
    currentTheme, 
    isDarkMode, 
    elementColors 
  } = useTheme();

  // Define quick links with icons, titles, descriptions, and paths
  const links = [
    {
      icon: <PenSquare />,
      title: "New Entry",
      description: "Record your thoughts and feelings",
      path: "/user/journal-entry?quick=blank",
      color: elementColors.button,
    },
    {
      icon: <BookOpen />,
      title: "My Diary",
      description: "Browse your journal collection",
      path: "/user/journal/my-diary",
      color: currentTheme.hover,
    },
    {
      icon: <BarChart3 />,
      title: "Analysis",
      description: "Insights from your journaling",
      path: "/user/analysis/entries-analysis",
      color: currentTheme.active,
    },

  ];

  return (
    <div className="w-full mb-6">
      <div className="flex items-center mb-4">
        <Sparkles 
          className="mr-2" 
          size={20} 
          color={currentTheme.primary} 
        />
        <h2 className="text-lg font-semibold">Quick Access</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {links.map((link, index) => (
          <Link href={link.path} key={index}>
            <div 
              className={`
                h-full rounded-lg p-4 transition-all duration-300
                hover:shadow-md hover:translate-y-[-2px]
                flex flex-col justify-between
                border border-opacity-30
                ${isDarkMode ? 'border-gray-700 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}
              `}
              style={{
                backgroundColor: isDarkMode 
                  ? 'rgba(30, 30, 30, 0.6)' 
                  : 'rgba(255, 255, 255, 0.8)'
              }}
            >
              <div className="mb-2">
                <div 
                  className="p-2 rounded-full inline-flex mb-2"
                  style={{ 
                    backgroundColor: `${link.color}25`, 
                    color: link.color 
                  }}
                >
                  {React.cloneElement(link.icon, { size: 18 })}
                </div>
                <h3 className="font-medium text-sm">{link.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {link.description}
                </p>
              </div>
              
              <div 
                className="flex items-center text-xs mt-2 font-medium"
                style={{ color: link.color }}
              >
                Go <ArrowRight size={12} className="ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;