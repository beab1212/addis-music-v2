'use client';
import { motion } from 'framer-motion';
import { Users, Music, Album, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const router = useRouter();

  const sections = [
    { title: 'Analytics', icon: BarChart3, href: '/app/admin/analytics', color: 'from-blue-500 to-cyan-500' },
    { title: 'Users', icon: Users, href: '/app/admin/users', color: 'from-orange-500 to-pink-500' },
    { title: 'Tracks', icon: Music, href: '/app/admin/tracks', color: 'from-purple-500 to-pink-500' },
    { title: 'Albums', icon: Album, href: '/app/admin/albums', color: 'from-green-500 to-teal-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 size={32} className="text-orange-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section) => (
            <motion.div
              key={section.title}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => router.push(section.href)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4`}>
                <section.icon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Manage {section.title.toLowerCase()}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
