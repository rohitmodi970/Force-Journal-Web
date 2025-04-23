"use client"
import { useSession } from "next-auth/react";
import LoginForm from "@/components/LoginForm";
import ThemeSelector from '../components/ThemeSelector';
import { useTheme } from "@/utilities/context/ThemeContext";
import SnapStart from "@/components/snapStart";

const MainContent = () => {
  const { currentTheme, isDarkMode } = useTheme();

  return (
    <>

      <div
        className="flex flex-col h-[300vh] transition-colors duration-300"
        style={{
          backgroundColor: currentTheme.light,
          color: isDarkMode ? 'white' : 'var(--text-primary)',
        }}
      >
        {/* Navbar is already rendered in RootLayout, so we don't need it here */}
        <div className="h-[10vh] mb-5">
          {/* Space for fixed navbar */}
        </div>
        <div className="container mx-auto p-6">
          <ThemeSelector />
        </div>
        <div className="flex-1 transition-colors duration-300"
          style={{
            backgroundColor: isDarkMode ? 'var(--theme-primary)' : 'var(--bg-secondary)',
          }}
        >
          {/* Main content */}
        </div>
      </div>
    </>
  );
};
const MainContent2 = () => {
  const { currentTheme, isDarkMode } = useTheme();

  return (
    <>
  <MainContent/>
    
    </>
  );
};

export default function Home() {
  const { data: session } = useSession();

  // Use conditional rendering for the session check
  // This authentication check is redundant since AuthCheck in RootLayout handles this
  // You can remove it completely since LoginForm is already shown as fallback in AuthCheck
  // Or keep it if you need page-specific behavior

  // No need for ThemeProvider here since it's in RootLayout
  return <MainContent2 />;
}