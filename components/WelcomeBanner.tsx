"use client"

import React, { useState, useEffect } from 'react';
import { LogOut, CalendarDays, Lightbulb, ArrowRight, TrendingUp, BookOpen, MessageSquare, Award, ChevronRight, Flame, BookMarked, HelpCircle, Info } from "lucide-react";
import { Button } from '@/components/ui/button2';
import { useRouter } from 'next/navigation';

interface Stats {
  streakCount?: number;
  totalEntries?: number;
  lastEntryDate?: string;
  weeklyEntries?: number;
  averageMood?: string;
  mostProductiveDay?: string;
  topTopics?: Array<{name: string, count: number}>;
  moodDistribution?: {
    [key: string]: number;
  };
}

interface Theme {
  primary: string;
  light: string;
}

interface ElementColors {
  button: string;
}

interface WelcomeBannerProps {
  userName: string;
  stats?: Stats;
  currentTheme: Theme;
  isDarkMode: boolean;
  elementColors: ElementColors;
  handleLogout: () => void;
  isNewUser?: boolean;
}

const WelcomeBanner = ({ 
  userName, 
  stats, 
  currentTheme, 
  isDarkMode, 
  elementColors,
  handleLogout,
  isNewUser = false
}: WelcomeBannerProps) => {
  const router = useRouter();
  const [timeGreeting, setTimeGreeting] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [showOnboardingTips, setShowOnboardingTips] = useState(isNewUser);
  const [currentTip, setCurrentTip] = useState(0);
  
  // Onboarding tips for new users
  const onboardingTips = [
    {
      title: "Welcome to Your Journal",
      icon: <BookMarked className="h-5 w-5" style={{ color: currentTheme.primary }} />,
      content: "This is your personal journaling space. Start by writing your first entry to begin your reflection journey.",
      action: "Write your first entry"
    },
    {
      title: "Track Your Mood",
      icon: <TrendingUp className="h-5 w-5" style={{ color: currentTheme.primary }} />,
      content: "Record how you feel in each entry. Over time, you'll see patterns in your emotional wellbeing.",
      action: "Try it now"
    },
    {
      title: "Set Your Goals",
      icon: <Award className="h-5 w-5" style={{ color: currentTheme.primary }} />,
      content: "We recommend writing 3-5 entries per week. Regular journaling brings the most benefits.",
      action: "Set reminder"
    }
  ];

  // Generate mood emoji based on mood name
  const getMoodEmoji = (mood: string) => {
    const moodMap: {[key: string]: string} = {
      "Happy": "😊",
      "Neutral": "😐",
      "Calm": "🙂",
      "Sad": "😔",
      "Excited": "😃",
      "Anxious": "😰",
      "Angry": "😠",
      "Tired": "😴",
      "Grateful": "🙏",
      "Motivated": "💪"
    };
    
    return moodMap[mood] || "🙂";
  };

  // Time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeGreeting("Good morning");
    } else if (hour >= 12 && hour < 18) {
      setTimeGreeting("Good afternoon");
    } else {
      setTimeGreeting("Good evening");
    }
  }, []);

  // Generate motivational messages based on user's journaling status
  useEffect(() => {
    if (isNewUser) {
      const newUserMessages = [
        "Your journaling journey begins today. Let's capture your thoughts together!",
        "Welcome to your personal reflection space. Ready to write your story?",
        "Every great journey begins with a single step. Let's write your first entry today!",
        "This is the beginning of your self-discovery journey through journaling."
      ];
      setMotivationalMessage(newUserMessages[Math.floor(Math.random() * newUserMessages.length)]);
    } else if (!stats?.totalEntries || stats.totalEntries === 0) {
      const firstTimeMessages = [
        "Today is a perfect day to start your journaling journey!",
        "Begin your reflection journey today with your first entry.",
        "Your journaling adventure awaits - start today!",
        "Turn your thoughts into insights with your first journal entry."
      ];
      setMotivationalMessage(firstTimeMessages[Math.floor(Math.random() * firstTimeMessages.length)]);
    } else if (stats.streakCount && stats.streakCount > 3) {
      setMotivationalMessage(`Amazing ${stats.streakCount}-day streak! Your consistency is inspiring.`);
    } else if (writingStatus.status === "gap" && (writingStatus as any).days > 2) {
      setMotivationalMessage("Getting back into journaling can reveal new insights. Welcome back!");
    } else if (stats.weeklyEntries && stats.weeklyEntries >= 5) {
      setMotivationalMessage("You're having a fantastic week of journaling. Keep it up!");
    } else if (stats.weeklyEntries === 1) {
      setMotivationalMessage("Great start to your week! Regular entries can boost your well-being.");
    } else {
      const generalMessages = [
        "Consistent journaling can lead to greater self-awareness.",
        "Every journal entry is a step toward better understanding yourself.",
        "Your journal is growing with each entry - well done!",
        "Journaling is a journey, not a destination."
      ];
      setMotivationalMessage(generalMessages[Math.floor(Math.random() * generalMessages.length)]);
    }
  }, [stats, isNewUser]);

  const handleNewEntry = () => {
    setIsLoading(true);
    router.push('/user/journal-entry');
  };

  const handleTipAction = (index: number) => {
    if (index === 0) {
      // First tip action - write first entry
      handleNewEntry();
    } else if (index === 1) {
      // Second tip action - try mood tracking
      router.push('/user/journal-entry?showMoodSelector=true');
    } else if (index === 2) {
      // Third tip action - set reminders
      router.push('/user/settings?tab=reminders');
    }
  };

  const nextTip = () => {
    if (currentTip < onboardingTips.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      setShowOnboardingTips(false);
    }
  };

  // Check if user last wrote today
  const getWritingStatus = () => {
    if (!stats?.lastEntryDate) {
      return {
        status: "never",
        message: "Start your journal journey today!"
      };
    }
    
    const now = new Date();
    const lastEntry = new Date(stats.lastEntryDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastEntryDate = new Date(lastEntry.getFullYear(), lastEntry.getMonth(), lastEntry.getDate());
    
    // Check if last entry was today
    if (lastEntryDate.getTime() === today.getTime()) {
      return {
        status: "today",
        message: `You've written today! ${stats.weeklyEntries} ${stats.weeklyEntries === 1 ? 'entry' : 'entries'} this week.`
      };
    }
    
    // Check if last entry was yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastEntryDate.getTime() === yesterday.getTime()) {
      return {
        status: "yesterday",
        message: "You wrote yesterday! Don't break your momentum."
      };
    }
    
    // Calculate days since last entry
    const diffTime = Math.abs(today.getTime() - lastEntryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      status: "gap",
      message: `It's been ${diffDays} days since your last entry. Let's get back to writing!`,
      days: diffDays
    };
  };

  const writingStatus = getWritingStatus();

  // Get month name for monthly progress
  const getCurrentMonthName = () => {
    return new Date().toLocaleString('default', { month: 'long' });
  };

  // Calculate recommended goal based on user pattern
  const getRecommendedGoal = () => {
    if (!stats?.weeklyEntries) return 3;
    if (stats.weeklyEntries >= 7) return 7;
    if (stats.weeklyEntries >= 5) return 7;
    if (stats.weeklyEntries >= 3) return 5;
    return 3;
  };

  const recommendedGoal = getRecommendedGoal();

  // Calculate monthly goal progress
  const getMonthlyProgress = () => {
    if (!stats?.totalEntries) return { current: 0, target: 15 };
    
    // A simple estimation - in a real app this would be actual monthly data
    const currentMonth = new Date().getMonth();
    const entriesThisMonth = stats.weeklyEntries ? stats.weeklyEntries * 4 / 7 : 0;
    
    return {
      current: Math.min(Math.round(entriesThisMonth), 30),
      target: recommendedGoal * 4
    };
  };

  const monthlyProgress = getMonthlyProgress();

  return (
    <div 
      className="relative overflow-hidden rounded-2xl shadow-lg border"
      style={{
        background: isDarkMode 
          ? `linear-gradient(145deg, ${currentTheme.primary}15 0%, rgba(0,0,0,0.2) 100%)`
          : `linear-gradient(145deg, ${currentTheme.light} 0%, rgba(255,255,255,0.7) 100%)`,
        borderColor: `${currentTheme.primary}30`
      }}
    >
      {/* Abstract shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 -mt-24 -mr-24 opacity-5">
        <div className="w-full h-full rounded-full" style={{ backgroundColor: currentTheme.primary }}></div>
      </div>
      <div className="absolute bottom-0 left-0 w-64 h-64 -mb-32 -ml-32 opacity-5">
        <div className="w-full h-full rounded-full" style={{ backgroundColor: currentTheme.primary }}></div>
      </div>
      
      <div className="relative px-6 py-8 sm:px-8 z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="max-w-[40vw]">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center ">
              {timeGreeting}, <span className="ml-2 tracking-tight" style={{ color: currentTheme.primary }}>{userName} </span>
              
              {isNewUser && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10" style={{ color: currentTheme.primary }}>
                  New
                </span>
              )}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {isNewUser ? (
                "Welcome to your personal journaling space!"
              ) : stats?.totalEntries ? (
                <>You've written <span className="font-bold" style={{ color: currentTheme.primary }}>
                  {stats.totalEntries}
                </span> journal {stats.totalEntries === 1 ? 'entry' : 'entries'} so far.</>
              ) : (
                "Ready to start your journal journey today?"
              )}
            </p>
            
            {/* Motivational message */}
            <p className="mt-1 text-sm italic" style={{ color: currentTheme.primary }}>
              {motivationalMessage}
            </p>
          </div>
          
          <div className="flex flex-col sm:items-end gap-4">
            <Button 
              onClick={handleNewEntry}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium shadow-md hover:translate-y-0.5 transition-all"
              style={{
                backgroundColor: elementColors.button,
                boxShadow: `0 4px 12px ${elementColors.button}40`
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Loading...</span>
              ) : isNewUser ? (
                <>
                  <span>Write First Entry</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Write New Entry</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            
            <button 
              onClick={handleLogout}
              className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Sign out
            </button>
          </div>
        </div>
        
        {/* New User Onboarding Tips */}
        {isNewUser && showOnboardingTips && (
          <div className="mt-20 bg-primary/10 backdrop-blur-sm rounded-xl  p-5 border border-primary/20 animate-pulse-slow">
            <div className="flex items-start gap-4">
              {onboardingTips[currentTip].icon}
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">{onboardingTips[currentTip].title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {onboardingTips[currentTip].content}
                </p>
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => handleTipAction(currentTip)}
                    className="text-xs px-3 py-1 rounded-lg"
                    style={{
                      backgroundColor: elementColors.button,
                      color: "white"
                    }}
                  >
                    {onboardingTips[currentTip].action}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {onboardingTips.map((_, index) => (
                        <div 
                          key={index} 
                          className="h-1.5 w-1.5 rounded-full" 
                          style={{ 
                            backgroundColor: index === currentTip ? currentTheme.primary : `${currentTheme.primary}40` 
                          }}
                        ></div>
                      ))}
                    </div>
                    <Button
                      onClick={nextTip}
                      className="text-xs bg-transparent hover:bg-primary/10 text-primary p-1 rounded-lg"
                      style={{ color: currentTheme.primary }}
                    >
                      {currentTip < onboardingTips.length - 1 ? "Next tip" : "Got it"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Cards Section - Only show full stats for returning users */}
        {!isNewUser ? (
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Latest Entry Card */}
            <div className="bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="h-4 w-4 text-blue-500" />
                </div>
                <h3 className="font-medium">Latest Entry</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {stats?.lastEntryDate ? (
                  new Date(stats.lastEntryDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })
                ) : (
                  "No entries yet"
                )}
              </p>
              <p className="text-xs mt-1" style={{ color: currentTheme.primary }}>
                {writingStatus.message}
              </p>
            </div>
            
            {/* Mood Card */}
            <div className="bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
                <h3 className="font-medium">Mood Trends</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {stats?.averageMood ? (
                  `Average mood: ${stats.averageMood}`
                ) : (
                  "Track your mood in entries"
                )}
              </p>
              <div className="mt-2 flex gap-1">
                {stats?.averageMood ? (
                  // Show emoji relevant to their average mood
                  <span className="text-sm px-2 py-1 rounded bg-primary/10" style={{ color: currentTheme.primary }}>
                    {getMoodEmoji(stats.averageMood)} {stats.averageMood}
                  </span>
                ) : (
                  // Show sample emojis for new users
                  ["😔", "😐", "🙂", "😊"].map((emoji, index) => (
                    <span 
                      key={index} 
                      className={`text-sm px-1.5 rounded ${index === 3 ? 'bg-green-500/10' : 'bg-background/50'}`}
                    >
                      {emoji}
                    </span>
                  ))
                )}
              </div>
            </div>
            
            {/* Activity Card */}
            <div className="bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-green-500" />
                </div>
                <h3 className="font-medium">Activity</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {stats?.mostProductiveDay ? (
                  `Most active: ${stats.mostProductiveDay}`
                ) : (
                  "Start writing to see patterns"
                )}
              </p>
              <div className="flex items-center mt-1">
                {stats?.streakCount && stats.streakCount > 0 ? (
                  <>
                    <Flame className="h-3 w-3 mr-1 text-orange-500" />
                    <p className="text-xs flex items-center">
                      <span className="font-bold mr-1" style={{ color: currentTheme.primary }}>
                        {stats.streakCount}
                      </span> 
                      day streak!
                    </p>
                  </>
                ) : (
                  <p className="text-xs">
                    {stats?.weeklyEntries ? (
                      `${stats.weeklyEntries} ${stats.weeklyEntries === 1 ? 'entry' : 'entries'} this week`
                    ) : (
                      "Start a writing streak today"
                    )}
                  </p>
                )}
              </div>
            </div>
            
            {/* Topics Card */}
            <div className="bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-amber-500" />
                </div>
                <h3 className="font-medium">Top Topics</h3>
              </div>
              {stats?.topTopics && stats.topTopics.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {stats.topTopics.filter(topic => 
                    // Filter out topics that look like hashes or encrypted values
                    !topic.name.includes(':') && 
                    topic.name.length < 30
                  ).slice(0, 3).map((topic, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 rounded-full bg-primary/10"
                      style={{ color: currentTheme.primary }}
                    >
                      #{topic.name}
                    </span>
                  ))}
                  {stats.topTopics.filter(topic => 
                    !topic.name.includes(':') && 
                    topic.name.length < 30
                  ).length === 0 && (
                    <p className="text-xs text-muted-foreground">Try adding topic tags to your entries</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Add topics to your entries
                  </p>
                  <p className="text-xs">Try tags like #gratitude or #goals</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Simplified Stats Section for New Users */
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="h-4 w-4 text-blue-500" />
                </div>
                <h3 className="font-medium">Understand Your thoughts & feelings deeply</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We listen via Text & Audio
              </p>
            </div>
            
            <div className="bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
                <h3 className="font-medium">See Your Unique patterns</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Like a personal mind map
              </p>
              <div className="mt-2 flex gap-1">
                {["😔", "😐", "🙂", "😊"].map((emoji, index) => (
                  <span 
                    key={index} 
                    className="text-sm px-1.5 rounded bg-background/50"
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all flex flex-col ">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Info className="h-4 w-4 text-green-500" />
                </div>
                <h3 className="font-medium">Get gentle nudges to act on your goals</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We're your accountability buddy!
              </p>
            </div>
          </div>
        )}
        
        {/* Progress Section - different views for new vs returning users */}
        <div className="mt-6 bg-background/30 backdrop-blur-sm rounded-xl p-5 border border-primary/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-journal-yellow/10 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-4 w-4 text-journal-yellow" />
              </div>
              <h3 className="font-medium">{isNewUser ? "Your Journaling Guide" : stats?.totalEntries ? "Writing Progress" : "Get Started"}</h3>
            </div>
            
            {!isNewUser && stats?.totalEntries ? (
              <button className="text-xs text-primary flex items-center hover:underline">
                View insights
                <ChevronRight className="h-3 w-3 ml-0.5" />
              </button>
            ) : (
              <div className="flex items-center">
                {!isNewUser && (
                  <>
                    <Award className="h-4 w-4 mr-1 text-journal-yellow" />
                    <span className="text-xs text-muted-foreground">Set goals and earn achievements</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {!isNewUser ? (
            /* Standard Progress Section for Returning Users */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              {/* Weekly Progress */}
              <div>
                <div className="flex justify-between mb-2 text-xs">
                  <span className="font-medium">Weekly goal</span>
                  <span className="font-bold">
                    {stats?.weeklyEntries || 0}/{recommendedGoal} entries
                  </span>
                </div>
                <div className="w-full bg-background/50 h-2 rounded-full">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: (stats?.weeklyEntries || 0) >= recommendedGoal ? '100%' : `${((stats?.weeklyEntries || 0) / recommendedGoal) * 100}%`,
                      backgroundColor: currentTheme.primary
                    }}
                  ></div>
                </div>
                {(stats?.weeklyEntries || 0) >= recommendedGoal ? (
                  <p className="text-xs mt-1 text-green-500">Weekly goal achieved!</p>
                ) : (
                  <p className="text-xs mt-1 text-muted-foreground">
                    {recommendedGoal - (stats?.weeklyEntries || 0)} more to reach your goal
                  </p>
                )}
              </div>
              
              {/* Monthly Progress */}
              <div>
                <div className="flex justify-between mb-2 text-xs">
                  <span className="font-medium">{getCurrentMonthName()} progress</span>
                  <span className="font-bold">{monthlyProgress.current}/{monthlyProgress.target} entries</span>
                </div>
                <div className="w-full bg-background/50 h-2 rounded-full">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${Math.min((monthlyProgress.current / monthlyProgress.target) * 100, 100)}%`,
                      backgroundColor: currentTheme.primary
                    }}
                  ></div>
                </div>
                {stats?.totalEntries ? (
                  <p className="text-xs mt-1 text-muted-foreground">
                    Keep up your {stats.streakCount && stats.streakCount > 1 ? `${stats.streakCount}-day streak!` : 'journaling habit!'}
                  </p>
                ) : (
                  <p className="text-xs mt-1 text-muted-foreground">
                    Your first entry counts toward this month's goal
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Enhanced Guide Section for New Users */
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center mb-2">
                    <BookMarked className="h-5 w-5 mr-2" style={{ color: currentTheme.primary }} />
                    <h4 className="font-medium text-sm">Journaling Benefits</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Regular journaling can reduce stress, improve mood, and increase self-awareness. 
                    Even 5 minutes a day can make a difference!
                  </p>
                </div>
                
                <div className="flex-1 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center mb-2">
                    <HelpCircle className="h-5 w-5 mr-2" style={{ color: currentTheme.primary }} />
                    <h4 className="font-medium text-sm">Getting Started</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Not sure what to write? Try our guided prompts or reflection templates 
                    to inspire your journaling practice.
                  </p>
                </div>
              </div>
              
              <Button
                onClick={handleNewEntry}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-white rounded-xl font-medium hover:translate-y-0.5 transition-all"
                style={{
                  backgroundColor: elementColors.button,
                  boxShadow: `0 4px 12px ${elementColors.button}40`
                }}
              >
                <span>Start Your First Entry</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;