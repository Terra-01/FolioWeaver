// src/app/layout.tsx
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from '@/components/ThemeProvider';

// Import multiple fonts
import { Geist, Geist_Mono } from "next/font/google";
import { Lato } from 'next/font/google';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Initialize all font pairs
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const lato = Lato({ variable: "--font-lato", weight: ['400', '700'], subsets: ['latin'] });

// --- Server-side function to read settings ---
async function getSiteSettings() {
  const settingsPath = path.join(process.cwd(), 'src/content/settings.md');
  const fileContents = fs.readFileSync(settingsPath, 'utf8');
  const { data } = matter(fileContents);
  return {
    metaTitle: data.metaTitle || 'FolioWeaver',
    metaDescription: data.metaDescription || 'Weave your portfolio.',
    defaultTheme: data.defaultTheme || 'dark-slate',
    fontPair: data.fontPair || 'geist',
    favicon: data.favicon || '/favicon.ico',
  };
}

// --- Generate Metadata dynamically ---
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.metaTitle,
    description: settings.metaDescription,
    icons: {
      icon: settings.favicon,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  // Conditionally select font variables
  const fontVariables = settings.fontPair === 'lato'
    ? `${lato.variable}`
    : `${geistSans.variable} ${geistMono.variable}`;

  return (
    <html lang="en">
      <body className={`${fontVariables} antialiased`}>
        <ThemeProvider defaultTheme={settings.defaultTheme}>
          {/* --- Toaster component --- */}
          <Toaster 
            position="bottom-center"
            toastOptions={{
              // Default options
              duration: 5000,
              style: {
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-primary)',
                boxShadow: '0 6px 20px 0 var(--color-shadow)/20',
              },
              // Options for specific toast types
              success: {
                iconTheme: {
                  primary: 'var(--color-accent-solid)',
                  secondary: 'var(--color-bg-primary)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--color-error)',
                  secondary: 'var(--color-bg-primary)',
                },
              },
            }}
          />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}