import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/utilities/SessionWrapper";
import { ThemeProvider } from "@/utilities/context/ThemeContext";
import MainNavbar from "@/components/Navbar/MainNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Force Web App",
  description: "Journal Web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionWrapper>
          <ThemeProvider>
              <MainNavbar />
              {children}
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}