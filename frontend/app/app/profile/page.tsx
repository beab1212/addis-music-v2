'use client';
import { motion } from 'framer-motion';
import { Edit, LogOut, Crown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePlaylistStore } from '@/store/playlistStore';
import { useRouter } from 'next/navigation';
import { PlaylistCard } from '@/components/PlaylistCard';
import { mockSongs } from '@/utils/mockData';
import { SongCard } from '@/components/SongCard';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const { playlists } = usePlaylistStore();
  const navigate = useRouter();

  if (!user) {
    navigate.push('/');
    return null;
  }

  const userPlaylists = playlists.filter((p) => p.createdBy === user.id);
  const likedSongs = mockSongs.filter((s) => user.likedSongs.includes(s.id));

  const handleLogout = () => {
    logout();
    navigate.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-linear-to-br from-orange-400 to-pink-500 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <img
              src={user.photoUrl}
              alt={user.username}
              className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
            />
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-4xl font-bold text-white">{user.username}</h1>
                {user.isPremium && (
                  <div className="bg-yellow-400 text-gray-900 rounded-full p-1.5">
                    <Crown size={20} />
                  </div>
                )}
              </div>
              <p className="text-white/90 mb-4">{user.email}</p>
              <p className="text-white/80">{user.bio}</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <Edit size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <LogOut size={20} />
              </motion.button>
            </div>
          </div>
        </div>

        {!user.isPremium && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-linear-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-2xl p-6 mb-8 cursor-pointer"
            onClick={() => navigate.push('/app/premium')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Upgrade to Premium</h3>
                <p className="text-white/90">Get unlimited access to all features</p>
              </div>
              <Crown size={48} className="text-white" />
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-2">Playlists</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {userPlaylists.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-2">Liked Songs</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{likedSongs.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-2">Following</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {user.followedArtists.length}
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Playlists</h2>
          {userPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {userPlaylists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No playlists yet</p>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Liked Songs</h2>
          {likedSongs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {likedSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No liked songs yet</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
