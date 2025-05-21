"use client"

import React, { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useTheme } from '@/utilities/context/ThemeContext';
import { Card } from '@/components/ui/quilted-gallery/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/quilted-gallery/ui/tabs';
import { Button } from '@/components/ui/button2';
import { AlertCircle, Check, Info, ArrowRight } from 'lucide-react';

// Custom components
import QuickLinks from '@/components/QuickLinks.';
import RecentEntries from '@/components/RecentEntries';
import FloatingActionButton from '@/components/FloatingActionButton';
import ThemeSidebar from '@/components/Navbar/ThemeSidebar';
import Toast from '@/components/ui/toast';
import WelcomeBanner from '@/components/WelcomeBanner';
import DailyPrompt from '@/components/DailyPrompt';
import AIInsightsCard from '@/components/AIInsightsCard';
import WeeklySummary from '@/components/WeeklySummary';
import StreakChallengeCard from '@/components/StreakChallengeCard';
import AISuggestions from '@/components/AISuggestions';
import { NewUserGuidance,FirstEntryPrompt } from '@/components/DashBoardomponents';






interface JournalStats {
  totalEntries: number;
  streakCount: number;
  lastEntryDate: string | null;
  weeklyEntries: number;
  averageMood: string;
  mostProductiveDay: string;
  topTopics: { name: string; count: number }[];
}

interface PromptData {
  prompt: {
    text: string;
    explanation: string;
  };
  suggestions: {
    moodTrends: {
      primaryMood: string;
      trend: string;
      intensity: number;
    };
    aiNudge: {
      theme: string;
      suggestion: string;
      action: string;
    };
    patternInsight: {
      pattern: string;
      exploration: string;
    };
  };
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  console.log("Session data:", session);
  const { 
    currentTheme, 
    isDarkMode, 
    elementColors
  } = useTheme();
  
