'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, Crown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const navigate = useRouter();
  const { isAuthenticated, user, openAuthModal } = useAuthStore();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80x dark:bg-gray-900/80x backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/app" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500x to-pink-500x rounded-lg flex items-center justify-center">
              {/* <span className="text-white font-bold text-xl">M</span> */}
              <img src="/addisMusic.png" alt="Addis Music Logo" className="object-contain" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">Addis Music</span>
          </Link>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate.push('/search')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Search size={20} />
            </motion.button>

            {isAuthenticated ? (
              <>
                {!user?.isPremium && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate.push('/premium')}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-linear-to-r from-orange-500 to-pink-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Crown size={16} />
                    <span>Get Premium</span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate.push('/profile')}
                  className="flex items-center gap-2"
                >
                  <img
                    src={user?.photoUrl}
                    alt={user?.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-500"
                  />
                </motion.button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  Sign In
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600 transition-colors"
                >
                  Sign Up
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
