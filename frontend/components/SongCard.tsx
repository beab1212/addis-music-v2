'use client';
import { motion } from 'framer-motion';
import { Play, MoreVertical } from 'lucide-react';
import { Song } from '@/types';
import { formatNumber } from '@/utils/helpers';
import { usePlayerStore } from '@/store/playerStore';

interface SongCardProps {
  song: Song;
}

export const SongCard = ({ song }: SongCardProps) => {
  const { setCurrentSong, setQueue } = usePlayerStore();

  const handlePlay = () => {
    setCurrentSong(song);
    setQueue([song]);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer group"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={song.coverUrl}
          alt={song.title}
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
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{song.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{song.artist}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-500">{formatNumber(song.plays)} plays</span>
          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
