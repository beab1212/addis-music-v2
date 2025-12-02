'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Users,
  Music,
  Album,
  Tag,
  Megaphone,
  Database,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const Tooltip = ({ label }: { label: string }) => (
  <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
    {label}
  </div>
);

export const Sidebar = () => {
  const location = usePathname() ?? '/admin';
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const adminLinks = [
    { to: '/admin', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/tracks', icon: Music, label: 'Tracks' },
    { to: '/admin/albums', icon: Album, label: 'Albums' },
    { to: '/admin/artists', icon: Users, label: 'Artists' },
    { to: '/admin/genres', icon: Tag, label: 'Genres' },
    { to: '/admin/ads', icon: Megaphone, label: 'Advertisements' },
    { to: '/admin/records', icon: Database, label: 'Records' },
  ];

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
      <button
        className="absolute z-50 top-20 -right-4 p-2 bg-white dark:text-gray-300 dark:bg-gray-900 border border-gray-300 dark:border-gray-700
                  rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
        <div className="mb-4 px-2">
          {!collapsed && (
            <>
              <h2 className="text-lg font-bold">Admin</h2>
              <p className="text-sm text-gray-500">Manage site data</p>
            </>
          )}
        </div>

        <nav className="space-y-1">
          {adminLinks.map(({ to, icon: Icon, label }) => (
            <Link key={to} href={to}>
              <motion.div
                onMouseEnter={() => setHovered(label)}
                onMouseLeave={() => setHovered(null)}
                whileHover={{ x: collapsed ? 0 : 4 }}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.startsWith(to)
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

        <div className="pt-6 px-4">
          {!collapsed && (
            <div className="flex gap-2">
              <Link href="/admin/create">
                <button className="px-3 py-2 bg-orange-500 text-white rounded-md text-sm">Create Record</button>
              </Link>
              <Link href="/admin/import">
                <button className="px-3 py-2 border rounded-md text-sm">Import</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
