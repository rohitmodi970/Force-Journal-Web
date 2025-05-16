"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Layout from "@/components/layout/Layout";
import { getAllJournalEntries } from "@/utilities/journal-data";
import { JournalEntry } from "@/components/Journal/types";
import SideNavbar from "@/components/Navbar/SideNavbar";
import { useTheme } from "@/utilities/context/ThemeContext";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import AdvancedAnalysisDashboard from "@/components/Journal/Advanced/AdvancedAnalysisDashboard";

const AdvancedAnalysisPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SideNavbar context
  const { currentTheme, isDarkMode, toggleDarkMode } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();

  // SideNavbar menu items (reuse from analysis page)
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
      name: 'Advanced Analysis',
      href: '/user/journal/analysis/advanced',
      icon: 'HiOutlineChip',
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

  useEffect(() => {
    async function loadJournalEntries() {
      try {
        setIsLoading(true);
        const fetchedEntries = await getAllJournalEntries();
        setEntries(fetchedEntries);
      } catch (err) {
        console.error('Failed to load journal entries:', err);
        setError('Failed to load journal entries. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    loadJournalEntries();
  }, []);

  return (
    <div className="flex">
      <SideNavbar
        currentTheme={currentTheme}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
        pathname={pathname}
        menuItems={sideNavMenuItems}
      />
      <div className="flex-1">
        <Layout>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold font-journal mb-2">Advanced Journal Analysis</h1>
              <p className="text-muted-foreground font-handwriting text-xl">
                Deep insights and advanced analytics of your journal entries
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
            ) : (
              <AdvancedAnalysisDashboard entries={entries} />
            )}
          </div>
        </Layout>
      </div>
    </div>
  );
};

export default AdvancedAnalysisPage; 