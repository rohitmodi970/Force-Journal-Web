"use client"

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import PageFlipBook from "@/components/Journal/PageFlipBook";
import { getAllJournalEntries } from "@/utilities/journal-data";
import Link from "next/link";
import { BookOpen, Palette, Image as ImageIcon, Plus } from "lucide-react";
import { JournalEntry } from "@/components/Journal/types";

// Define types for background options
type GradientBackground = {
  type: "gradient";
  name: string;
  value: string;
};

type SolidBackground = {
  type: "solid";
  name: string;
  value: string;
};

type ImageBackground = {
  type: "image";
  name: string;
  value: string;
};

type CustomGradientBackground = {
  type: "customGradient";
  name: string;
  value: {
    color1: string;
    color2: string;
    direction: string;
  };
};

// Union type for all background types
type BackgroundOption = 
  | GradientBackground 
  | SolidBackground 
  | ImageBackground 
  | CustomGradientBackground;

// Background options with predefined gradients and images
const backgroundOptions: BackgroundOption[] = [
  { 
    type: "gradient", 
    name: "Default", 
    value: "bg-gradient-to-br from-amber-50 to-amber-100" 
  },
  { 
    type: "gradient", 
    name: "Sunset", 
    value: "bg-gradient-to-br from-orange-200 to-rose-300" 
  },
  { 
    type: "gradient", 
    name: "Ocean", 
    value: "bg-gradient-to-br from-blue-200 to-cyan-100" 
  },
  { 
    type: "gradient", 
    name: "Forest", 
    value: "bg-gradient-to-br from-green-100 to-emerald-200" 
  },
  { 
    type: "gradient", 
    name: "Lavender", 
    value: "bg-gradient-to-br from-purple-100 to-fuchsia-200" 
  },
  {
    type: "image",
    name: "Rainbow Blur",
    value: "https://images.unsplash.com/photo-1707742984673-ae30d982bdec?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  
  {
    type: "image",
    name: "Rainbow Blur",
    value: "https://images.unsplash.com/photo-1729575846511-f499d2e17d79?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    type: "image",
    name: "Rainbow Blur",
    value: "https://images.unsplash.com/photo-1729601648807-3c45ee96343d?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
];

const JournalPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(backgroundOptions[0]);
  const [entryImages, setEntryImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("preset");
  
  // Custom background states
  const [customColor, setCustomColor] = useState("#FFFFFF");
  const [gradientColor1, setGradientColor1] = useState("#FFFFFF");
  const [gradientColor2, setGradientColor2] = useState("#EEEEEE");
  const [gradientDirection, setGradientDirection] = useState("to-r");
  const [customImageUrl, setCustomImageUrl] = useState("");

  useEffect(() => {
    async function loadJournalEntries() {
      try {
        setIsLoading(true);
        const fetchedEntries = await getAllJournalEntries();
        setEntries(fetchedEntries);
        
        // Extract all images from entries
        const allImages = fetchedEntries.flatMap(entry => 
          entry.mediaUrl?.image || []
        );
        setEntryImages(allImages);
      } catch (err) {
        console.error('Failed to load journal entries:', err);
        setError('Failed to load journal entries. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadJournalEntries();
    
    // Load saved background preference from localStorage
    const savedBackground = localStorage.getItem('journalBackground');
    if (savedBackground) {
      try {
        const parsed = JSON.parse(savedBackground);
        setSelectedBackground(parsed as BackgroundOption);
      } catch (e) {
        console.error('Failed to parse saved background', e);
      }
    }
  }, []);

  const handleBackgroundSelect = (background: BackgroundOption) => {
    setSelectedBackground(background);
    localStorage.setItem('journalBackground', JSON.stringify(background));
    setShowBackgroundSelector(false);
  };

  const applyCustomColor = () => {
    handleBackgroundSelect({
      type: "solid",
      name: "Custom Color",
      value: customColor
    });
  };

  const applyCustomGradient = () => {
    handleBackgroundSelect({
      type: "customGradient",
      name: "Custom Gradient",
      value: {
        color1: gradientColor1,
        color2: gradientColor2,
        direction: gradientDirection
      }
    });
  };

  const applyCustomImageUrl = () => {
    if (customImageUrl.trim()) {
      handleBackgroundSelect({
        type: "image",
        name: "Custom Image URL",
        value: customImageUrl
      });
    }
  };

  // Create background style based on selection
  const getBackgroundClass = () => {
    if (selectedBackground.type === "gradient") {
      return selectedBackground.value;
    }
    return "";
  };

  const getBackgroundStyle = () => {
    if (selectedBackground.type === "image") {
      return { 
        backgroundImage: `url(${selectedBackground.value})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      };
    } else if (selectedBackground.type === "solid") {
      return { backgroundColor: selectedBackground.value };
    } else if (selectedBackground.type === "customGradient") {
      const { color1, color2, direction } = selectedBackground.value;
      return { 
        backgroundImage: `linear-gradient(${direction.replace('to-', '')} ${color1}, ${color2})` 
      };
    }
    return {};
  };

  return (
    <Layout
      backgroundClass={getBackgroundClass()}
      backgroundStyle={getBackgroundStyle()}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-journal mb-2">My Travel Journal</h1>
          <p className="text-muted-foreground font-handwriting text-xl">
            A collection of memories from the Mandarmani beach trip
          </p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p>Loading your journal entries...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <p>No journal entries found. Start creating your first entry!</p>
          </div>
        ) : (
          <PageFlipBook entries={entries} />
        )}
      </div>
      
      {/* Background selector toggle button */}
      <div className="fixed bottom-8 right-8 z-50 flex gap-3">
        <button
          onClick={() => setShowBackgroundSelector(!showBackgroundSelector)}
          className="flex items-center gap-2 bg-amber-800 hover:bg-amber-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
        >
          <Palette className="w-5 h-5" />
          <span>Change Background</span>
        </button>
        
        <Link
          href="/journal/journal-gallery"
          className="flex items-center gap-2 bg-amber-800 hover:bg-amber-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          <span>Gallery View</span>
        </Link>
      </div>
      
      {/* Background selector panel */}
      {showBackgroundSelector && (
        <div className="fixed bottom-24 right-8 z-50 bg-white rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Choose Background</h3>
            <button 
              onClick={() => setShowBackgroundSelector(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex mb-4 border-b">
            <button 
              className={`px-3 py-2 ${activeTab === 'preset' ? 'border-b-2 border-amber-800 text-amber-800' : 'text-gray-500'}`}
              onClick={() => setActiveTab('preset')}
            >
              Presets
            </button>
            <button 
              className={`px-3 py-2 ${activeTab === 'solid' ? 'border-b-2 border-amber-800 text-amber-800' : 'text-gray-500'}`}
              onClick={() => setActiveTab('solid')}
            >
              Solid Color
            </button>
            <button 
              className={`px-3 py-2 ${activeTab === 'gradient' ? 'border-b-2 border-amber-800 text-amber-800' : 'text-gray-500'}`}
              onClick={() => setActiveTab('gradient')}
            >
              Gradient
            </button>
            <button 
              className={`px-3 py-2 ${activeTab === 'image' ? 'border-b-2 border-amber-800 text-amber-800' : 'text-gray-500'}`}
              onClick={() => setActiveTab('image')}
            >
              Image URL
            </button>
          </div>
          
          {/* Preset backgrounds tab */}
          {activeTab === 'preset' && (
            <>
              <div className="mb-4">
                <h4 className="font-medium mb-2">Preset Backgrounds</h4>
                <div className="grid grid-cols-4 gap-2">
                  {backgroundOptions.map((bg, index) => (
                    <button
                      key={index}
                      onClick={() => handleBackgroundSelect(bg)}
                      className={`w-full aspect-square rounded-md border-2 transition-all ${
                        selectedBackground.type === bg.type && 
                        (bg.type === "customGradient" 
                          ? JSON.stringify(selectedBackground.value) === JSON.stringify(bg.value)
                          : selectedBackground.value === bg.value)
                          ? 'border-amber-800 scale-105' : 'border-gray-200'
                      }`}
                      style={
                        bg.type === "image" 
                          ? { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover' } 
                          : bg.type === "gradient" 
                            ? { background: bg.value.replace('bg-', '') } 
                            : { backgroundColor: typeof bg.value === 'string' ? bg.value : undefined }
                      }
                      title={bg.name}
                    />
                  ))}
                </div>
              </div>
              
              {entryImages.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Your Journal Images</h4>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {entryImages.map((imgUrl, index) => (
                      <button
                        key={index}
                        onClick={() => handleBackgroundSelect({ type: "image", name: `Journal Image ${index + 1}`, value: imgUrl })}
                        className={`w-full aspect-square rounded-md border-2 transition-all ${
                          selectedBackground.type === "image" && selectedBackground.value === imgUrl 
                            ? 'border-amber-800 scale-105' : 'border-gray-200'
                        }`}
                        style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover' }}
                        title={`Journal Image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Solid color tab */}
          {activeTab === 'solid' && (
            <div className="space-y-4">
              <h4 className="font-medium mb-2">Pick a Solid Color</h4>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input 
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-1 border rounded p-2"
                />
              </div>
              <div className="h-20 rounded border-2" style={{ backgroundColor: customColor }}></div>
              <button
                onClick={applyCustomColor}
                className="w-full bg-amber-800 hover:bg-amber-700 text-white py-2 rounded transition-colors"
              >
                Apply Color
              </button>
            </div>
          )}
          
          {/* Gradient tab */}
          {activeTab === 'gradient' && (
            <div className="space-y-4">
              <h4 className="font-medium mb-2">Create a Gradient</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Color 1</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={gradientColor1}
                      onChange={(e) => setGradientColor1(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={gradientColor1}
                      onChange={(e) => setGradientColor1(e.target.value)}
                      placeholder="#FFFFFF"
                      className="flex-1 border rounded p-1 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Color 2</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={gradientColor2}
                      onChange={(e) => setGradientColor2(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={gradientColor2}
                      onChange={(e) => setGradientColor2(e.target.value)}
                      placeholder="#EEEEEE"
                      className="flex-1 border rounded p-1 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Direction</label>
                <select
                  value={gradientDirection}
                  onChange={(e) => setGradientDirection(e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="to-r">Left to Right</option>
                  <option value="to-l">Right to Left</option>
                  <option value="to-t">Bottom to Top</option>
                  <option value="to-b">Top to Bottom</option>
                  <option value="to-tr">Bottom Left to Top Right</option>
                  <option value="to-tl">Bottom Right to Top Left</option>
                  <option value="to-br">Top Left to Bottom Right</option>
                  <option value="to-bl">Top Right to Bottom Left</option>
                </select>
              </div>
              
              <div className="h-20 rounded border-2" style={{ 
                backgroundImage: `linear-gradient(${gradientDirection.replace('to-', '')} ${gradientColor1}, ${gradientColor2})` 
              }}></div>
              
              <button
                onClick={applyCustomGradient}
                className="w-full bg-amber-800 hover:bg-amber-700 text-white py-2 rounded transition-colors"
              >
                Apply Gradient
              </button>
            </div>
          )}
          
          {/* Image URL tab */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <h4 className="font-medium mb-2">Add Image URL</h4>
              <div>
                <input 
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border rounded p-2"
                />
              </div>
              
              {customImageUrl && (
                <div className="h-32 rounded border-2 bg-cover bg-center" style={{ 
                  backgroundImage: `url(${customImageUrl})` 
                }}></div>
              )}
              
              <button
                onClick={applyCustomImageUrl}
                disabled={!customImageUrl.trim()}
                className={`w-full py-2 rounded transition-colors ${
                  !customImageUrl.trim() 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-amber-800 hover:bg-amber-700 text-white'
                }`}
              >
                Apply Image
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default JournalPage;