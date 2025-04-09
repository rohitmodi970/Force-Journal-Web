"use client"
import React, { useState, useEffect, useRef } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { HiHome, HiUser, HiMail, HiDocumentText, HiSun, HiMoon, HiLogin, HiLogout, HiArchive,HiOutlineChip } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { JSX } from "react/jsx-runtime";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

// Define props interface for side navbar
interface SideNavbarProps {
  currentTheme: {
    primary: string;
    hover: string;
    active: string;
    light: string;
  };
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session: any;
  pathname: string | null;
  menuItems: {
    name: string;
    href: string;
    icon: string;
  }[];
}

// Create a separate component for dock items to avoid hook violations
interface DockItemProps {
  icon: JSX.Element;
  label: string;
  isActive: boolean;
  onClick: () => void;
  mouseY: any; // Replace 'any' with a specific type if possible
  index: number;
  currentTheme: {
    primary: string;
    hover: string;
    active: string;
    light: string;
  };
  isDarkMode: boolean;
}

const DockItem: React.FC<DockItemProps> = ({ 
  icon, 
  label, 
  isActive, 
  onClick, 
  mouseY, 
  index, 
  currentTheme, 
  isDarkMode 
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Create dock-like magnification effect
  const distance = 100;
  const baseSize = 50;
  const magnification = 65;
  
  const mouseDistance = useTransform(mouseY, (val) => {
    const rect = itemRef.current?.getBoundingClientRect() ?? { y: 0, height: baseSize };
    return (val as number) - rect.y - baseSize / 2;
  });
  
  const size = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseSize, magnification, baseSize]
  );
  
  const scaledSize = useSpring(size, {
    mass: 0.1,
    stiffness: 150,
    damping: 12
  });
  
  return (
    <motion.div
      ref={itemRef}
      onClick={onClick}
      className={`flex items-center justify-center rounded-full transition-all ${
        isActive ? "bg-opacity-20 bg-gray-500" : ""
      }`}
      style={{
        width: scaledSize,
        height: scaledSize,
        color: isActive ? currentTheme.primary : (isDarkMode ? "#f3f4f6" : "#111827")
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {icon}
      
      {/* Tooltip label */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          className="absolute bottom-0 w-2 h-2 rounded-full"
          style={{ backgroundColor: currentTheme.primary }}
          layoutId="activeIndicator"
        />
      )}
    </motion.div>
  );
};

const SideNavbar: React.FC<SideNavbarProps> = ({
  currentTheme,
  isDarkMode,
  toggleDarkMode,
  session,
  pathname,
  menuItems
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showAllIcons, setShowAllIcons] = useState<boolean>(false);
  const router = useRouter();
  const mouseY = useMotionValue(Infinity);
  const navbarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get the appropriate icon component
  const getIcon = (iconName: string, size = 24) => {
    const icons: { [key: string]: JSX.Element } = {
      HiHome: <HiHome size={size} />,
      HiUser: <HiUser size={size} />,
      HiMail: <HiMail size={size} />,
      HiDocumentText: <HiDocumentText size={size} />,
      HiArchive: <HiArchive size={size} />,
      HiOutlineChip : <HiOutlineChip size={size} />
    };
    return icons[iconName] || <HiHome size={size} />;
  };

  // Check if menu item is active
  const isItemActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href === "/journal-entry" && pathname?.includes("/journal-entry")) return true;
    return pathname === href;
  };

  // Create dock items from menuItems
  const dockItems = menuItems.map(item => ({
    icon: getIcon(item.icon),
    label: item.name,
    onClick: () => router.push(item.href),
    isActive: isItemActive(item.href)
  }));

  // Additional special items
  const specialDockItems = [
    { 
      icon: isDarkMode ? <HiSun size={24} /> : <HiMoon size={24} />, 
      label: isDarkMode ? 'Light Mode' : 'Dark Mode', 
      onClick: toggleDarkMode,
      isActive: false
    },
    { 
      icon: session ? <HiLogout size={24} /> : <HiLogin size={24} />, 
      label: session ? 'Logout' : 'Login', 
      onClick: () => {
        if (session) {
          signOut();
        } else {
          signIn();
        }
      },
      isActive: false
    },
  ];

  // All dock items combined
  const allDockItems = [...dockItems, ...specialDockItems];

  // Handle mouse over to show all icons
  const handleMouseEnter = () => {
    setShowAllIcons(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Handle mouse leave to start hiding inactive icons
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowAllIcons(false);
    }, 2000);
  };

  // Handle mouse move to update mouseY value for dock effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const containerRect = navbarRef.current?.getBoundingClientRect();
    if (containerRect) {
      mouseY.set(e.clientY - containerRect.top);
    }
  };

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Filter items to show
  const visibleItems = showAllIcons 
    ? allDockItems 
    : allDockItems.filter(item => item.isActive);

  return (
    <motion.nav 
      ref={navbarRef}
      className={`fixed left-6 top-1/2 -translate-y-1/2 h-auto rounded-2xl z-50 transition-all duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      } bg-opacity-90 shadow-lg ${
        isOpen ? "w-64" : "w-20"
      } overflow-hidden`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col h-full justify-between w-full">
        {/* Top section with logo and toggle */}
        <div className="px-4 pt-4 flex justify-between items-center">
          <AnimatePresence>
            {isOpen && (
              <motion.span 
                className="text-xl font-bold"
                style={textGradientStyle}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                Journal App
              </motion.span>
            )}
          </AnimatePresence>
          <motion.button
            className={`p-2 rounded-md ${
              isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-700"
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <IoClose className="w-6 h-6" /> : <IoMenu className="w-6 h-6" />}
          </motion.button>
        </div>
        
        {/* Main section with dock or expanded menu */}
        <div className="flex justify-center items-center flex-grow py-8">
          {isOpen ? (
            // Traditional menu for expanded state
            <div className="space-y-2 w-full">
              {menuItems.map((item) => {
                const isActive = isItemActive(item.href);
                
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
                      isActive ? "border-l-4" : ""
                    }`}
                    style={isActive ? { 
                      borderColor: currentTheme.primary,
                      color: currentTheme.primary
                    } : {
                      color: isDarkMode ? "#f3f4f6" : "#111827"
                    }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="mr-3">{getIcon(item.icon)}</span>
                    <span>{item.name}</span>
                  </motion.a>
                );
              })}
              <div className="pt-4 px-2">
                <motion.button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center p-2 rounded-full transition-colors"
                  style={{
                    color: isDarkMode ? currentTheme.hover : currentTheme.primary,
                  }}
                  aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  whileHover={{ x: 5 }}
                >
                  {isDarkMode ? <HiSun className="w-5 h-5 mr-2" /> : <HiMoon className="w-5 h-5 mr-2" />}
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </motion.button>
                
                <motion.button
                  onClick={() => session ? signOut() : signIn()}
                  className="w-full mt-2 px-4 py-2 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  style={buttonGradientStyle}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {session ? "Logout" : "Login / Signup"}
                </motion.button>
              </div>
            </div>
          ) : (
            // Vertical dock for collapsed state
            <div className="w-full flex items-center justify-center overflow-visible py-4">
              <div className="flex flex-col items-center space-y-6">
                <AnimatePresence>
                  {visibleItems.map((item, index) => (
                    <DockItem
                      key={index}
                      icon={item.icon}
                      label={item.label}
                      isActive={item.isActive}
                      onClick={item.onClick}
                      mouseY={mouseY}
                      index={index}
                      currentTheme={currentTheme}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom section - empty for balance */}
        <div className="h-4"></div>
      </div>
    </motion.nav>
  );
};

export default SideNavbar;