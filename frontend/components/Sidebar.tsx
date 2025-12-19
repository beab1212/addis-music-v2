'use client';

import Link from 'next/link';
import { usePathname } from "next/navigation";
import { Home, Search, Library, PlusCircle, Heart, Settings, LayoutDashboard, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from "react";
import { useAuthStore } from '../store/authStore';
import { api } from '@/lib/api';
import { getLowResCloudinaryUrl } from '@/utils/helpers';

const Tooltip = ({ label }: { label: string }) => (
  <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
    {label}
  </div>
);

export const Sidebar = ({ collapsed, onCollapseChange }: { collapsed: boolean; onCollapseChange: (collapsed: boolean) => void }) => {
  const location = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  const [hovered, setHovered] = useState<string | null>(null);

  const [playlists, setPlaylists] = useState<Array<any>>([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/playlists/user');
          console.log('Fetched playlists=====:', response.data.data.playlists);
          setPlaylists(response.data.data.playlists);
        } catch (error) {
          console.error('Error fetching playlists:', error);
        }
      }
    };

    fetchPlaylists();
  }, [isAuthenticated]);

  const mainLinks = [
    { to: '/app', icon: Home, label: 'Home' },
    { to: '/app/search', icon: Search, label: 'Search' },
    { to: '/app/library', icon: Library, label: 'Your Library' },
  ];

  const secondaryLinks = [
    { to: '/app/liked', icon: Heart, label: 'Liked Songs' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => location === path;

  return (
    <aside
      className={`
        pt-16
        hidden md:flex flex-col
        ${collapsed ? 'w-20' : 'w-72'}
        bg-white dark:bg-black 
        border-r border-gray-200 dark:border-gray-700
        pt-16 pb-24 fixed left-0 top-0 bottom-0
        z-20 transition-all duration-300
      `}
    >
      {/* Toggle Button */}
      <button
        className="absolute z-50 top-20 -right-4 p-2 bg-white dark:text-gray-300 dark:bg-gray-900 border border-gray-300 dark:border-gray-700
                  rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        onClick={() => onCollapseChange(!collapsed)}
      >
        <Menu size={18} />
      </button>

      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
        <nav className="space-y-1">
          {mainLinks.map(({ to, icon: Icon, label }) => (
            <Link key={to} href={to}>
              <motion.div
                onMouseEnter={() => setHovered(label)}
                onMouseLeave={() => setHovered(null)}
                whileHover={{ x: collapsed ? 0 : 4 }}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(to)
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={22} />
                {!collapsed && <span className="font-medium">{label}</span>}

                {/* Tooltip when collapsed */}
                {collapsed && hovered === label && <Tooltip label={label} />}
              </motion.div>
            </Link>
          ))}
        </nav>

        {isAuthenticated && (
          <>
            {/* Create Playlist */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/playlist/new">
                <motion.div
                  onMouseEnter={() => setHovered("Create Playlist")}
                  onMouseLeave={() => setHovered(null)}
                  whileHover={{ x: collapsed ? 0 : 4 }}
                  className="relative flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <PlusCircle size={22} />
                  {!collapsed && <span className="font-medium">Create Playlist</span>}
                  {collapsed && hovered === "Create Playlist" && (
                    <Tooltip label="Create Playlist" />
                  )}
                </motion.div>
              </Link>
            </div>

            {/* Secondary Links */}
            <nav className="space-y-1">
              {secondaryLinks.map(({ to, icon: Icon, label }) => (
                <Link key={to} href={to}>
                  <motion.div
                    onMouseEnter={() => setHovered(label)}
                    onMouseLeave={() => setHovered(null)}
                    whileHover={{ x: collapsed ? 0 : 4 }}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(to)
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={22} />
                    {!collapsed && <span className="font-medium">{label}</span>}
                    {collapsed && hovered === label && <Tooltip label={label} />}
                  </motion.div>
                </Link>
              ))}
            </nav>

            {/* Admin Dashboard */}
            {user?.isPremium && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link href="/app/admin">
                  <motion.div
                    onMouseEnter={() => setHovered("Admin Dashboard")}
                    onMouseLeave={() => setHovered(null)}
                    whileHover={{ x: collapsed ? 0 : 4 }}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      location?.startsWith('/app/admin')
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <LayoutDashboard size={22} />
                    {!collapsed && <span className="font-medium">Admin Dashboard</span>}
                    {collapsed && hovered === "Admin Dashboard" && (
                      <Tooltip label="Admin Dashboard" />
                    )}
                  </motion.div>
                </Link>
              </div>
            )}

            {/* Playlists */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {!collapsed && (
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Your Playlists
                </h3>
              )}

              <div className="space-y-1">
                {playlists?.map((playlist) => (
                  <Link key={playlist.id} href={`/app/playlist/${playlist.id}`}>
                    <motion.div
                      onMouseEnter={() => setHovered(playlist?.title)}
                      onMouseLeave={() => setHovered(null)}
                      whileHover={{ x: collapsed ? 0 : 4 }}
                      className="relative flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <img
                        src={getLowResCloudinaryUrl(playlist.coverUrl || 'https://res.cloudinary.com/dxcbu8zsz/image/upload/v1764662955/Music-album-cover-artwork-for-sale-2_z0nxok.jpg', { width: 40, height: 40 })}
                        className="w-8 h-8 rounded object-cover"
                        alt={playlist?.title}
                      />

                      {!collapsed && <span className="text-sm truncate">{playlist.title}</span>}
                      {collapsed && hovered === playlist.title && (
                        <Tooltip label={playlist.title} />
                      )}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
