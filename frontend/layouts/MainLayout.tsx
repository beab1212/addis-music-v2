'use client';
import { ReactNode, memo, useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Dynamically import the components with proper typing and `ssr: false`
const DynamicMiniPlayer = dynamic(() => import('@/components/MiniPlayer').then(mod => mod.default), { ssr: false });
const DynamicToast = dynamic(() => import('@/components/Toast').then(mod => mod.Toast), { ssr: false });
const DynamicAuthModal = dynamic(() => import('@/components/AuthModal').then(mod => mod.AuthModal), { ssr: false });

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = memo(({ children }: MainLayoutProps) => {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState<string | null>(pathname || '');

  useEffect(() => {
    setCurrentPath(pathname);
    console.log("Current path updated to:", pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar />

      {!currentPath?.startsWith('/app/player') && (
        <Sidebar />
      )}

      <main className={`pt-16 ${currentPath?.startsWith('/app/player') ? '' : 'md:ml-64 pb-24'}`}>
        {children}
      </main>


      {/* Lazy-loaded components */}
      {!currentPath?.startsWith('/app/player') && (
        <DynamicMiniPlayer />
      )}


      <DynamicToast />
      <DynamicAuthModal />
    </div>
  );
});