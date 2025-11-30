'use client';

import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  Expand 
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { formatDuration } from '../utils/helpers';
import { useRouter } from 'next/navigation';

export const MiniPlayer = () => {
  const router = useRouter();
  const {
    currentSong,
    isPlaying,
    volume,
    isShuffle,
    repeatMode,
    currentTime,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleShuffle,
    setRepeatMode,
    setVolume,
  } = usePlayerStore();

  if (!currentSong) return null;

  const progress = currentSong.duration > 0 ? (currentTime / currentSong.duration) * 100 : 0;

  const handleRepeatToggle = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed inset-x-0 bottom-0 z-50"
    >
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-t from-orange-500/10 to-transparent blur-3xl -z-10" />

      <div className="bg-white/75 dark:bg-black/75 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 shadow-2xl">
        <div 
          className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"
          style={{ width: `${progress}%`, boxShadow: '0 0 8px rgba(251,146,60,0.6)' }}
        />

        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            {/* Track Info */}
            <div 
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
              onClick={() => router.push('/app/player')}
            >
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-12 h-12 rounded-xl shadow-md object-cover ring-2 ring-white/30 group-hover:ring-orange-400/60 transition-all group-hover:scale-105"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                  {currentSong.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-5">
              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-all ${
                  isShuffle 
                    ? 'text-orange-500 bg-orange-500/15 shadow-md' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Shuffle size={17} strokeWidth={2.3} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={playPrevious}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <SkipBack size={20} />
              </motion.button>

              {/* Hero Play/Pause */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={togglePlayPause}
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full p-3.5 shadow-lg hover:shadow-orange-500/50 transition-all relative overflow-hidden"
              >
                {isPlaying ? (
                  <Pause size={23} fill="white" />
                ) : (
                  <Play size={23} fill="white" className="ml-0.5" />
                )}
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-full"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={playNext}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <SkipForward size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRepeatToggle}
                className={`p-2 rounded-full transition-all relative ${
                  repeatMode !== 'off'
                    ? 'text-purple-500 bg-purple-500/15 shadow-md'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Repeat size={17} strokeWidth={2.3} />
                {repeatMode === 'one' && (
                  <span className="absolute -top-0.5 -right-0.5 text-[9px] font-black bg-purple-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-md">
                    1
                  </span>
                )}
              </motion.button>
            </div>

            {/* Volume + Expand (Desktop) */}
            <div className="hidden md:flex items-center gap-4 text-gray-500">
              <Volume2 size={16} />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 h-1 rounded-full accent-orange-500 cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #fb923c ${volume}%, #374151 ${volume}%)`,
                }}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push('/app/player')}
                className="p-1.5 hover:text-gray-900 dark:hover:text-white"
              >
                <Expand size={16} />
              </motion.button>
            </div>
          </div>

          {/* Compact Progress */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatDuration(currentTime)}</span>
            <div className="flex-1 relative">
              <div className="h-1 bg-gray-300/60 dark:bg-gray-700/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                onChange={() => {}}
              />
            </div>
            <span>{formatDuration(currentSong.duration)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
