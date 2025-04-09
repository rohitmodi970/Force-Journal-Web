"use client"
import React, { useEffect, useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { HiHome, HiUser, HiMail, HiDocumentText, HiSun, HiMoon, HiLogin, HiLogout, HiArchive } from "react-icons/hi";
import { useTheme } from "@/utilities/context/ThemeContext";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Dock from "./ui/Dock";

// Define menu item interface
interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const Navbar: React.FC = () => {
  const { currentTheme, isDarkMode, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  // Check if current page is a journal page
  const isJournalPage = pathname?.includes('/journal-entry');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems: MenuItem[] = [
    { name: "Home", href: "/", icon: <HiHome className="w-5 h-5" /> },
    { name: "About", href: "/about", icon: <HiUser className="w-5 h-5" /> },
    { name: "Contact", href: "/contact", icon: <HiMail className="w-5 h-5" /> },
    { name: "Journal", href: "/journal-entry", icon: <HiDocumentText className="w-5 h-5" /> },
  ];

  function handleAuth() {
    if (session) {
      signOut();
    } else {
      signIn();
    }
  }

  // Create dock items using Hi icons instead of Vsc
  const dockItems = [
    { 
      icon: <HiHome size={24} />, 
      label: 'Home', 
      onClick: () => router.push("/"),
      className: pathname === "/" ? "active-dock-item" : ""
    },
    { 
      icon: <HiArchive size={24} />, 
      label: 'Journal', 
      onClick: () => router.push("/journal-entry"),
      className: pathname?.includes("/journal-entry") ? "active-dock-item" : ""
    },
    { 
      icon: <HiUser size={24} />, 
      label: 'Profile', 
      onClick: () => router.push("/about"),
      className: pathname === "/about" ? "active-dock-item" : ""
    },
    { 
      icon: isDarkMode ? <HiSun size={24} /> : <HiMoon size={24} />, 
      label: isDarkMode ? 'Light Mode' : 'Dark Mode', 
      onClick: toggleDarkMode 
    },
    { 
      icon: session ? <HiLogout size={24} /> : <HiLogin size={24} />, 
      label: session ? 'Logout' : 'Login', 
      onClick: handleAuth 
    },
  ];

  // Build the navbar classes based on whether it's a journal page
  const navbarClasses = isJournalPage 
    ? `fixed left-6 top-1/2 -translate-y-1/2 h-[60vh] rounded-2xl z-50 transition-all duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      } bg-opacity-90 shadow-lg ${
        isOpen ? "w-64" : "w-20"
      } overflow-hidden flex flex-col justify-center`
    : `fixed top-6 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-lg shadow-md rounded-3xl transition-all duration-300 ${
        isScrolled 
          ? `${isDarkMode ? "bg-gray-800" : "bg-gray-200"} bg-opacity-80 w-[60vw] py-2` 
          : `${isDarkMode ? "bg-gray-900" : "bg-white"} bg-opacity-80 w-[90vw] py-5 px-2.5`
      }`;

  const activeNavItemClasses = "flex items-center px-4 py-2 rounded-md font-medium";
  const activeClass = `${activeNavItemClasses} bg-primary-light text-primary`;
  const inactiveClass = `${activeNavItemClasses} hover:bg-hover ${isDarkMode ? "text-gray-300" : "text-gray-600"} hover:text-primary transition-colors`;

  // Side navigation specific classes
  const sideNavItemClass = "flex items-center px-4 py-3 hover:bg-hover transition-colors";
  const activeSideNavItem = `${sideNavItemClass} border-l-4 border-primary`;
  const inactiveSideNavItem = `${sideNavItemClass} ${isDarkMode ? "text-gray-300" : "text-gray-600"}`;

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

  // Add custom CSS to fix dock styling
  useEffect(() => {
    // Add necessary CSS for the dock to work properly
    const style = document.createElement('style');
    style.innerHTML = `
      /* Custom dock styling */
      .active-dock-item {
        position: relative;
      }
      .active-dock-item::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        width: 5px;
        height: 5px;
        background-color: ${currentTheme.primary};
        border-radius: 50%;
      }
      
      /* Ensure icons are visible */
      .dock-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        color: ${isDarkMode ? '#f3f4f6' : '#111827'};
      }
      
      /* Remove rotation from icons */
      .vertical-dock .dock-icon svg {
        transform: rotate(90deg);
      }
      
      /* Fix tooltip positioning */
      .vertical-dock .dock-label {
        transform: rotate(90deg) translateX(-50%);
        transform-origin: left center;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [currentTheme.primary, isDarkMode]);

  // Content for the side navigation with Dock
  if (isJournalPage) {
    return (
      <nav className={navbarClasses}>
        <div className="flex flex-col h-full justify-between w-full">
          {/* Top section with logo and toggle */}
          <div className="px-4 pt-4 flex justify-between items-center">
            <span 
              className={`text-xl font-bold ${!isOpen && "hidden"}`}
              style={textGradientStyle}
            >
              Journal App
            </span>
            <button
              className={`p-2 rounded-md ${
                isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <IoClose className="w-6 h-6" /> : <IoMenu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Main section with dock or expanded menu */}
          <div className="flex justify-center items-center flex-grow">
            {isOpen ? (
              // Traditional menu for expanded state
              <div className="space-y-2 w-full">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href === "/journal-entry" && pathname?.includes('/journal-entry'));
                  
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={isActive ? activeSideNavItem : inactiveSideNavItem}
                      style={isActive ? { 
                        borderColor: currentTheme.primary,
                        color: currentTheme.primary
                      } : {}}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.name}</span>
                    </a>
                  );
                })}
                <div className="pt-4 px-2">
                  <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center p-2 rounded-full transition-colors"
                    style={{
                      color: isDarkMode ? currentTheme.hover : currentTheme.primary,
                    }}
                    aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {isDarkMode ? <HiSun className="w-5 h-5 mr-2" /> : <HiMoon className="w-5 h-5 mr-2" />}
                    <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                  </button>
                  
                  <button
                    onClick={handleAuth}
                    className="w-full mt-2 px-4 py-2 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                    style={buttonGradientStyle}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundImage = buttonHoverGradientStyle.backgroundImage;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundImage = buttonGradientStyle.backgroundImage;
                    }}
                  >
                    {session ? "Logout" : "Login / Signup"}
                  </button>
                </div>
              </div>
            ) : (
              // Simplified vertical dock for collapsed state - no rotation to avoid issues
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center space-y-6">
                  {dockItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className={`p-2 rounded-full transition-all hover:bg-opacity-20 hover:bg-gray-500 ${
                        item.className || ""
                      }`}
                      style={{
                        color: item.className ? currentTheme.primary : (isDarkMode ? "#f3f4f6" : "#111827")
                      }}
                      aria-label={item.label as string}
                    >
                      {item.icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom section - empty for balance */}
          <div className="h-4"></div>
        </div>
      </nav>
    );
  }

  // Regular navbar for non-journal pages
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
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              );
            })}
          </div>
          <div className="flex items-center ml-4 gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
              }`}
              aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleAuth}
              className="px-4 py-2 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              style={buttonGradientStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundImage = buttonHoverGradientStyle.backgroundImage;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundImage = buttonGradientStyle.backgroundImage;
              }}
            >
              {session ? "Logout" : "Login / Signup"}
            </button>
          </div>
          <button
            className={`md:hidden p-2 rounded-md ${
              isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-700"
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <IoClose className="w-6 h-6" /> : <IoMenu className="w-6 h-6" />}
          </button>
        </div>
        {isOpen && (
          <div className={`md:hidden mt-2 py-2 rounded-lg shadow-lg ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 ${
                    isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
                  } ${isActive ? "font-medium" : ""}`}
                  style={isActive ? { color: currentTheme.primary } : {}}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              );
            })}
            <button
              onClick={() => {
                handleAuth();
                setIsOpen(false);
              }}
              className={`flex items-center w-full text-left px-4 py-2 ${
                isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span>{session ? "Logout" : "Login / Signup"}</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;