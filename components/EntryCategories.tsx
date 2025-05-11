import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/quilted-gallery/ui/card';
import { Tag, Briefcase, Heart, Glasses, Utensils, Dumbbell, BookOpen, Home, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from '../utilities/context/ThemeContext';

interface CategoryProps {
  icon: React.ReactNode;
  name: string;
  color: string;
  count: number;
}

// Define a mapping of color names to their values
const colorMap = {
  'journal-blue': '#4299E1',
  'journal-purple': '#9F7AEA',
  'journal-yellow': '#ECC94B',
  'journal-green': '#48BB78',
  'journal-orange': '#ED8936',
  'journal-indigo': '#667EEA',
  'journal-red': '#E53E3E',
  'primary': '' // Will be filled from theme
}

const Category: React.FC<CategoryProps> = ({ icon, name, color, count }) => {
  const { currentTheme } = useTheme();
  
  // Use the theme's primary color if the color is 'primary'
  const actualColor = color === 'primary' ? currentTheme.primary : colorMap[color as keyof typeof colorMap] || '#4299E1';
  
  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer"
      style={{ 
        backgroundColor: `${actualColor}1A`, // 10% opacity
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = `${actualColor}33`; // 20% opacity on hover
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = `${actualColor}1A`; // Back to 10% opacity
      }}
    >
      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ 
        backgroundColor: `${actualColor}33`, // 20% opacity
        color: actualColor 
      }}>
        {icon}
      </div>
      <div className="flex-grow">
        <h3 className="text-sm font-medium">{name}</h3>
        <p className="text-xs text-muted-foreground">{count} entries</p>
      </div>
    </div>
  );
};

const EntryCategories = () => {
  const { currentTheme } = useTheme();
  
  // Update the primary color in the color map
  colorMap.primary = currentTheme.primary;

  const categories: CategoryProps[] = [
    { icon: <Briefcase className="h-5 w-5" />, name: "Work", color: "journal-blue", count: 12 },
    { icon: <Heart className="h-5 w-5" />, name: "Personal", color: "journal-purple", count: 18 },
    { icon: <Glasses className="h-5 w-5" />, name: "Learning", color: "journal-yellow", count: 7 },
    { icon: <Utensils className="h-5 w-5" />, name: "Health", color: "journal-green", count: 9 },
    { icon: <Dumbbell className="h-5 w-5" />, name: "Fitness", color: "journal-orange", count: 5 },
    { icon: <BookOpen className="h-5 w-5" />, name: "Reading", color: "journal-indigo", count: 3 },
    { icon: <Home className="h-5 w-5" />, name: "Home", color: "journal-red", count: 4 },
    { icon: <Plus className="h-5 w-5" />, name: "Add New", color: "primary", count: 0 },
  ];

  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Tag className="h-5 w-5" style={{ color: currentTheme.primary }} />
            Categories
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {categories.map((category) => (
            <Category 
              key={category.name}
              icon={category.icon}
              name={category.name}
              color={category.color}
              count={category.count}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EntryCategories;