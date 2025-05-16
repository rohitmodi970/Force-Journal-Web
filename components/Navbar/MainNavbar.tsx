"use client"
import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "@/utilities/context/ThemeContext";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import SideNavbar from "./SideNavbar";
import RegularNavbar from "./RegularNavbar";

const MainNavbar = () => {
  const { colorOptions, currentTheme, isDarkMode, toggleDarkMode, setCurrentTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Memoize whether current page is a specific type to avoid recalculation on re-renders
  const pageTypes = useMemo(() => ({
    isJournalPage: pathname?.includes('/journal'),
    isJournalEntry: pathname?.includes('/journal-entry'),
    isHomePage: pathname === '/',
    isLoginPage: pathname === '/auth/login',
    isRegisterPage: pathname === '/auth/register',
    isUserPath: pathname?.startsWith('/user')
  }), [pathname]);

  // Setup scroll listener only when needed
  useEffect(() => {
    // Only add scroll listener if we're not using the side navbar
    if (!shouldUseSideNav()) {
      const handleScroll = () => setIsScrolled(window.scrollY > 50);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [pathname]);

  // Memoize menu items to prevent unnecessary re-renders
  const sideNavMenuItems = useMemo(() => [
    {
      name: 'Home',
      href: session ? '/user/dashboard' : '/',
      icon: 'HiHome',
    },
    {
      name: 'Journals',
      href: '/user/journal',
      icon: 'GiNotebook',
      subItems: [
        {
          name: 'New Entry',
          href: '/user/journal-entry/',
          icon: 'HiPencilAlt',
        },
        {
          name: 'Analysis',
          href: '/user/journal/analysis',
          icon: 'HiChartBar',
        },
        {
          name: 'Advanced Analysis',
          href: '/user/journal/analysis/advanced',
          icon: 'HiOutlineChip',
        },
        {
          name: 'Journal Gallery',
          href: '/user/journal/journal-gallery',
          icon: 'HiPhotograph',
        },
        {
          name: 'Quilted Gallery',
          href: '/user/journal/quilted-gallery',
          icon: 'HiViewGrid',
        },
      ],
    },
    {
      name: 'Profile',
      href: '/user/profile',
      icon: 'HiUser',
      subItems: [
        {
          name: 'Profile Settings',
          href: '/user/profile',
          icon: 'HiUser',
        },
        {
          name: 'Preferences',
          href: '/user/settings',
          icon: 'HiCog',
        },
      ],
    },
    {
      name: 'AI Tools',
      href: '/user/ai-tools',
      icon: 'HiOutlineChip',
    },
  ], [session]);

  // Memoize public and private menu items
  const publicMenuItems = useMemo(() => [
    { name: "Home", href: "/", icon: "HiHome" },
    { name: "About", href: "/about", icon: "HiUser" },
    { name: "Contact", href: "/contact", icon: "HiMail" },
  ], []);

  const privateMenuItems = useMemo(() => [
    { name: "Dashboard", href: "/user/dashboard", icon: "HiHome" },
    { name: "New Entry", href: "/user/journal-entry", icon: "GiNotebook" },
    { name: "Journal", href: "/user/journal", icon: "HiDocumentText" },
    { name: "Analysis", href: "/user/analysis", icon: "HiOutlineChip" },
    { name: "Advanced Analysis", href: "/user/journal/analysis/advanced", icon: "HiOutlineChip" },
    { name: "Profile", href: "/user/profile", icon: "HiOutlineChip" },
  ], []);

  // Function to determine if we should show the navbar at all
  const shouldShowNavbar = () => {
    const { isHomePage, isLoginPage, isRegisterPage, isJournalPage, isJournalEntry, isUserPath } = pageTypes;
    
    // Don't show navbar on public pages when not logged in
    if ((isHomePage || isLoginPage || isRegisterPage) && !session) {
      return false;
    }
    
    // Always show navbar for logged-in users on user paths or journal pages
    if (session && (isUserPath || isJournalPage || isJournalEntry || isHomePage)) {
      return true;
    }
    
    // For other paths, check if they're valid
    const validPaths = session ? privateMenuItems.map(item => item.href) : publicMenuItems.map(item => item.href);
    return validPaths.some(path => pathname?.startsWith(path));
  };
  
  // Function to determine which navbar type to use
  const shouldUseSideNav = () => {
    const { isJournalPage, isJournalEntry, isUserPath } = pageTypes;
    return isJournalPage || isJournalEntry || isUserPath;
  };

  // Don't render anything if we shouldn't show the navbar
  if (!shouldShowNavbar()) {
    return null;
  }

  // Determine which navbar to show
  return shouldUseSideNav() ? (
    <SideNavbar
      currentTheme={currentTheme}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode} 
      session={session}
      pathname={pathname}
      menuItems={sideNavMenuItems}
    />
  ) : (
    <RegularNavbar
      currentTheme={currentTheme}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      pathname={pathname}
      menuItems={session ? privateMenuItems : publicMenuItems}
      isScrolled={isScrolled}
      colorOptions={colorOptions}
      setCurrentTheme={setCurrentTheme}
    />
  );
};

export default MainNavbar;