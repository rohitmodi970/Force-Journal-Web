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
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { GiNotebook } from "react-icons/gi";
import LogoutButton from "../LogoutButton";
import { GrUserSettings } from "react-icons/gr";
import { ColorOption } from "../../utilities/context/ThemeContext";

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

// Create a separate component for dock items to avoid hook violations
interface DockItemProps {
  icon: JSX.Element;
  label: string;
  isActive: boolean;
  onClick: () => void;
  currentTheme: ColorOption;
  isDarkMode: boolean;
  hasSubItems?: boolean;
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

const DockItem: React.FC<DockItemProps> = ({ 
  icon, 
  label, 
  isActive, 
  onClick, 
  currentTheme, 
  isDarkMode,
  hasSubItems 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Dynamic background for active items
  const bgColor = isDarkMode 
    ? isActive ? "rgba(255, 255, 255, 0.1)" : "transparent"
    : isActive ? "rgba(0, 0, 0, 0.06)" : "transparent";
  
  // Dynamic text color
  const textColor = isActive 
    ? currentTheme.primary 
    : (isDarkMode ? "#f3f4f6" : "#111827");
  
  return (
    <motion.div
      onClick={onClick}
      className="flex items-center justify-center rounded-full transition-all w-12 h-12"
      style={{
        color: textColor,
        backgroundColor: bgColor
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {icon}
      
      {/* Tooltip label */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={`absolute left-full ml-3 px-2 py-1 text-xs rounded-md whitespace-nowrap z-50 shadow-lg ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-800 text-white"
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.1 }}
          >
            {label}
            {hasSubItems && (
              <span className="ml-1 text-xs">▶</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          className="absolute right-0 mr-[-4px] w-2 h-2 rounded-full"
          style={{ backgroundColor: currentTheme.primary }}
          layoutId="activeIndicator"
        />
      )}
    </motion.div>
  );
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
}

const SubMenuItem: React.FC<SubMenuItemProps> = ({ item, isActive, currentTheme, isDarkMode }) => {
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
        transition={{ duration: 0.1 }}
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
  const mouseY = useMotionValue(Infinity);
  const navbarRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle submenu expansion - memoized
  const toggleSubMenu = useCallback((name: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  }, []);

  // Check if menu item is active
  const isItemActive = useCallback((href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (pathname?.startsWith(href) && href !== "/") return true;
    return pathname === href;
  }, [pathname]);

  // Navigate without full page refresh
  const navigateTo = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  // Create dock items from menuItems for collapsed state
  const dockItems = useMemo(() => menuItems.map(item => ({
    icon: getIcon(item.icon),
    label: item.name,
    onClick: () => {
      if (item.subItems) {
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
    }, 1000);
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
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
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

  // Pre-compute drawer and backdrop variants
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

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0  bg-opacity-30 z-30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Dock view (always visible) */}
      <motion.div
        ref={navbarRef}
        className={`fixed left-6 top-1/2 -translate-y-1/2 h-auto rounded-2xl z-40 transition-all duration-200 ${dockBgColor} shadow-lg shadow-black/5 w-16 overflow-visible`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          {/* Menu toggle button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-3 rounded-full ${
              isDarkMode ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-200 text-gray-700"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IoMenu className="w-6 h-6" />
          </motion.button>
          
          {/* Dock items */}
          <AnimatePresence>
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
        className={`fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto w-72 ${drawerBgColor} ${textColor}`}
        variants={drawerVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
          >
            <IoClose className="w-6 h-6" />
          </motion.button>
        </div>

        {/* User profile section if logged in */}
        {session && (
          <div className="flex items-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
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
          </div>
        )}

        {/* Menu items */}
        <div className="py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
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
                      >
                        <span className="mr-3">{getIcon(item.icon)}</span>
                        <span className="flex-1 text-left">{item.name}</span>
                        <motion.span
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.1 }}
                        >
                          <HiChevronRight className="w-5 h-5" />
                        </motion.span>
                      </motion.button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="py-2 space-y-1">
                              {item.subItems.map((subItem, subIndex) => (
                                <SubMenuItem
                                  key={`submenu-${index}-${subIndex}`}
                                  item={subItem}
                                  isActive={isItemActive(subItem.href)}
                                  currentTheme={currentTheme}
                                  isDarkMode={isDarkMode}
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
        <div className="mt-8 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Theme toggle */}
          <motion.button
            onClick={toggleDarkMode}
            className={`w-full flex items-center p-3 rounded-lg ${
              isDarkMode ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-700"
            }`}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
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
        </div>
      </motion.div>
    </>
  );
};

export default SideNavbar;