  const [successMessage, setSuccessMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState(false);
  const [showNewUserGuidance, setShowNewUserGuidance] = useState(false);
  const [completedFirstStep, setCompletedFirstStep] = useState(false);
  const [promptData, setPromptData] = useState<PromptData>({
    prompt: {
      text: "What's on your mind today?",
      explanation: "Start your journaling journey by sharing your thoughts and feelings."
    },
    suggestions: {
      moodTrends: {
        primaryMood: "neutral",
        trend: "starting",
        intensity: 0.5
      },
      aiNudge: {
        theme: "Getting Started",
        suggestion: "Begin your journaling journey by writing about your day",
        action: "Try writing for 5 minutes about what made you smile today"
      },
      patternInsight: {
        pattern: "New to journaling",
        exploration: "Explore different writing styles and find what works best for you"
      }
    }
  });

  // Fetch journal stats on component mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchJournalStats();
      fetchRandomPrompt();
    }
  }, [status]);

  const fetchJournalStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fetch-journals/journal-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch journal stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomPrompt = async () => {
    try {
      console.log('Fetching personalized prompt and suggestions...');
      const response = await fetch('/api/prompts/personalized');
      if (!response.ok) {
        throw new Error('Failed to fetch prompt');
      }
      const data: PromptData = await response.json();
      console.log('Received prompt data:', data);
      setPromptData(data);
    } catch (error) {
      console.error('Error fetching prompt:', error);
      // Keep the default prompt data if fetch fails
    }
  };

  // Effect to apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Check if user is new and show guidance
  useEffect(() => { 
    if (session?.user?.new_user) {
      setNewUser(true);
      setShowNewUserGuidance(true);
      
      // Show welcome toast for new users
      setSuccessMessage("Welcome to your journal! Follow the guide to get started.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  }, [session]);

  const userName = session?.user?.name?.split(' ')[0] || 'User';

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setSuccessMessage("Successfully logged out");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push('/login');
    }, 2000);
  };

  const handleDismissGuidance = () => {
    setShowNewUserGuidance(false);
    setCompletedFirstStep(true);
    
    // Show encouraging toast when guidance is dismissed
    setSuccessMessage("Great! You're ready to start your journaling journey.");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };
  
  const handleCreateFirstEntry = () => {
    router.push('/user/journal-entry');
  };

  const showAIInsight = () => {
    if (stats?.topTopics && stats.topTopics.length > 0) {
      const mainTopic = stats.topTopics[0];
      setSuccessMessage(
        `Your journal entries show a focus on ${mainTopic.name}. ` +
        `You've mentioned it ${mainTopic.count} times this week.`
      );
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } else {
      setSuccessMessage("Start writing entries to get personalized insights!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-6">Welcome to Your Journal</h1>
          <p className="mb-8 text-muted-foreground">Please sign in to access your dashboard</p>
          <Button onClick={() => signIn('google')} className="w-full">
            Sign in with Google
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-background ${isDarkMode ? 'dark' : ''}`}>
      <ThemeSidebar />  
      {showToast && (
        <Toast 
          message={successMessage} 
          type="success" 
          visible={showToast} 
          duration={3000} 
        />
      )}
      
      <main className="flex-1 container mx-auto py-6 px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* Welcome Banner Component */}
        <WelcomeBanner 
          userName={userName}
          stats={stats ? {
            ...stats,
            lastEntryDate: stats.lastEntryDate || undefined
          } : undefined}
          currentTheme={currentTheme}
          isDarkMode={isDarkMode}
          elementColors={elementColors}
          handleLogout={handleLogout}
          isNewUser={newUser}
        />
        
        {/* New User Guidance */}
        {showNewUserGuidance && (
          <NewUserGuidance onDismissAll={handleDismissGuidance} />
        )}
        
        {/* QuickLinks component */}
        <QuickLinks />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <div className="md:col-span-2 space-y-4 lg:space-y-6  ">
            {/* Daily Prompt and AI Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto">
              <AISuggestions suggestions={promptData.suggestions} />
              <DailyPrompt prompt={promptData.prompt} />
            </div>
            
            
          </div>
          
          <div className="md:col-span-1 space-y-4 lg:space-y-6">
            {/* Feature Highlight for New Users */}
            {newUser && (
              <Card className="p-4 border border-dashed border-primary/30 bg-muted/10">
                <h3 className="text-lg font-medium flex items-center">
                  <AlertCircle size={18} className="mr-2 text-primary" />
                  Features to Explore
                </h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start">
                    <Check size={16} className="mr-2 mt-1 text-primary" />
                    <span className="text-sm">Daily prompts to inspire your writing</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={16} className="mr-2 mt-1 text-primary" />
                    <span className="text-sm">AI-powered insights based on your entries</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={16} className="mr-2 mt-1 text-primary" />
                    <span className="text-sm">Streak challenges to build consistency</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={16} className="mr-2 mt-1 text-primary" />
                    <span className="text-sm">Customizable themes to match your mood</span>
                  </li>
                </ul>
              </Card>
            )}
            
            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customize">Customize</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>
              
              {/* Customize Tab Content */}
              <TabsContent value="customize" className="pt-4 space-y-4">
                {/* This tab is empty in original code */}
                {newUser && (
                  <div className="p-3 text-sm bg-muted/50 rounded-md">
                    <p>Personalize your journal experience by selecting themes and notification preferences.</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Insights Tab Content */}
              <TabsContent value="insights" className="pt-4">
                <AIInsightsCard 
                  stats={stats ? {
                    totalEntries: stats.totalEntries,
                    weeklyEntries: stats.weeklyEntries,
                    lastEntryDate: stats.lastEntryDate || undefined,
                    topTopics: stats.topTopics
                  } : undefined} 
                  showAIInsight={showAIInsight} 
                />
                
                {newUser && stats?.totalEntries === 0 && (
                  <div className="mt-4 p-3 text-sm bg-muted/50 border border-muted rounded-md">
                    <p className="text-center">Write your first entry to unlock personalized insights!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Weekly Summary Component */}
            <WeeklySummary stats={stats || undefined} />
            
            {/* Streak Challenge Component */}
            <StreakChallengeCard stats={stats ? {
              ...stats,
              lastEntryDate: stats.lastEntryDate || undefined
            } : undefined} />
          </div>
        </div>
        {/* First Entry Prompt for New Users OR Recent Entries for returning users */}
            {newUser && stats?.totalEntries === 0 ? (
              <FirstEntryPrompt onClick={handleCreateFirstEntry} />
            ) : (
              <RecentEntries />
            )}
      </main>
      
      <FloatingActionButton />
      
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        /* Dark mode styles */
        .dark {
          --bg-background: #121212;
          --text-primary: #ffffff;
          --text-muted: #a0a0a0;
          color-scheme: dark;
        }
        
        .dark body,
        .dark .bg-background {
          background-color: var(--bg-background);
          color: var(--text-primary);
        }
        
        .dark .text-muted-foreground {
          color: var(--text-muted);
        }
        
        .dark .bg-muted {
          background-color: #2a2a2a;
        }
        
        .dark .bg-muted\/50 {
          background-color: rgba(42, 42, 42, 0.5);
        }
        
        .dark .border {
          border-color: #333333;
        }
        
        /* Enhance mobile responsiveness */
        @media (max-width: 640px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
        
        /* Animation for welcome banner */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}