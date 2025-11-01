'use client';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Playlist } from '@/types';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/playerStore';

interface PlaylistCardProps {
  playlist: Playlist;
}

export const PlaylistCard = ({ playlist }: PlaylistCardProps) => {
  const navigate = useRouter();
  const { setQueue, setCurrentSong } = usePlayerStore();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.songs.length > 0) {
      setQueue(playlist.songs);
      setCurrentSong(playlist.songs[0]);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate.push(`/app/playlist/${playlist.id}`)}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer group"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={playlist.coverUrl}
          alt={playlist.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlay}
            className="bg-orange-500 text-white rounded-full p-4 shadow-xl hover:bg-orange-600 transition-colors"
          >
            <Play size={24} fill="white" />
          </motion.button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{playlist.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{playlist.description}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{playlist.songs.length} songs</p>
      </div>
    </motion.div>
  );
};
