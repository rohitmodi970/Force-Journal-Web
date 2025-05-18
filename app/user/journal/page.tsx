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
  className: string; // Add className for Tailwind classes
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
    value: "linear-gradient(to bottom right, #fffbeb, #fef3c7)", // CSS gradient value
    className: "bg-gradient-to-br from-amber-50 to-amber-100"    // Tailwind class for the Layout
  },
  {
    type: "gradient",
    name: "Sunset",
    value: "linear-gradient(to bottom right, #fed7aa, #fda4af)",
    className: "bg-gradient-to-br from-orange-200 to-rose-300"
  },
  {
    type: "gradient",
    name: "Ocean",
    value: "linear-gradient(to bottom right, #bae6fd, #cffafe)",
    className: "bg-gradient-to-br from-blue-200 to-cyan-100"
  },
  {
    type: "gradient",
    name: "Forest",
    value: "linear-gradient(to bottom right, #dcfce7, #a7f3d0)",
    className: "bg-gradient-to-br from-green-100 to-emerald-200"
  },
  {
    type: "gradient",
    name: "Lavender",
    value: "linear-gradient(to bottom right, #f3e8ff, #f5d0fe)",
    className: "bg-gradient-to-br from-purple-100 to-fuchsia-200"
  },
  {
    type: "image",
    name: "Rainbow Blur 1",
    value: "https://images.unsplash.com/photo-1707742984673-ae30d982bdec?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    type: "image",
    name: "Rainbow Blur 2",
    value: "https://images.unsplash.com/photo-1729575846511-f499d2e17d79?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    type: "image",
    name: "Rainbow Blur 3",
    value: "https://images.unsplash.com/photo-1729601648807-3c45ee96343d?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
];

// Helper function to convert CSS direction to Tailwind direction
const cssToTailwindDirection = (cssDirection: string): string => {
  const directionMap: { [key: string]: string } = {
    "to right": "to-r",
    "to left": "to-l",
    "to top": "to-t",
    "to bottom": "to-b",
    "to top right": "to-tr",
    "to top left": "to-tl",
    "to bottom right": "to-br",
    "to bottom left": "to-bl"
  };

  return directionMap[cssDirection] || "to-r";
};

// Helper function to convert Tailwind direction to CSS direction
const tailwindToCssDirection = (tailwindDirection: string): string => {
  const directionMap: { [key: string]: string } = {
    "to-r": "to right",
    "to-l": "to left",
    "to-t": "to top",
    "to-b": "to bottom",
    "to-tr": "to top right",
    "to-tl": "to top left",
    "to-br": "to bottom right",
    "to-bl": "to bottom left"
  };

  return directionMap[tailwindDirection] || "to right";
};

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
        // Handle custom gradients specifically
        if (parsed.type === "customGradient" && parsed.value) {
          setSelectedBackground({
            ...parsed,
            value: {
              color1: parsed.value.color1 || "#FFFFFF",
              color2: parsed.value.color2 || "#EEEEEE",
              direction: parsed.value.direction || "to-r"
            }
          });
        } else {
          setSelectedBackground(parsed as BackgroundOption);
        }
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
    const newBackground: CustomGradientBackground = {
      type: "customGradient",
      name: "Custom Gradient",
      value: {
        color1: gradientColor1,
        color2: gradientColor2,
        direction: gradientDirection
      }
    };
    handleBackgroundSelect(newBackground);
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
    if (selectedBackground.type === "gradient" && "className" in selectedBackground) {
      return selectedBackground.className;
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
    } else if (selectedBackground.type === "gradient") {
      // Use the CSS value for gradient backgrounds in preview
      return {
        backgroundImage: selectedBackground.value
      };
    } else if (selectedBackground.type === "customGradient") {
      const { color1, color2, direction } = selectedBackground.value;
      const cssDirection = tailwindToCssDirection(direction);
      return {
        backgroundImage: `linear-gradient(${cssDirection}, ${color1}, ${color2})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed'
      };
    }
    return {};
  };

  // Helper function to render preset background button styles
  const getPresetButtonStyle = (bg: BackgroundOption) => {
    if (bg.type === "image") {
      return {
        backgroundImage: `url(${bg.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else if (bg.type === "gradient") {
      return {
        backgroundImage: bg.value
      };
    } else if (bg.type === "solid") {
      return {
        backgroundColor: bg.value
      };
    } else if (bg.type === "customGradient") {
      const { color1, color2, direction } = bg.value;
      return {
        backgroundImage: `linear-gradient(${tailwindToCssDirection(direction)} ${color1}, ${color2})`
      };
    }
    return {};
  };

  // Helper function to check if a background is selected
  const isBackgroundSelected = (bg: BackgroundOption) => {
    if (selectedBackground.type !== bg.type) return false;

    if (bg.type === "customGradient" && selectedBackground.type === "customGradient") {
      return JSON.stringify(selectedBackground.value) === JSON.stringify(bg.value);
    } else if ((bg.type === "gradient" || bg.type === "solid" || bg.type === "image") &&
      (selectedBackground.type === "gradient" || selectedBackground.type === "solid" || selectedBackground.type === "image")) {
      return selectedBackground.value === bg.value;
    }

    return false;
  };

  return (
    <Layout
      backgroundClass={selectedBackground.type === "gradient" && "className" in selectedBackground
        ? selectedBackground.className
        : ""}
      backgroundStyle={getBackgroundStyle()}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-journal mb-2">My Journal</h1>
          <p className="text-muted-foreground font-handwriting text-xl">
            A collection of Journal
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
                      className={`w-full aspect-square rounded-md border-2 transition-all ${isBackgroundSelected(bg) ? 'border-amber-800 scale-105' : 'border-gray-200'
                        }`}
                      style={getPresetButtonStyle(bg)}
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
                        onClick={() => handleBackgroundSelect({
                          type: "image",
                          name: `Journal Image ${index + 1}`,
                          value: imgUrl
                        })}
                        className={`w-full aspect-square rounded-md border-2 transition-all ${selectedBackground.type === "image" && selectedBackground.value === imgUrl
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
              <div
                className="h-20 rounded border-2"
                style={{ backgroundColor: customColor }}
              ></div>
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

              <div
                className="h-20 rounded border-2"
                style={{
                  backgroundImage: `linear-gradient(${tailwindToCssDirection(gradientDirection)}, ${gradientColor1}, ${gradientColor2})`,
                  backgroundSize: 'cover'
                }}
              ></div>

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
                <div
                  className="h-32 rounded border-2 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${customImageUrl})`
                  }}
                ></div>
              )}

              <button
                onClick={applyCustomImageUrl}
                disabled={!customImageUrl.trim()}
                className={`w-full py-2 rounded transition-colors ${!customImageUrl.trim()
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