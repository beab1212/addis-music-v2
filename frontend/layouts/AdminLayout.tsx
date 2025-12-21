'use client';
import { ReactNode, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/admin/Sidebar';
import { MiniPlayer } from '@/components/MiniPlayer';
import { Toast } from '@/components/Toast';
import { AuthModal } from '@/components/AuthModal';
import { useTheme } from '@/hooks/useTheme';

interface MainLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 overflow-x-scroll modern-scrollbar-minimal">     
      <Navbar />
      <div className='flex'>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`pt-16 pb-24 transition-all duration-300 flex-1 ${collapsed ? 'md:ml-20' : 'md:ml-72'}`}>
          {children}
        </main>
      </div>
      <Toast />
      <AuthModal />
    </div>
  );
};
