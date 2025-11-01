'use client';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Maximize2 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { formatDuration } from '../utils/helpers';
import { useRouter } from 'next/navigation';

export const MiniPlayer = () => {
  const navigate = useRouter();
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
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 z-40"
    >
      <div className="absolute top-0 left-0 h-1 bg-orange-500" style={{ width: `${progress}%` }} />

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-14 h-14 rounded-lg shadow-lg object-cover cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate.push('/player')}
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-orange-500 transition-colors"
                  onClick={() => navigate.push('/player')}>
                {currentSong.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{currentSong.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors ${
                isShuffle ? 'text-orange-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Shuffle size={18} />
            </button>

            <button
              onClick={playPrevious}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <SkipBack size={20} />
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlayPause}
              className="bg-orange-500 text-white rounded-full p-3 shadow-lg hover:bg-orange-600 transition-colors"
            >
              {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
            </motion.button>

            <button
              onClick={playNext}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <SkipForward size={20} />
            </button>

            <button
              onClick={handleRepeatToggle}
              className={`p-2 rounded-full transition-colors relative ${
                repeatMode !== 'off' ? 'text-orange-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Repeat size={18} />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 text-xs font-bold">1</span>
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Volume2 size={18} className="text-gray-600 dark:text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24 accent-orange-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{volume}</span>
          </div>

          <button
            onClick={() => navigate.push('/player')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Maximize2 size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span>{formatDuration(currentTime)}</span>
          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span>{formatDuration(currentSong.duration)}</span>
        </div>
      </div>
    </motion.div>
  );
};
