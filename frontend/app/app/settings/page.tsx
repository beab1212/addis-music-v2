'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Settings as SettingsIcon, Bell, Globe, Volume2, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import SixBandEqualizer from '@/components/SixBandEqualizer';

export default function Settings() {
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState({
    favoriteGenres: '',
    favoriteArtists: '',
    moodPreference: '',
    language: '',
  });

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const response = await api.get('/user/preferences');
        if (response.data.data && response.data.data.userPreferences) {
          setFormData({
              favoriteGenres: response.data.data.userPreferences.favoriteGenres.join(', '),
              favoriteArtists: response.data.data.userPreferences.favoriteArtists.join(', '),
              moodPreference: response.data.data.userPreferences.moodPreference,
              language: response.data.data.userPreferences.language,
            });
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    }
    fetchUserPreferences();
  }, []);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        favoriteGenres: formData.favoriteGenres.split(',').map((genre) => genre.trim()),
        favoriteArtists: formData.favoriteArtists.split(',').map((artist) => artist.trim()),
        moodPreference: formData.moodPreference,
        language: formData.language,
      };
      await api.put('/user/preferences', payload);
      addToast('Preferences updated successfully!', 'success');
    } catch (error: any) {
      console.error('Error updating user preferences:', error);
      addToast(error?.response?.data?.message || 'Failed to update preferences.', 'error');
    }
  }

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

          {/* <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
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
          </div> */}

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={24} className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preference</h2>
            </div>

            <div className="space-y-3">
              {/* use like favoriteGenres, favoriteArtists, moodPreference input field defaulted to edit disable */}
              <form className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8" onSubmit={submitHandler}>

                {/* Input */}
                <div className="relative">
                  <input
                    type="text"
                    name='favoriteGenres'
                    defaultValue={formData.favoriteGenres || ''}
                    onChange={changeHandler}
                    placeholder=" "
                    className="peer w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 pt-6 pb-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-0 outline-none transition"
                  />
                  <label className="pointer-events-none absolute left-4 top-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
            peer-placeholder-shown:text-gray-400
            peer-focus:top-2 peer-focus:text-sm peer-focus:text-orange-500">
                    Favorite Genres
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name='favoriteArtists'
                    defaultValue={formData.favoriteArtists || ''}
                    onChange={changeHandler}
                    placeholder=" "
                    className="peer w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 pt-6 pb-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-0 outline-none transition"
                  />
                  <label className="pointer-events-none absolute left-4 top-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
            peer-placeholder-shown:text-gray-400
            peer-focus:top-2 peer-focus:text-sm peer-focus:text-orange-500">
                    Favorite Artists
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name='moodPreference'
                    defaultValue={formData.moodPreference || ''}
                    onChange={changeHandler}
                    placeholder=" "
                    className="peer w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 pt-6 pb-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-0 outline-none transition"
                  />
                  <label className="pointer-events-none absolute left-4 top-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
            peer-placeholder-shown:text-gray-400
            peer-focus:top-2 peer-focus:text-sm peer-focus:text-orange-500">
                    Mood Preference
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name='language'
                    defaultValue={formData.language || ''}
                    onChange={changeHandler}
                    placeholder=" "
                    className="peer w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 pt-6 pb-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-0 outline-none transition"
                  />
                  <label className="pointer-events-none absolute left-4 top-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
            peer-placeholder-shown:text-gray-400
            peer-focus:top-2 peer-focus:text-sm peer-focus:text-orange-500">
                    Language
                  </label>
                </div>


                {/* Actions */}
                <div className="md:col-span-2 flex justify-end pt-4">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                  >
                    Save changes
                  </button>
                </div>
              </form>

            </div>
          </div>


          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6x shadow-lg overflow-hidden">
            {/* <SixBandEqualizer /> */}
          </div>



          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hidden">
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
