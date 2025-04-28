"use client"
import React, { useState, useEffect } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { HiHome, HiUser, HiMail, HiDocumentText, HiSun, HiMoon, HiOutlineChip, HiLogout } from "react-icons/hi";
import { signIn, signOut, useSession } from "next-auth/react";
import { JSX } from "react/jsx-runtime";
import { Palette } from "lucide-react";
import { GiNotebook } from "react-icons/gi";
import LogoutButton from "../LogoutButton";
// Define props interface for regular navbar
interface RegularNavbarProps {
  currentTheme: {
    name: string;
    primary: string;
    hover: string;
    active: string;
    light: string;
  };
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  pathname: string | null;
  menuItems: {
    name: string;
    href: string;
    icon: string;
  }[];
  isScrolled: boolean;
  colorOptions: Array<{
    name: string;
    primary: string;
    hover: string;
    active: string;
    light: string;
  }>;
  setCurrentTheme: (theme: any) => void;
}

const RegularNavbar: React.FC<RegularNavbarProps> = ({
  currentTheme,
  isDarkMode,
  toggleDarkMode,
  pathname,
  menuItems,
  isScrolled,
  colorOptions = [],
  setCurrentTheme
}) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showThemeSelector, setShowThemeSelector] = useState<boolean>(false);

  // Click outside handler for theme selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showThemeSelector && !target.closest('[data-theme-selector]')) {
        setShowThemeSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showThemeSelector]);

  function handleAuth() {
    if (session) {
      signOut();
    } else {
      signIn();
    }
  }

  // Get the appropriate icon component
  const getIcon = (iconName: string, size = 5) => {
    const icons: { [key: string]: JSX.Element } = {
      HiHome: <HiHome className={`w-${size} h-${size}`} />,
      HiUser: <HiUser className={`w-${size} h-${size}`} />,
      HiMail: <HiMail className={`w-${size} h-${size}`} />,
      HiDocumentText: <HiDocumentText className={`w-${size} h-${size}`} />,
      HiOutlineChip: <HiOutlineChip className={`w-${size} h-${size}`} />,
      GiNotebook: <GiNotebook className={`w-${size} h-${size}`} />
    };
    return icons[iconName] || <HiHome className={`w-${size} h-${size}`} />;
  };

  // Regular navbar classes
  const navbarClasses = `fixed top-6 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-lg shadow-md rounded-3xl transition-all duration-300 ${isScrolled
      ? `${isDarkMode ? "bg-gray-800" : "bg-gray-200"} bg-opacity-80 w-[60vw] py-2`
      : `${isDarkMode ? "bg-gray-900" : "bg-white"} bg-opacity-80 w-[90vw] py-5 px-2.5`
    }`;

  const activeNavItemClasses = "flex items-center px-4 py-2 rounded-md font-medium transition-all duration-300";
  const activeClass = `${activeNavItemClasses} bg-primary-light text-primary`;
  const inactiveClass = `${activeNavItemClasses} hover:bg-hover ${isDarkMode ? "text-gray-300" : "text-gray-600"} hover:text-primary transition-colors`;

  // Dynamic styles based on theme
  const textGradientStyle = {
    backgroundImage: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.hover})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent'
  };

  const buttonGradientStyle = {
    backgroundImage: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.active})`,
  };

  const buttonHoverGradientStyle = {
    backgroundImage: `linear-gradient(to right, ${currentTheme.active}, ${currentTheme.primary})`,
  };

  // Theme selector popup styles
  const themeSelectorStyle = {
    backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
    color: isDarkMode ? "#F9FAFB" : "#1F2937",
    borderColor: isDarkMode ? "#374151" : "#E5E7EB",
  };
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const handleHoveredLinkText = (text: string) => {

    // You can access hoveredText elsewhere in the component if needed
    // or extend this function to show tooltips, status messages, etc.
    setHoveredButton(text);

    // For debugging purposes (can be removed in production)
    console.log(`Hovering: ${text}`);
  }
  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span
              className="text-xl font-bold"
              style={textGradientStyle}
            >
              Journal App
            </span>
          </div>
          <div className="hidden md:flex space-x-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={isActive ? activeClass : inactiveClass}
                  style={isActive ? {
                    backgroundColor: currentTheme.light,
                    color: currentTheme.primary
                  } : {}}
                  title={item.name}
                >
                  <span className={`${isScrolled ? 'mr-0' : 'mr-2'}`}>{getIcon(item.icon)}</span>
                  <span className={`transition-all duration-300 ${isScrolled ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                    {item.name}
                  </span>
                </a>
              );
            })}
          </div>
          <div className="flex items-center ml-4 gap-2">
            {/* Theme Selector Button */}
            <div className="relative" data-theme-selector>
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
                  }`}
                style={{
                  backgroundColor: showThemeSelector
                    ? (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)")
                    : "transparent",
                  color: currentTheme.primary
                }}
                aria-label="Theme options"
                title="Theme options"
              >
                <Palette className="w-5 h-5" />
              </button>

              {/* Theme Selector Popup */}
              {showThemeSelector && (
                <div
                  className="absolute right-0 top-12 w-64 p-4 rounded-lg shadow-lg z-10 border"
                  style={themeSelectorStyle}
                >
                  <h3 className="text-sm font-medium mb-3">Theme Colors</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setCurrentTheme(color)}
                        className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${currentTheme.name === color.name ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                          }`}
                        style={{ backgroundColor: color.primary }}
                        aria-label={`Select ${color.name} theme`}
                      />
                    ))}
                  </div>

                  <h3 className="text-sm font-medium mb-3">Display Mode</h3>
                  <button
                    onClick={() => {
                      toggleDarkMode();
                      setShowThemeSelector(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md w-full transition-colors"
                    style={{
                      backgroundColor: isDarkMode ? currentTheme.primary : 'transparent',
                      color: isDarkMode ? 'white' : (isDarkMode ? "#F9FAFB" : "#1F2937"),
                      border: isDarkMode ? 'none' : '1px solid #E5E7EB'
                    }}
                  >
                    {isDarkMode ? (
                      <>
                        <HiMoon className="w-4 h-4" />
                        <span>Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <HiSun className="w-4 h-4" />
                        <span>Light Mode</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
                }`}
              aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>

            {/* User name display */}
            {session?.user?.name && (
              <span className={`hidden sm:inline-block px-2 py-1 rounded-md text-sm font-medium transition-all duration-300 ${isScrolled ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                }`} style={{ color: currentTheme.primary }}>
                {session.user.name}
              </span>
            )}

            {/* Auth Button */}
            {session ? (
              <LogoutButton 
              className={`transition-all duration-300 text-white font-semibold shadow-md hover:shadow-lg ${
                isScrolled ? 'p-2 rounded-full' : 'px-4 py-2 rounded-full'
              }`}
              style={buttonGradientStyle}
              onMouseEnter={() => handleHoveredLinkText("Logout")}
              text="Logout" // Optional, defaults to "Sign Out" if not provided
            />
            ) : (
              <button
              onMouseEnter={() => handleHoveredLinkText("Login")}
              onClick={handleAuth}
              className={`transition-all duration-300 text-white font-semibold shadow-md hover:shadow-lg ${
                isScrolled ? 'p-2 rounded-full' : 'px-4 py-2 rounded-full'
              }`}
              style={buttonGradientStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundImage = buttonHoverGradientStyle.backgroundImage;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundImage = buttonGradientStyle.backgroundImage;
              }}
              title="Login / Signup"
              >
              {isScrolled ? <HiUser className="w-5 h-5" /> : "Login / Signup"}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-md ${isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-700"
              }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <IoClose className="w-6 h-6" /> : <IoMenu className="w-6 h-6" />}
          </button>

        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={`md:hidden mt-2 py-2 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"
            }`}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 ${isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
                    } ${isActive ? "font-medium" : ""}`}
                  style={isActive ? { color: currentTheme.primary } : {}}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="mr-3">{getIcon(item.icon)}</span>
                  <span>{item.name}</span>
                </a>
              );
            })}

            {/* User name display in mobile menu */}
            {session?.user?.name && (
              <div className="px-4 py-2 mb-1" style={{ color: isDarkMode ? "#9CA3AF" : "#4B5563" }}>
                <span>Signed in as:</span>
                <div className="font-medium mt-1" style={{ color: currentTheme.primary }}>
                  {session.user.name}
                </div>
              </div>
            )}

            {/* Theme Options Section */}
            {session && (
              <div className="px-4 py-2 border-t border-b my-2" style={{ borderColor: isDarkMode ? "#374151" : "#E5E7EB" }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: isDarkMode ? "#9CA3AF" : "#4B5563" }}>Theme Colors</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setCurrentTheme(color)}
                      className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${currentTheme.name === color.name ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                        }`}
                      style={{ backgroundColor: color.primary }}
                      aria-label={`Select ${color.name} theme`}
                    />
                  ))}
                </div>

                <h3 className="text-sm font-medium mb-2" style={{ color: isDarkMode ? "#9CA3AF" : "#4B5563" }}>Display Mode</h3>

                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 px-3 py-2 rounded-md w-full mb-2 transition-colors"
                  style={{
                    backgroundColor: isDarkMode ? currentTheme.primary : 'transparent',
                    color: isDarkMode ? 'white' : (isDarkMode ? "#F9FAFB" : "#1F2937"),
                    border: isDarkMode ? 'none' : '1px solid #E5E7EB'
                  }}
                >
                  {isDarkMode ? (
                    <>
                      <HiMoon className="w-4 h-4" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <HiSun className="w-4 h-4" />
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Auth Button in Mobile Menu */}
            <button
              onClick={() => {
                handleAuth();
                setIsOpen(false);
              }}
              className="w-full text-center py-2 mt-2 mx-4 rounded-full text-white font-semibold"
              style={buttonGradientStyle}
            >
              {session ? "Logout" : "Login / Signup"}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default RegularNavbar;