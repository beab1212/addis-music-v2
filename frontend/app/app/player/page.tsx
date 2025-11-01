'use client';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart, MoreHorizontal, ChevronDown } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration, getColorFromImage } from '@/utils/helpers';
import { useRouter } from 'next/navigation';

export default function Player() {
  const navigate = useRouter();
  const {
    currentSong,
    isPlaying,
    volume,
    isShuffle,
    repeatMode,
    queue,
    currentTime,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleShuffle,
    setRepeatMode,
    setVolume,
    setCurrentSong,
  } = usePlayerStore();

  if (!currentSong) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No song playing
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select a song to start listening
          </p>
        </div>
      </div>
    );
  }

  const progress = currentSong.duration > 0 ? (currentTime / currentSong.duration) * 100 : 0;
  const gradientClass = getColorFromImage(currentSong.coverUrl);

  const handleRepeatToggle = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className={`absolute inset-0 bg-linear-to-br ${gradientClass} opacity-20 dark:opacity-30`} />
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`absolute inset-0 bg-linear-to-br ${gradientClass} opacity-10 blur-3xl`}
      />

      <div className="relative container mx-auto px-4 py-8">
        <button
          onClick={() => navigate.push('/')}
          className="mb-6 p-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
        >
          <ChevronDown size={24} />
        </button>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <motion.img
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-full aspect-square rounded-3xl shadow-2xl object-cover mb-8"
            />

            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentSong.title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">{currentSong.artist}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-black/30 transition-colors">
                  <Heart size={24} />
                </button>
                <button className="p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-black/30 transition-colors">
                  <MoreHorizontal size={24} />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{formatDuration(currentTime)}</span>
                <div className="flex-1 h-2 bg-white/20 dark:bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className="h-full bg-orange-500"
                    style={{ width: `${progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <span>{formatDuration(currentSong.duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mb-12">
              <button
                onClick={toggleShuffle}
                className={`p-3 rounded-full transition-colors ${
                  isShuffle
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-black/30'
                }`}
              >
                <Shuffle size={20} />
              </button>

              <button
                onClick={playPrevious}
                className="p-4 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
              >
                <SkipBack size={28} />
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayPause}
                className="p-6 rounded-full bg-orange-500 text-white shadow-2xl hover:bg-orange-600 transition-colors"
              >
                {isPlaying ? <Pause size={36} fill="white" /> : <Play size={36} fill="white" />}
              </motion.button>

              <button
                onClick={playNext}
                className="p-4 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
              >
                <SkipForward size={28} />
              </button>

              <button
                onClick={handleRepeatToggle}
                className={`p-3 rounded-full transition-colors relative ${
                  repeatMode !== 'off'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-black/30'
                }`}
              >
                <Repeat size={20} />
                {repeatMode === 'one' && (
                  <span className="absolute -top-1 -right-1 text-xs font-bold">1</span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <Volume2 size={24} className="text-gray-600 dark:text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <span className="text-gray-600 dark:text-gray-400 w-12">{volume}%</span>
            </div>

            {queue.length > 1 && (
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Up Next ({queue.length - 1})
                </h3>
                <div className="space-y-2">
                  {queue.slice(1, 6).map((song) => (
                    <motion.div
                      key={song.id}
                      whileHover={{ x: 4 }}
                      onClick={() => setCurrentSong(song)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 cursor-pointer transition-colors"
                    >
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {song.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {song.artist}
                        </p>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDuration(song.duration)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
