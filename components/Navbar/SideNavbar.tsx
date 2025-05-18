"use client"
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { 
  HiHome, 
  HiUser, 
  HiMail, 
  HiDocumentText, 
  HiSun, 
  HiMoon, 
  HiLogin, 
  HiLogout, 
  HiArchive,
  HiOutlineChip,
  HiChevronRight,
  HiPhotograph,
  HiViewGrid,
  HiPencilAlt,
  HiChartBar,
  HiCog
} from "react-icons/hi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { JSX } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
import { GiNotebook } from "react-icons/gi";
import LogoutButton from "../LogoutButton";
import { GrUserSettings } from "react-icons/gr";
import { ColorOption } from "../../utilities/context/ThemeContext";
import DockItem from "./DockItem";


// Define props interface for side navbar
interface SideNavbarProps {
  currentTheme: ColorOption;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session: any;
  pathname: string | null;
  menuItems: {
    name: string;
    href: string;
    icon: string;
    subItems?: {
      name: string;
      href: string;
      icon: string;
    }[];
  }[];
}



// Pre-calculate icon components
const ICON_MAP = {
  HiHome: (size: number) => <HiHome size={size} />,
  HiUser: (size: number) => <HiUser size={size} />,
  HiMail: (size: number) => <HiMail size={size} />,
  HiDocumentText: (size: number) => <HiDocumentText size={size} />,
  HiArchive: (size: number) => <HiArchive size={size} />,
  HiOutlineChip: (size: number) => <HiOutlineChip size={size} />,
  GiNotebook: (size: number) => <GiNotebook size={size} />,
  GrUserSettings: (size: number) => <GrUserSettings size={size} />,
  HiPhotograph: (size: number) => <HiPhotograph size={size} />,
  HiViewGrid: (size: number) => <HiViewGrid size={size} />,
  HiPencilAlt: (size: number) => <HiPencilAlt size={size} />,
  HiChartBar: (size: number) => <HiChartBar size={size} />,
  HiCog: (size: number) => <HiCog size={size} />
};

// Get the appropriate icon component - memoized
const getIcon = (iconName: string, size = 24) => {
  return ICON_MAP[iconName as keyof typeof ICON_MAP]?.(size) || <HiHome size={size} />;
};









// Create a submenu item component
interface SubMenuItemProps {
  item: {
    name: string;
    href: string;
    icon: string;
  };
  isActive: boolean;
  currentTheme: ColorOption;
  isDarkMode: boolean;
  onClick?: () => void;
}

