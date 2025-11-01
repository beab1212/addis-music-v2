'use client';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Edit, Trash2, MoreVertical } from 'lucide-react';
import { usePlaylistStore } from '@/store/playlistStore';
import { usePlayerStore } from '@/store/playerStore';
import { useToastStore } from '@/store/toastStore';
import { formatDuration } from '@/utils/helpers';

export default function PlaylistDetail() {
  const params = useParams();
  const id = params?.playlistId as string;
  const navigate = useRouter();
  const { getPlaylistById, removeSongFromPlaylist, deletePlaylist } = usePlaylistStore();
  const { setQueue, setCurrentSong } = usePlayerStore();
  const { addToast } = useToastStore();

  const playlist = getPlaylistById(id as string);

  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Playlist not found</h2>
      </div>
    );
  }

  const handlePlay = () => {
    if (playlist.songs.length > 0) {
      setQueue(playlist.songs);
      setCurrentSong(playlist.songs[0]);
      addToast('Playing playlist', 'success');
    }
  };

  const handleDelete = () => {
    deletePlaylist(playlist.id);
    addToast('Playlist deleted', 'success');
    navigate.push('/library');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className="w-64 h-64 rounded-2xl shadow-2xl object-cover"
          />
          <div className="flex flex-col justify-end">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">PLAYLIST</p>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {playlist.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{playlist.description}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {playlist.songs.length} songs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlay}
            className="bg-orange-500 text-white rounded-full p-4 shadow-xl hover:bg-orange-600 transition-colors"
          >
            <Play size={24} fill="white" />
          </motion.button>
          <button
            onClick={() => navigate.push(`/playlist/${playlist.id}/edit`)}
            className="p-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="p-3 rounded-full bg-white dark:bg-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Title</div>
            <div className="col-span-3">Album</div>
            <div className="col-span-2 text-right">Duration</div>
          </div>
          {playlist.songs.map((song, index) => (
            <motion.div
              key={song.id}
              whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
              className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer group"
              onClick={() => {
                setQueue(playlist.songs);
                setCurrentSong(song);
              }}
            >
              <div className="col-span-1 text-gray-600 dark:text-gray-400">{index + 1}</div>
              <div className="col-span-6 flex items-center gap-3">
                <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded object-cover" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{song.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{song.artist}</p>
                </div>
              </div>
              <div className="col-span-3 flex items-center text-gray-600 dark:text-gray-400">
                {song.album}
              </div>
              <div className="col-span-2 flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">{formatDuration(song.duration)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSongFromPlaylist(playlist.id, song.id);
                    addToast('Song removed from playlist', 'success');
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
