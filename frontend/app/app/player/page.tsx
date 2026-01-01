'use client';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart, MoreHorizontal, ChevronDown, Share2Icon } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration, getColorFromImage, getLowResCloudinaryUrl } from '@/utils/helpers';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ShareButtons from '@/components/ShareButtons';

export default function Player() {
  const router = useRouter();
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
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
    setCurrentTime,
    setDuration,
    isLiked,
  } = usePlayerStore();
  const toggleIsLiked = usePlayerStore(state => state.toggleIsLiked);

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

  const progress = currentSong?.durationSec > 0 ? (currentTime / currentSong?.durationSec) * 100 : 0;
  const gradientClass = getColorFromImage(currentSong.coverUrl);

  const handleRepeatToggle = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  useEffect(() => {
    console.log("Current song: ", queue);
  }, [queue]);

  return (
    <div className="min-h-screen relative overflow-hidden -mb-24">
      <div className={`absolute inset-0 bg-linear-to-br ${gradientClass} opacity-20 dark:opacity-30`} />
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradientClass} opacity-10 blur-3xl`}
      />

      <div className="relative container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 p-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
        >
          <ChevronDown size={24} />
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className='relative mb-8'>
              <img
                src={getLowResCloudinaryUrl(currentSong.coverUrl || 'https://res.cloudinary.com/dxcbu8zsz/image/upload/v1764662955/Music-album-cover-artwork-for-sale-2_z0nxok.jpg', { width: 900, height: 900 })}
                alt={currentSong.title}
                className={`w-full aspect-square rounded-full shadow-2xl object-cover slow-spin  ${!isPlaying && "paused"
                  } `}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="/addisMusic.png" alt="logo" className="w-24 h-24 bg-black/90 rounded-full p-4 border-4 border-white/90 object-contain shadow-lg shadow-black" />
              </div>
            </div>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentSong.title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">{currentSong.artist.name}</p>
              </div>
              <div className="relative flex gap-2">
                <button
                  className="p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
                  onClick={toggleIsLiked}
                >
                  <Heart size={24} className={isLiked ? 'text-red-500' : ''} />
                </button>

                <button
                  className="p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
                  onClick={() => setSharePanelOpen(!sharePanelOpen)}
                >
                  <Share2Icon size={24} />
                </button>

                {sharePanelOpen && (
                  <div
                    className="absolute bottom-full md:-right-14 right-0 mb-4 z-50 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-md shadow-2xl border border-white/20 dark:border-black/20"
                    onClick={(e) => e.stopPropagation()} // Prevent click outside from closing if needed
                  >
                    <div className="flex flex-col items-center gap-4">
                      {/* <p className="text-sm opacity-80">Share this song</p> */}
                      <ShareButtons
                        url={`http://localhost:3000/app/player/${currentSong.id}`}
                        title={`Listening to ${currentSong.title} by ${currentSong.artist.name} on AddisMusic!`}
                      />
                    </div>

                    {/* small triangle pointer */}
                    <div className="absolute bottom-0 md:left-1/2 left-34 -translate-x-1/2 translate-y-full">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white/20 dark:border-t-black/20" />
                    </div>
                  </div>
                )}

                {/* Click outside to close */}
                {sharePanelOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSharePanelOpen(false)}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{formatDuration(currentTime)}</span>
                <div className="flex-1 relative">
                  <div className="h-2 bg-gray-300/60 dark:bg-gray-700/60 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-linear-to-r from-orange-500 to-pink-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    onChange={(e) => {
                      const newTime = (Number(e.currentTarget.value) / 100) * currentSong.durationSec;
                      setCurrentTime(newTime);
                    }}
                  />
                </div>
                <span>{formatDuration(currentSong.durationSec)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mb-12">
              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-all ${isShuffle
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
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-4"
              >
                <SkipBack size={20} />
              </motion.button>

              <button
                onClick={togglePlayPause}
                className="bg-linear-to-r from-orange-500 to-pink-500 text-white rounded-full p-6 shadow-lg hover:shadow-orange-500/50 transition-all relative overflow-hidden"

              >
                {isPlaying ? <Pause size={36} fill="white" /> : <Play size={36} fill="white" />}
              </button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={playNext}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-4"
              >
                <SkipForward size={24} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRepeatToggle}
                className={`p-2 rounded-full transition-all relative ${repeatMode !== 'off'
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

            {queue.length > 1 && (
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Up Next ({queue.length - 1})
                </h3>
                <div className="space-y-2">
                  {queue.slice(1, 6).map((song) => (
                    <div
                      key={song.id}
                      onClick={() => setCurrentSong(song)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 cursor-pointer transition-colors"
                    >
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">

                        <p className={`font-medium truncate ${currentSong?.id === song.id ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>
                          {song.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {song.artist.name}
                        </p>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDuration(song.durationSec)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
