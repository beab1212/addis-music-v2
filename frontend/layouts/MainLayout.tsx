'use client';
import { ReactNode, memo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import dynamic from 'next/dynamic';

// Dynamically import the components with proper typing and `ssr: false`
const DynamicMiniPlayer = dynamic(() => import('@/components/MiniPlayer').then(mod => mod.default), { ssr: false });
const DynamicToast = dynamic(() => import('@/components/Toast').then(mod => mod.Toast), { ssr: false });
const DynamicAuthModal = dynamic(() => import('@/components/AuthModal').then(mod => mod.AuthModal), { ssr: false });

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = memo(({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 pt-16 pb-24">
        {children}
      </main>
      {/* Lazy-loaded components */}
      <DynamicMiniPlayer />
      <DynamicToast />
      <DynamicAuthModal />
    </div>
  );
});
