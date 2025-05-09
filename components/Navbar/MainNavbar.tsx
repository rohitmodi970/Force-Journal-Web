"use client"
import React, { useState, useEffect } from "react";
import { useTheme } from "@/utilities/context/ThemeContext";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import SideNavbar from "./SideNavbar";
import RegularNavbar from "./RegularNavbar";

const MainNavbar: React.FC = () => {
  const { colorOptions, currentTheme, isDarkMode, toggleDarkMode, setCurrentTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Check if current page is a journal page
  const isJournalPage = pathname?.includes('/journal');
  const isJournalEntry = pathname?.includes('/journal-entry');
  
  // Check if current page is homepage
  const isHomePage = pathname === '/';
  const isLoginPage = pathname === '/auth/login';
  const isRegisterPage = pathname === '/auth/register';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Common menu items for all users (logged in or not)
  const publicMenuItems = [
    { name: "Home", href: "/", icon: "HiHome" },
    { name: "About", href: "/about", icon: "HiUser" },
    { name: "Contact", href: "/contact", icon: "HiMail" },
  ]; 

  // Additional menu items only for logged-in users
  const privateMenuItems = [
    { name: "Home", href: "/user/dashboard", icon: "HiHome" },
    {name:"New Entry",href: "/user/journal-entry", icon: "GiNotebook"},
    { name: "Journal", href: "/user/journal", icon: "HiDocumentText" },
    { name: "Analysis", href: "/user/analysis", icon: "HiOutlineChip" },
    { name: "Settings", href: "/user/settings", icon: "GrUserSettings" },
  ];

  // Determine which menu items to show based on session status
  const menuItems = session ? [...privateMenuItems] : [...publicMenuItems];

  // Don't render navbar on homepage
  // Don't render navbar on homepage, login, or register pages when not logged in
  // Don't render navbar on public pages when not logged in
  if ((isHomePage || isLoginPage || isRegisterPage) && !session) {
    return null;
  }
  
  // For logged-in users, only render navbar on pages that match privateMenuItems paths
  // For non-logged-in users, only render navbar on pages that match publicMenuItems paths
  const validPaths = session 
    ? privateMenuItems.map(item => item.href)
    : publicMenuItems.map(item => item.href);
  
  // Always show navbar on homepage for logged-in users
  if (session && pathname === '/') {
    // Continue to render the navbar
  }
  // For other paths, check if they're valid
  else if (!validPaths.some(path => pathname?.startsWith(path))) {
    return null;
  }
  

  return (isJournalPage || isJournalEntry) ? (
    <SideNavbar
      currentTheme={currentTheme}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      session={session}
      pathname={pathname}
      menuItems={menuItems}
    />
  ) : (
    <RegularNavbar
      currentTheme={currentTheme}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      pathname={pathname}
      menuItems={menuItems}
      isScrolled={isScrolled}
      colorOptions={colorOptions}
      setCurrentTheme={setCurrentTheme}
    />
  );
};

export default MainNavbar;