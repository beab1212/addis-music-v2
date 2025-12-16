'use client';
import { motion } from 'framer-motion';
import { Library as LibraryIcon, PlusCircle } from 'lucide-react';
import { PlaylistCard } from '@/components/PlaylistCard';
import { useToastStore } from '@/store/toastStore';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import PlaylistModal from '@/components/PlaylistModal';

export default function Library() {
  const { addToast } = useToastStore();

  const [playlistId, setPlaylistId] = useState<string>("");
  const [playlistData, setPlaylistData] = useState([]);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Modal open logic
  const openPlaylistModal = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setOpenModal(true);
  };

  // Modal save logic
  const handleSavePlaylist = async (playlistId: string) => {
    console.log("Confirmed playlist ID:", playlistId);

    // You can add API integration here later

    setOpenModal(false);
    // addToast('Playlist ID processed successfully', 'success');
  };

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await api.get('/playlists/user');
        setPlaylistData(response.data.data.playlists);
        console.log("Fetched playlists:", response.data.data.playlists);
      } catch (error) {
        // addToast('Failed to load playlists', 'error');
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LibraryIcon size={32} className="text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Your Library</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openPlaylistModal("new")}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600 transition-colors"
          >
            <PlusCircle size={20} />
            Create Playlist
          </motion.button>
        </div>

        {playlistData.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {playlistData.map((playlist: any) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <LibraryIcon size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No playlists yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first playlist to start organizing your music
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openPlaylistModal("new")}
              className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600 transition-colors"
            >
              Create Your First Playlist
            </motion.button>
          </div>
        )}
      </motion.div>

      <PlaylistModal
        open={openModal}
        playlistId={playlistId}
        onClose={() => setOpenModal(false)}
        onSave={handleSavePlaylist}
      />
    </div>
  );
};
