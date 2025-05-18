"use client"

import React, { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from "next-auth/react";
import WelcomeBanner from '@/components/WelcomeBanner';
import JournalStats from '@/components/JournalStats';
import RecentEntries from '@/components/RecentEntries';
import MoodTracker from '@/components/MoodTracker';
import FloatingActionButton from '@/components/FloatingActionButton';
import CollapsibleCard from '@/components/CollapsibleCard';
import EntryCategories from '@/components/EntryCategories';
import Toast from '@/components/ui/toast';
import { useTheme } from '@/utilities/context/ThemeContext';
import { Card } from '@/components/ui/quilted-gallery/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/quilted-gallery/ui/tabs';
import { Lightbulb, ArrowRight, CalendarDays, Sparkle, LogOut, Moon, Sun } from "lucide-react";
import { Separator } from '@/components/ui/quilted-gallery/ui/separator';
import { Button } from '@/components/ui/button2';
import { useRouter } from 'next/navigation';
import ThemeSidebar from '@/components/Navbar/ThemeSidebar';

interface JournalStats {
  totalEntries: number;
  streakCount: number;
  lastEntryDate: string | null;
  weeklyEntries: number;
  averageMood: string;
  mostProductiveDay: string;
  topTopics: { name: string; count: number }[];
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { colorOptions, currentTheme, isDarkMode, setCurrentTheme, toggleDarkMode } = useTheme();
  const [successMessage, setSuccessMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState({
    text: "What's something you're looking forward to?",
    explanation: "Taking a moment to anticipate positive events can boost your mood and give you something to look forward to."
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
      // api\fetch-journals\journal-stats
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
      const response = await fetch('/api/prompts/random');
      const data = await response.json();
      setPrompt(data);
    } catch (error) {
      console.error("Failed to fetch prompt:", error);
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

  const userName = session?.user?.name?.split(' ')[0] || 'User';

  const handleNewEntry = () => {
    router.push('/user/journal-entry');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setSuccessMessage("Successfully logged out");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push('/login');
    }, 2000);
  };

  const showAIInsight = () => {
    if (stats?.topTopics) {
      const mainTopic = stats.topTopics[0];
      setSuccessMessage(
        `Your journal entries show a focus on ${mainTopic.name}. ` +
        `You've mentioned it ${mainTopic.count} times this week.`
      );
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
      
      <main className="flex-1 container mx-auto py-6 px-4 sm:px-6 space-y-8">
        <WelcomeBanner 
          userName={userName} 
          onNewEntry={handleNewEntry}
          streakCount={stats?.streakCount || 0}
          lastEntryDate={stats?.lastEntryDate ? new Date(stats.lastEntryDate) : null}
          journalCount={stats?.totalEntries || 0}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <div className="md:col-span-2 space-y-4 lg:space-y-6">
            <CollapsibleCard 
              title="Today's Writing Prompt" 
              icon={<Lightbulb className="h-5 w-5" />}
              defaultOpen={true}
            >
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 sm:p-4 rounded-lg">
                <p className="text-md font-medium">{prompt.text}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {prompt.explanation}
                </p>
                <div className="flex justify-end mt-4">
                  <button 
                    onClick={handleNewEntry}
                    className="text-primary flex items-center text-sm font-medium hover:underline"
                  >
                    Start writing
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            </CollapsibleCard>
            
            <RecentEntries />
          </div>
          
          <div className="md:col-span-1 space-y-4 lg:space-y-6">
            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customize">Customize</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>
              <TabsContent value="insights" className="pt-4">
                <Card className="border p-4 rounded-lg bg-gradient-to-br from-journal-purple/5 to-background">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-journal-purple/20 flex items-center justify-center flex-shrink-0">
                      <Sparkle className="h-4 w-4 text-journal-purple" />
                    </div>
                    <div>
                      <h3 className="font-medium">AI Insights</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {stats?.totalEntries ? (
                          `You've written ${stats.totalEntries} entries total. ` + 
                          (stats.weeklyEntries > 0 ? 
                            `That's ${stats.weeklyEntries} this week!` : 
                            'Start writing to see insights.')
                        ) : 'Start writing to see insights.'}
                      </p>
                      <div className="mt-3 flex items-center">
                        <CalendarDays className="h-4 w-4 text-muted-foreground mr-1.5" />
                        <span className="text-xs text-muted-foreground">
                          {stats?.lastEntryDate ? 
                            `Last entry: ${new Date(stats.lastEntryDate).toLocaleDateString()}` : 
                            'No entries yet'}
                        </span>
                      </div>
                      {stats?.topTopics && stats.topTopics.length > 0 && (
                        <button 
                          className="mt-3 text-xs text-primary flex items-center hover:underline"
                          onClick={showAIInsight}
                        >
                          Get more insights
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  {stats?.topTopics && stats.topTopics.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">Top Mentioned Topics</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {stats.topTopics.slice(0, 4).map((topic, index) => (
                            <div 
                              key={index}
                              className="text-xs bg-journal-blue/10 text-journal-blue px-2 py-1 rounded-full"
                            >
                              {topic.name} ({topic.count})
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
            
            <CollapsibleCard title="Weekly Summary">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">
                    Total Entries: {stats?.weeklyEntries || 0}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {stats?.weeklyEntries ? 
                      'Keep up the good work!' : 
                      'Write your first entry this week!'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">
                    Average Mood: {stats?.averageMood || 'N/A'}
                  </h3>
                  <div className="w-full bg-muted h-2 rounded-full mt-1.5">
                    <div 
                      className={`h-2 rounded-full relative ${
                        !stats?.averageMood ? 'bg-gray-300' : 
                        stats.averageMood.toLowerCase().includes('positive') ? 'bg-journal-green' :
                        stats.averageMood.toLowerCase().includes('negative') ? 'bg-journal-red' :
                        'bg-journal-yellow'
                      }`} 
                      style={{ width: stats?.averageMood ? '75%' : '0%' }}
                    >
                      {stats?.averageMood && (
                        <div className="absolute -right-1 -top-2 h-6 w-1 rounded-full" style={{
                          backgroundColor: 
                            stats.averageMood.toLowerCase().includes('positive') ? '#10B981' :
                            stats.averageMood.toLowerCase().includes('negative') ? '#EF4444' :
                            '#F59E0B'
                        }} />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Negative</span>
                    <span>Positive</span>
                  </div>
                </div>
                <Separator className="my-2" />
                <div>
                  <h3 className="text-sm font-medium">Most Productive Day</h3>
                  <div className="grid grid-cols-7 gap-1 mt-2">
                    {['M','T','W','T','F','S','S'].map((day, i) => (
                      <div 
                        key={day + i} 
                        className={`h-8 rounded flex items-center justify-center text-xs
                          ${
                            stats?.mostProductiveDay && 
                            day === stats.mostProductiveDay.substring(0, 1) ? 
                            'bg-primary/20 text-primary font-medium' : 
                            'bg-muted/50 text-muted-foreground'
                          }
                        `}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats?.mostProductiveDay ? 
                      `${stats.mostProductiveDay} was most productive` : 
                      'No entries this week'}
                  </p>
                </div>
              </div>
            </CollapsibleCard>
            
            {stats?.streakCount !== undefined && stats.streakCount > 0 && (
              <div className="bg-gradient-to-br from-journal-yellow/10 to-journal-orange/5 p-4 rounded-lg border border-journal-yellow/20" style={{animation: "pulse 10s infinite ease-in-out"}}>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-journal-yellow/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-4 w-4 text-journal-yellow" />
                  </div>
                  <h3 className="font-medium">Journal streak challenge</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.streakCount >= 7 ? 
                    `Amazing! You've maintained a ${stats.streakCount}-day streak!` :
                    `Write an entry for 7 consecutive days to earn your first streak badge!`
                  }
                </p>
                <div className="flex justify-between mt-3 items-center">
                  <div className="text-xs">
                    {stats.streakCount >= 7 ? 
                      `${stats.streakCount} days` : 
                      `${stats.streakCount}/7 days`
                    }
                  </div>
                  <button 
                    onClick={handleNewEntry}
                    className="text-xs bg-journal-yellow/20 hover:bg-journal-yellow/30 text-journal-yellow px-3 py-1 rounded-full transition-colors"
                  >
                    {stats.lastEntryDate && new Date(stats.lastEntryDate).toDateString() === new Date().toDateString() ?
                      'Add another' : 'Write today'
                    }
                  </button>
                </div>
                <div className="w-full bg-white/30 h-2 rounded-full mt-2">
                  <div 
                    className="bg-journal-yellow h-2 rounded-full" 
                    style={{ 
                      width: stats.streakCount >= 7 ? '100%' : `${(stats.streakCount / 7) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <FloatingActionButton  />
      
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
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
      `}</style>
    </div>
  );
}