// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import SessionWrapper from "@/utilities/SessionWrapper";
import MainNavbar from "@/components/Navbar/MainNavbar";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Force Web App",
  description: "Journal Web app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta 
          httpEquiv="Content-Security-Policy" 
          content={`default-src 'self'; connect-src 'self' ${process.env.SA_MODEL_LINK || 'http://localhost:8000'} https://extensions.aitopia.ai; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';frame-src https://drive.google.com;`}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <SessionWrapper>
            <MainNavbar />
            {children}
          </SessionWrapper>
        </Providers>
      </body>
    </html>
  );
}