import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import Navbar from '@/common/components/Navbar';
import '../styles/globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DocumentAI - Intelligent Document Processing',
  description: 'Advanced document processing and analysis platform',
};

export default function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-gray-100 dark:bg-gray-900 py-6">
              <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
                <p>© {new Date().getFullYear()} DocumentAI. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
