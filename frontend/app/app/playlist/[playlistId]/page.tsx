'use client';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Edit, Trash2, MoreVertical, Plus } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useToastStore } from '@/store/toastStore';
import { formatDuration, getLowResCloudinaryUrl, capitalizeFirst } from '@/utils/helpers';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import PlaylistModal from '@/components/PlaylistModal';
import AddTrackModal from '@/components/AddTrackModal';

export default function PlaylistDetail() {
  const params = useParams();
  const { user } = useAuthStore();
  const id = params?.playlistId as string;
  const navigate = useRouter();
  const { setQueue, setCurrentSong } = usePlayerStore();
  const currentSong = usePlayerStore((state) => state.currentSong);
  const { addToast } = useToastStore();
  const [refresh, setRefresh] = useState(false);

  const [playlist, setPlaylist] = useState<any>(null);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [openAddTrackModal, setOpenAddTrackModal] = useState(false);


  // Modal open logic
  const openPlaylistModal = (playlistId: string) => {
    setOpenModal(true);
  };

  const openAddTrackModalHandler = () => {
    setOpenAddTrackModal(true);
  };


  // Modal save logic
  const handleSavePlaylist = async (playlistId: string) => {
    console.log("Confirmed playlist ID:", playlistId);

    setOpenModal(false);
    // addToast('Playlist ID processed successfully', 'success');
  };


  const handlePlaylistDelete = async () => {
    try {
      // ask permission before deleting
      const confirmed = window.confirm("Are you sure you want to delete this playlist?");
      if (!confirmed) return;

      await api.delete(`/playlists/${id}`);
      addToast('Playlist deleted successfully', 'success');
      navigate.push('/app/library');
    } catch (error) {
      addToast('Failed to delete playlist', 'error');
    }
  }

  const handlePlaylistItemDelete = async (trackId: string) => {
    try {
      // ask permission before deleting
      const confirmed = window.confirm("Are you sure you want to delete this track from the playlist?");
      if (!confirmed) return;

      api.delete(`/playlist-items/${playlist.id}/items/${trackId}`).then((res) => {
        addToast(res.data.message || 'Track removed from playlist successfully', 'success');
        setRefresh(!refresh);
      }).catch((err) => {
        addToast(err.response?.data?.message || 'Failed to remove track from playlist', 'error');
      });
    } catch (error) {
      addToast('Failed to remove track from playlist', 'error');
    }
  }

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await api.get(`/playlists/${id}`);
        setPlaylist(response.data.data.playlist);
      } catch (error) {
        // addToast('Failed to load playlist', 'error');
      }
    };

    fetchPlaylist();
  }, [id, refresh]);

  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Playlist not found</h2>
      </div>
    );
  }

  const handlePlay = () => {
    if (playlist.tracks.length > 0) {
      setQueue(playlist.songs);
      setCurrentSong(playlist.songs[0]);
      addToast('Playing playlist', 'success');
    }
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
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {capitalizeFirst(playlist.title)}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-4">{playlist.description}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {playlist?.tracks?.length} songs
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
            onClick={() => openAddTrackModalHandler()}
            className={`p-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${user?.id !== playlist?.userId ? 'hidden' : ''}`}
          >
            <Plus size={20} />
          </button>

          <button
            onClick={() => openPlaylistModal(playlist.id)}
            className={`p-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${user?.id !== playlist?.userId ? 'hidden' : ''}`}
          >
            <Edit size={20} />
          </button>

          <button
            onClick={handlePlaylistDelete}
            className={`p-3 rounded-full bg-white dark:bg-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${user?.id !== playlist?.userId ? 'hidden' : ''}`}
          >
            <Trash2 size={20} />
          </button>

        </div>

        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-1">#</div>
            <div className="col-span-7">Title</div>
            <div className={`col-span-2 text-right ${user?.id !== playlist?.userId ? 'col-span-1' : ''}`}>Duration</div>
            <div className={`col-span-1 text-right ${user?.id !== playlist?.userId ? 'hidden' : ''}`}>Action</div>
          </div>
          {playlist.tracks.map((song: any, index: number) => (
            <motion.div
              key={song.id}
              whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
              className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer"
              onClick={() => {
                setQueue(playlist.tracks);
                setCurrentSong(song);
              }}
            >
              <div className="col-span-1 text-gray-600 dark:text-gray-400">
                <div className='flex flex-row gap-4 items-center'>
                  {index + 1}
                  <img
                    src={getLowResCloudinaryUrl(song.coverUrl || 'https://res.cloudinary.com/dxcbu8zsz/image/upload/v1764662955/Music-album-cover-artwork-for-sale-2_z0nxok.jpg', { width: 300, height: 300 })}
                    alt={song.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                </div>
              </div>
              <div className="col-span-7">
                <p className={`font-semibold  ${currentSong?.id === song.id ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>{capitalizeFirst(song.title)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{capitalizeFirst(song.artist?.name || playlist.artist?.name || 'Unknown')}</p>
              </div>
              <div className={`col-span-2 text-right text-gray-600 dark:text-gray-400 ${user?.id !== playlist?.userId ? 'col-span-1' : ''}`}>
                {formatDuration(song.durationSec || 0)}
              </div>

              <div className={`col-span-1 text-right ${user?.id !== playlist?.userId ? 'hidden' : ''}`}>
                {/* delete button could go here */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaylistItemDelete(song.id);
                  }}
                  className={`p-3 rounded-full cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${user?.id !== playlist?.userId ? 'hidden' : ''}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <PlaylistModal
        open={openModal}
        playlistId={id}
        onClose={() => setOpenModal(false)}
        onSave={handleSavePlaylist}
      />

      <AddTrackModal
        open={openAddTrackModal}
        playlistId={id}
        onClose={() => {
          setOpenAddTrackModal(false)
          setRefresh(!refresh)
        }}
        onSave={handleSavePlaylist}
      />
    </div>
  );
};
