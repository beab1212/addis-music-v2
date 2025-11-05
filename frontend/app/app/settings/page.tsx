'use client';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Settings as SettingsIcon, Bell, Globe, Volume2, Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon size={32} className="text-orange-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={24} className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={24} className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Language</h2>
            </div>
            <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Japanese</option>
            </select>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 size={24} className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audio Quality</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  defaultChecked
                  className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Normal (128 kbps)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Good quality, less data usage
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">High (256 kbps)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Better quality, more data usage
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Very High (320 kbps)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Best quality, highest data usage
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={24} className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-900 dark:text-white">New releases from artists you follow</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-900 dark:text-white">Playlist updates</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-900 dark:text-white">Recommended songs</span>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={24} className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-900 dark:text-white">Make playlists public by default</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-900 dark:text-white">Show listening activity</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-900 dark:text-white">Allow personalized recommendations</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