const SubMenuItem: React.FC<SubMenuItemProps> = ({ item, isActive, currentTheme, isDarkMode, onClick }) => {
  const bgColor = isDarkMode
    ? isActive ? "bg-gray-700" : "hover:bg-gray-700/70"
    : isActive ? "bg-gray-100" : "hover:bg-gray-100/80";

  const textColor = isActive 
    ? currentTheme.primary 
    : isDarkMode ? "text-gray-200" : "text-gray-700";

  return (
    <Link href={item.href} passHref>
      <motion.div
        className={`flex items-center w-full p-2 pl-11 text-base transition-all duration-100 rounded-lg ${bgColor}`}
        style={{ color: isActive ? currentTheme.primary : undefined }}
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        onClick={onClick}
        role="menuitem"
        aria-current={isActive ? "page" : undefined}
      >
        <span className={textColor}>{getIcon(item.icon, 18)}</span>
        <span className={`ml-2 ${textColor}`}>{item.name}</span>
      </motion.div>
    </Link>
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
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const navbarRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<number | null>(null);

  // Set up expanded menus based on active paths on initial render
  useEffect(() => {
    if (pathname) {
      const initialExpandedMenus = {} as { [key: string]: boolean };
      
      menuItems.forEach(item => {
        if (item.subItems?.some(subItem => pathname.startsWith(subItem.href))) {
          initialExpandedMenus[item.name] = true;
        }
      });
      
      setExpandedMenus(initialExpandedMenus);
    }
  }, [pathname, menuItems]);

  // Close drawer on resize to mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Toggle submenu expansion - memoized
  const toggleSubMenu = useCallback((name: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  }, []);

  // Check if menu item is active - improved logic
  const isItemActive = useCallback((href: string) => {
    if (!pathname) return false;
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  }, [pathname]);

  // Navigate without full page refresh
  const navigateTo = useCallback((href: string) => {
    router.push(href);
    // Close drawer on navigation on mobile devices
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  }, [router]);

  // Create dock items from menuItems for collapsed state
  const dockItems = useMemo(() => menuItems.map(item => ({
    icon: getIcon(item.icon),
    label: item.name,
    onClick: () => {
      if (item.subItems?.length) {
        setIsOpen(true);
        setTimeout(() => toggleSubMenu(item.name), 50);
      } else {
        navigateTo(item.href);
      }
    },
    isActive: isItemActive(item.href) || (item.subItems?.some(subItem => isItemActive(subItem.href)) ?? false),
    hasSubItems: !!item.subItems?.length
  })), [menuItems, isItemActive, navigateTo, toggleSubMenu]);

  // Additional special items
  const specialDockItems = useMemo(() => [
    { 
      icon: isDarkMode ? <HiSun size={24} /> : <HiMoon size={24} />, 
      label: isDarkMode ? 'Light Mode' : 'Dark Mode', 
      onClick: toggleDarkMode,
      isActive: false,
      hasSubItems: false
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
      isActive: false,
      hasSubItems: false
    },
  ], [isDarkMode, toggleDarkMode, session]);

  // All dock items combined
  const allDockItems = useMemo(() => [...dockItems, ...specialDockItems], 
    [dockItems, specialDockItems]);

  // Handle mouse over to show all icons
  const handleMouseEnter = useCallback(() => {
    setShowAllIcons(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Handle mouse leave to start hiding inactive icons
  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowAllIcons(false);
    }, 1000); // 1 second delay before hiding
  }, []);

  // Text gradient style for logo text
  const textGradientStyle = useMemo(() => ({
    background: `linear-gradient(120deg, ${currentTheme.primary}, ${currentTheme.hover})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }), [currentTheme]);

  // Button styles with the theme
  const buttonGradientStyle = useMemo(() => ({
    background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.hover})`,
  }), [currentTheme]);

  // Handle clicks outside the drawer to close it
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node) &&
          navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  // Add keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle touch gestures for mobile devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touchX = e.touches[0].clientX;
    const diff = touchStartRef.current - touchX;
    
    // Swipe left (close drawer)
    if (diff > 50 && isOpen) {
      setIsOpen(false);
      touchStartRef.current = null;
    }
    
    // Swipe right (open drawer)
    if (diff < -50 && !isOpen) {
      setIsOpen(true);
      touchStartRef.current = null;
    }
  }, [isOpen]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  // Filter items to show in dock view
  const visibleItems = useMemo(() => showAllIcons 
    ? allDockItems 
    : allDockItems.filter(item => item.isActive),
  [showAllIcons, allDockItems]);

  // Dock background color based on theme
  const dockBgColor = useMemo(() => isDarkMode 
    ? "bg-gray-900/90 backdrop-blur-sm" 
    : "bg-white/90 backdrop-blur-sm",
  [isDarkMode]);

  // Drawer background color based on theme
  const drawerBgColor = useMemo(() => isDarkMode 
    ? "bg-gray-900" 
    : "bg-white",
  [isDarkMode]);

  // Text color based on theme
  const textColor = useMemo(() => isDarkMode 
    ? "text-gray-100" 
    : "text-gray-900",
  [isDarkMode]);

  // Secondary text color based on theme
  const secondaryTextColor = useMemo(() => isDarkMode 
    ? "text-gray-400" 
    : "text-gray-500",
  [isDarkMode]);

  // Pre-compute drawer variants
  const drawerVariants = {
    closed: {
      x: "-100%",
      boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)"
    },
    open: {
      x: 0,
      boxShadow: "5px 0px 15px rgba(0, 0, 0, 0.1)"
    }
  };

  // Framer motion transition with spring physics
  const springTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1
  };

  // Optimized fade transition
  const fadeTransition = { 
    duration: 0.2, 
    ease: "easeInOut" 
  };

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0  bg-opacity-30 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            onClick={() => setIsOpen(false)}
            role="presentation"
          />
        )}
      </AnimatePresence>

      {/* Dock view (always visible) */}
      <motion.div
        ref={navbarRef}
        className={`fixed left-6 top-1/2 -translate-y-1/2 h-auto rounded-2xl z-40 transition-all duration-200 ${dockBgColor} shadow-lg shadow-black/5 w-16 overflow-visible`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={springTransition}
        role="navigation"
        aria-label="Quick navigation"
      >
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          {/* Menu toggle button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-3 rounded-full transition-all ${
              isDarkMode ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-200 text-gray-700"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
            aria-controls="sidebar-drawer"
          >
            <IoMenu className="w-6 h-6" />
          </motion.button>
          
          {/* Dock items */}
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item, index) => (
              <DockItem
                key={`dock-${index}`}
                icon={item.icon}
                label={item.label}
                isActive={item.isActive}
                onClick={item.onClick}
                currentTheme={currentTheme}
                isDarkMode={isDarkMode}
                hasSubItems={item.hasSubItems}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Drawer sidebar */}
      <motion.div
        ref={drawerRef}
        id="sidebar-drawer"
        className={`fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto w-72 ${drawerBgColor} ${textColor}`}
        variants={drawerVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        transition={springTransition}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation sidebar"
      >
        {/* Drawer header */}
        <div className="flex justify-between items-center mb-6">
          <motion.h5 
            className="text-xl font-bold"
            style={textGradientStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Journal App
          </motion.h5>
          <motion.button
            onClick={() => setIsOpen(false)}
            className={`text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg p-1.5`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Close navigation menu"
          >
            <IoClose className="w-6 h-6" />
          </motion.button>
        </div>

        {/* User profile section if logged in */}
        {session && (
          <motion.div 
            className="flex items-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.hover})` }}
            >
              {session.user?.name?.charAt(0) || "U"}
            </div>
            <div className="ml-3">
              <p className="font-medium">{session.user?.name || "User"}</p>
              <p className={`text-sm ${secondaryTextColor}`}>{session.user?.email}</p>
            </div>
          </motion.div>
        )}

        {/* Menu items */}
        <div className="py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium" role="menu">
            {menuItems.map((item, index) => {
              const isActive = isItemActive(item.href) || 
                (item.subItems?.some(subItem => isItemActive(subItem.href)) ?? false);
              const isExpanded = expandedMenus[item.name] || (isActive && item.subItems);
              
              return (
                <motion.li
                  key={`menu-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  role="none"
                >
                  {item.subItems ? (
                    <>
                      <motion.button
                        type="button"
                        className={`flex items-center w-full p-3 text-base transition-all duration-100 rounded-lg ${
                          isDarkMode
                            ? isActive ? "bg-gray-800" : "hover:bg-gray-800"
                            : isActive ? "bg-gray-100" : "hover:bg-gray-100"
                        }`}
                        onClick={() => toggleSubMenu(item.name)}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        style={isActive ? { color: currentTheme.primary } : {}}
                        aria-expanded={!!isExpanded}
                        aria-controls={`submenu-${index}`}
                        role="menuitem"
                      >
                        <span className="mr-3">{getIcon(item.icon)}</span>
                        <span className="flex-1 text-left">{item.name}</span>
                        <motion.span
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <HiChevronRight className="w-5 h-5" />
                        </motion.span>
                      </motion.button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            id={`submenu-${index}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                            role="menu"
                          >
                            <div className="py-2 space-y-1">
                              {item.subItems.map((subItem, subIndex) => (
                                <SubMenuItem
                                  key={`submenu-${index}-${subIndex}`}
                                  item={subItem}
                                  isActive={isItemActive(subItem.href)}
                                  currentTheme={currentTheme}
                                  isDarkMode={isDarkMode}
                                  onClick={() => {
                                    // Close drawer on mobile
                                    if (window.innerWidth < 640) {
                                      setTimeout(() => setIsOpen(false), 150);
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link href={item.href} passHref>
                      <motion.div
                        className={`flex items-center p-3 rounded-lg transition-all duration-100 ${
                          isDarkMode
                            ? isActive ? "bg-gray-800" : "hover:bg-gray-800"
                            : isActive ? "bg-gray-100" : "hover:bg-gray-100"
                        }`}
                        style={isActive ? { color: currentTheme.primary } : {}}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        role="menuitem"
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => {
                          // Close drawer on mobile
                          if (window.innerWidth < 640) {
                            setTimeout(() => setIsOpen(false), 150);
                          }
                        }}
                      >
                        <span className="mr-3">{getIcon(item.icon)}</span>
                        <span>{item.name}</span>
                      </motion.div>
                    </Link>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </div>
        
        {/* Footer actions */}
        <motion.div 
          className="mt-8 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Theme toggle */}
          <motion.button
            onClick={toggleDarkMode}
            className={`w-full flex items-center p-3 rounded-lg ${
              isDarkMode ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-700"
            }`}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            {isDarkMode ? <HiSun className="w-5 h-5 mr-3" /> : <HiMoon className="w-5 h-5 mr-3" />}
            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </motion.button>
          
          {/* Auth button */}
          {session ? (
            <LogoutButton 
              className="w-full mt-2 px-4 py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              style={buttonGradientStyle}
              text="Logout"
              onMouseOver={() => {}}
              onMouseOut={() => {}}
            />
          ) : (
            <motion.button
              onClick={() => signIn()}
              className="w-full mt-2 px-4 py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              style={buttonGradientStyle}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Login / Signup
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default SideNavbar;