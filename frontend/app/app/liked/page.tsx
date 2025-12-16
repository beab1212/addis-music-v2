'use client';
import { motion } from 'framer-motion';
import { Heart, Play } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { mockSongs } from '@/utils/mockData';
import { SongCard } from '@/components/SongCard';
import { usePlayerStore } from '@/store/playerStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function LikedSongs() {
  const { user } = useAuthStore();
  const { setQueue, setCurrentSong } = usePlayerStore();
  const [likedSongs, setLikedSongs] = useState([]);
  const navigate = useRouter();

  if (!user) {
    navigate.push('/');
    return null;
  }

  useEffect(() => {
    // Fetch liked songs from API or use mock data
    const fetchLikedSongs = async () => {
      try {
        const response = await api.get('/track-likes/liked-tracks');
        setLikedSongs(response.data.data.tracks);
      } catch (error) {
        console.error('Error fetching liked songs:', error);
      }
    };

    fetchLikedSongs();
  }, [])

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      setQueue(likedSongs);
      setCurrentSong(likedSongs[0]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-linear-to-br from-pink-500 to-orange-500 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-end gap-6">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Heart size={64} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-white/90 mb-2">PLAYLIST</p>
              <h1 className="text-5xl font-bold text-white mb-4">Liked Songs</h1>
              <p className="text-white/90">{likedSongs.length} songs</p>
            </div>
          </div>
        </div>

        {likedSongs.length > 0 ? (
          <>
            <div className="mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayAll}
                className="bg-orange-500 text-white rounded-full p-4 shadow-xl hover:bg-orange-600 transition-colors"
              >
                <Play size={24} fill="white" />
              </motion.button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {likedSongs?.map((song: any) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No liked songs yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Start liking songs to see them here
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
