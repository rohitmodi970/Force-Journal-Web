"use client";

import { Inter, Roboto, Poppins, Open_Sans, Montserrat } from 'next/font/google';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/utilities/context/ThemeContext';
import { SessionProvider } from "next-auth/react";
// Font configurations
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <div className={`${inter.variable} ${roboto.variable} ${poppins.variable} ${openSans.variable} ${montserrat.variable}`}>
      <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
      </SessionProvider>
    </div>
  );
}