"use client"
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { JournalEntry } from "./types";
import JournalPage from "./JournalPage";
import DecorativePage from "./DecorativePage";
import { Button } from "@/components/ui/button2";
import { ArrowLeft, ArrowRight, Edit, Image, Palette, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from  "../ui/journal/ui/tabs";
import { useRouter } from "next/navigation";

// Dynamically import HTMLFlipBook with no SSR to avoid hydration issues
const HTMLFlipBook = dynamic(() => import("react-pageflip"), { 
  ssr: false,
  loading: () => <div className="w-[550px] h-[733px] bg-gradient-to-br from-card to-muted/30 animate-pulse"></div>
});

interface PageFlipBookProps {
  entries: JournalEntry[];
}

// Predefined background options
const backgroundPresets = [
  { name: "Parchment", class: "bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3]" },
  { name: "Vintage", class: "bg-gradient-to-br from-[#ddd6f3] to-[#faaca8]" },
  { name: "Moonlight", class: "bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2]" },
  { name: "Autumn", class: "bg-gradient-to-br from-[#f6d365] to-[#fda085]" },
  { name: "Forest", class: "bg-gradient-to-br from-[#e6b980] to-[#eacda3]" },
  { name: "Ocean", class: "bg-gradient-to-br from-[#96deda] to-[#50c9c3]" },
  { name: "Lavender", class: "bg-gradient-to-br from-[#c9d6ff] to-[#e2e2e2]" },
  { name: "Desert", class: "bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2]" }
];

// Gradient directions
const gradientDirections = [
  { name: "Top to Bottom", value: "to-b" },
  { name: "Bottom to Top", value: "to-t" },
  { name: "Left to Right", value: "to-r" },
  { name: "Right to Left", value: "to-l" },
  { name: "Top Left to Bottom Right", value: "to-br" },
  { name: "Bottom Right to Top Left", value: "to-tl" },
  { name: "Top Right to Bottom Left", value: "to-bl" },
  { name: "Bottom Left to Top Right", value: "to-tr" }
];

// Paper texture options
const textureOptions = [
  { name: "None", class: "" },
  { name: "Paper Grain", class: "bg-[url('/textures/paper-grain.png')] bg-repeat" },
  { name: "Fine Grid", class: "bg-[url('/textures/fine-grid.png')] bg-repeat" },
  { name: "Linen", class: "bg-[url('/textures/linen.png')] bg-repeat" },
  { name: "Subtle Dots", class: "bg-[url('/textures/subtle-dots.png')] bg-repeat" }
];

const PageFlipBook = ({ entries }: PageFlipBookProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const bookRef = useRef<any>(null);
  const router = useRouter();

  // Background state
  const [activeTab, setActiveTab] = useState("presets");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [solidColor, setSolidColor] = useState("#ffffff");
  const [gradientStartColor, setGradientStartColor] = useState("#fdfcfb");
  const [gradientEndColor, setGradientEndColor] = useState("#e2d1c3");
  const [gradientDirection, setGradientDirection] = useState("to-br");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedTexture, setSelectedTexture] = useState(0);
  const [backgroundType, setBackgroundType] = useState("preset");
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);

  // Use effect to confirm component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Calculate total pages including decorative pages
  const totalPages = Math.ceil(entries.length * 1.5) * 2;
  
  const handlePageFlip = (e: any) => {
    setCurrentPage(e.data);
  };
  
  const nextPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };
  
  const prevPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };
  
  // Create array of pages including decorative pages
  const pages = [];
  let entryIndex = 0;
  
  for (let i = 0; i < totalPages; i++) {
    if (i % 3 !== 2) { // Add journal entries on non-decorative pages
      if (entries[entryIndex]) {
        pages.push(entries[entryIndex]);
        entryIndex++;
      } else {
        pages.push(null);
      }
    } else { // Add decorative page every third spread
      pages.push('decorative');
    }
  }

  // Handle button clicks with debounce
  const handlePrevClick = () => {
    requestAnimationFrame(() => {
      prevPage();
    });
  };

  const handleNextClick = () => {
    requestAnimationFrame(() => {
      nextPage();
    });
  };

  // Navigate to edit page for the current entry
  const handleEditEntry = (entryId: string) => {
    router.push(`/journal-entry-edit/${entryId}`);
  };

  // Get background class or style based on current settings
  const getBackgroundClass = () => {
    switch (backgroundType) {
      case "preset":
        return backgroundPresets[selectedPreset].class;
      case "solid":
        return ""; // No class for solid color, using inline style
      case "gradient":
        return `bg-gradient-${gradientDirection}`;
      case "image":
        return "bg-cover bg-center";
      default:
        return backgroundPresets[0].class;
    }
  };

  const getBackgroundStyle = () => {
    switch (backgroundType) {
      case "solid":
        return { backgroundColor: solidColor };
      case "gradient":
        return { 
          backgroundImage: `linear-gradient(${gradientDirection.replace('to-', '').split('').map(c => c === 'r' ? 'right' : c === 'l' ? 'left' : c === 't' ? 'top' : c === 'b' ? 'bottom' : '').join(' ')}, ${gradientStartColor}, ${gradientEndColor})`
        };
      case "image":
        return { backgroundImage: `url(${imageUrl})` };
      default:
        return {};
    }
  };

  // Combine background and texture
  const getCombinedBackground = (isEven: boolean) => {
    const baseClass = getBackgroundClass();
    const textureClass = textureOptions[selectedTexture].class;
    const evenOddClass = isEven ? 'even-page' : 'odd-page';
    
    return `diary-page h-[733px] ${baseClass} ${textureClass} ${evenOddClass}`;
  };

  if (!isClient) {
    return (
      <div className="relative mx-auto my-10 px-4 flex justify-center">
        <div className="w-[550px] h-[733px] bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] animate-pulse"></div>
      </div>
    );
  }
  
  return (
    <div className="relative mx-auto my-10 px-4">
      {/* Background Selector Panel */}
      {showBackgroundSelector && (
        <div className="absolute top-0 right-0 bg-background border rounded-lg shadow-xl p-4 z-20 w-full max-w-md max-h-[500px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Background Options</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowBackgroundSelector(false)}
              className="h-8 w-8 p-0"
            >
              &times;
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="presets" className="flex items-center gap-1">
                <Palette className="h-4 w-4" /> Presets
              </TabsTrigger>
              <TabsTrigger value="solid" className="flex items-center gap-1">
                <Layers className="h-4 w-4" /> Solid
              </TabsTrigger>
              <TabsTrigger value="gradient" className="flex items-center gap-1">
                <Palette className="h-4 w-4" /> Gradient
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-1">
                <Image className="h-4 w-4" /> Image
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {backgroundPresets.map((preset, idx) => (
                  <div
                    key={idx}
                    className={`h-20 rounded-md cursor-pointer transition-all duration-200 ${
                      selectedPreset === idx && backgroundType === "preset" ? "ring-2 ring-primary scale-95" : ""
                    }`}
                    style={{ backgroundImage: preset.class.split("from-")[1].split(" ")[0] && preset.class.split("to-")[1].split(" ")[0] ? 
                      `linear-gradient(to bottom right, ${preset.class.split("from-")[1].split(" ")[0].replace("[", "").replace("]", "")}, ${preset.class.split("to-")[1].split(" ")[0].replace("[", "").replace("]", "")})` : "" }}
                    onClick={() => {
                      setSelectedPreset(idx);
                      setBackgroundType("preset");
                    }}
                  >
                    <div className="h-full w-full flex items-center justify-center text-center p-2">
                      <span className="text-sm font-medium text-white drop-shadow-md">{preset.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="solid" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Choose a color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={solidColor}
                    onChange={(e) => setSolidColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={solidColor}
                    onChange={(e) => setSolidColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    placeholder="#ffffff"
                  />
                </div>
                <div 
                  className="h-20 rounded-md mt-3"
                  style={{ backgroundColor: solidColor }}
                />
                <Button 
                  className="w-full mt-2" 
                  onClick={() => setBackgroundType("solid")}
                >
                  Apply Solid Color
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="gradient" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={gradientStartColor}
                    onChange={(e) => setGradientStartColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={gradientStartColor}
                    onChange={(e) => setGradientStartColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    placeholder="#ffffff"
                  />
                </div>
                
                <label className="block text-sm font-medium mb-2 mt-3">End Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={gradientEndColor}
                    onChange={(e) => setGradientEndColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={gradientEndColor}
                    onChange={(e) => setGradientEndColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    placeholder="#ffffff"
                  />
                </div>
                
                <label className="block text-sm font-medium mb-2 mt-3">Direction</label>
                <select
                  value={gradientDirection}
                  onChange={(e) => setGradientDirection(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  {gradientDirections.map((dir, idx) => (
                    <option key={idx} value={dir.value}>{dir.name}</option>
                  ))}
                </select>
                
                <div 
                  className="h-20 rounded-md mt-3"
                  style={{ 
                    backgroundImage: `linear-gradient(${gradientDirection.replace('to-', '').split('').map(c => c === 'r' ? 'right' : c === 'l' ? 'left' : c === 't' ? 'top' : c === 'b' ? 'bottom' : '').join(' ')}, ${gradientStartColor}, ${gradientEndColor})` 
                  }}
                />
                
                <Button 
                  className="w-full mt-2" 
                  onClick={() => setBackgroundType("gradient")}
                >
                  Apply Gradient
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="image" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder="https://example.com/image.jpg"
                />
                
                {imageUrl && (
                  <div className="mt-3 rounded-md overflow-hidden" style={{ height: "120px" }}>
                    <img 
                      src={imageUrl} 
                      alt="Background preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>
                )}
                
                <Button 
                  className="w-full mt-3" 
                  onClick={() => setBackgroundType("image")}
                  disabled={!imageUrl}
                >
                  Apply Image
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 pt-4 border-t">
            <label className="block text-sm font-medium mb-2">Add Texture Overlay</label>
            <div className="grid grid-cols-3 gap-2">
              {textureOptions.map((texture, idx) => (
                <div
                  key={idx}
                  className={`h-16 border rounded-md cursor-pointer transition-all duration-200 ${texture.class} ${
                    selectedTexture === idx ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedTexture(idx)}
                >
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-xs font-medium">{texture.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center perspective-[2000px]">
        {isClient && (
          <HTMLFlipBook
            ref={bookRef}
            width={550}
            height={733}
            size="fixed"
            minWidth={315}
            maxWidth={1000}
            minHeight={400}
            maxHeight={1533}
            maxShadowOpacity={0.2}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={handlePageFlip}
            className="shadow-xl"
            startPage={0}
            drawShadow={true}
            flippingTime={800}
            usePortrait={false}
            startZIndex={0}
            autoSize={false}
            clickEventForward={false}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
            style={{ 
              ...getBackgroundStyle(),
              willChange: "transform"
            }}
          >
            {pages.map((page, index) => (
              <div key={index} className="page-wrapper">
                {page === 'decorative' ? (
                  <DecorativePage isEven={index % 2 === 0} backgroundClass={getCombinedBackground(index % 2 === 0)} backgroundStyle={getBackgroundStyle()} />
                ) : page && typeof page !== 'string' ? (
                  <div className="relative">
                    <JournalPage 
                      entry={page} 
                      isEven={index % 2 === 0} 
                      backgroundClass={getCombinedBackground(index % 2 === 0)}
                      backgroundStyle={getBackgroundStyle()}
                    />
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-background/50 hover:bg-background/80 rounded-full shadow-sm backdrop-blur-sm p-2"
                      onClick={() => handleEditEntry(page.journalId)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button> */}
                  </div>
                ) : (
                  <div 
                    className={`${getCombinedBackground(index % 2 === 0)} h-[733px]`}
                    style={{
                      ...getBackgroundStyle(),
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.1), 5px 5px 15px rgba(0, 0, 0, 0.1)"
                    }}
                  />
                )}
              </div>
            ))}
          </HTMLFlipBook>
        )}
      </div>
      
      <div className="flex justify-between absolute w-full top-1/2 -translate-y-1/2 px-8">
        <Button
          variant="secondary"
          size="icon"
          onClick={handlePrevClick}
          disabled={currentPage === 0}
          className="rounded-full bg-background/80 hover:bg-background shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 z-10"
          aria-label="Previous page"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Button
          variant="secondary"
          size="icon"
          onClick={handleNextClick}
          disabled={currentPage >= totalPages - 2}
          className="rounded-full bg-background/80 hover:bg-background shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 z-10"
          aria-label="Next page"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="mt-6 flex justify-center gap-4">
        <div className="text-center text-sm font-journal text-muted-foreground">
          Page {currentPage + 1} of {totalPages}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-sm font-journal"
          onClick={() => setShowBackgroundSelector(!showBackgroundSelector)}
        >
          <Palette className="h-4 w-4" />
          {showBackgroundSelector ? "Hide Background Options" : "Customize Background"}
        </Button>
      </div>
    </div>
  );
};

export default PageFlipBook;