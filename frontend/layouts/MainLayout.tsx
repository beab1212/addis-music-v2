'use client';
import { ReactNode } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { MiniPlayer } from '@/components/MiniPlayer';
import { Toast } from '@/components/Toast';
import { AuthModal } from '@/components/AuthModal';
import { useTheme } from '@/hooks/useTheme';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 pt-16 pb-24">
        {children}
      </main>
      <MiniPlayer />
      <Toast />
      <AuthModal />
    </div>
  );
};
