'use client';
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { Home, Search, Library, PlusCircle, Heart, Settings, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlaylistStore } from '../store/playlistStore';
import { useAuthStore } from '../store/authStore';

export const Sidebar = () => {
  const location = usePathname();
  const { playlists } = usePlaylistStore();
  const { isAuthenticated, user } = useAuthStore();

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
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 pt-16 pb-24 fixed left-0 top-0 bottom-0 z-20">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <nav className="space-y-1">
          {mainLinks.map(({ to, icon: Icon, label }) => (
            <Link key={to} href={to}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(to)
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </motion.div>
            </Link>
          ))}
        </nav>

        {isAuthenticated && (
          <>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/playlist/new">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <PlusCircle size={20} />
                  <span className="font-medium">Create Playlist</span>
                </motion.div>
              </Link>
            </div>

            <nav className="space-y-1">
              {secondaryLinks.map(({ to, icon: Icon, label }) => (
                <Link key={to} href={to}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(to)
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{label}</span>
                  </motion.div>
                </Link>
              ))}
            </nav>

            {user?.isPremium && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link href="/admin">
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/admin')
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <LayoutDashboard size={20} />
                    <span className="font-medium">Admin Dashboard</span>
                  </motion.div>
                </Link>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Your Playlists
              </h3>
              <div className="space-y-1">
                {playlists.slice(0, 5).map((playlist) => (
                  <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <img
                        src={playlist.coverUrl}
                        alt={playlist.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <span className="text-sm truncate">{playlist.name}</span>
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
