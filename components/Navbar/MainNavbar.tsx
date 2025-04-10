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
  const isJournalPage = pathname?.includes('/journal-entry');
  
  // Check if current page is homepage
  const isHomePage = pathname === '/';

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
    { name: "Journal", href: "/journal-entry", icon: "HiDocumentText" },
    { name: "Analysis", href: "/analysis", icon: "HiOutlineChip" },
  ];

  // Determine which menu items to show based on session status
  const menuItems = session ? [...publicMenuItems, ...privateMenuItems] : publicMenuItems;

  // Don't render navbar on homepage
  if (isHomePage) {
    return null;
  }

  return isJournalPage ? (
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
      session={session}
      pathname={pathname}
      menuItems={menuItems}
      isScrolled={isScrolled}
      colorOptions={colorOptions}
      setCurrentTheme={setCurrentTheme}
    />
  );
};

export default MainNavbar;