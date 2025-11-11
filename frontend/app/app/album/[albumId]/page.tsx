'use client';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { formatDuration, formatDate } from '@/utils/helpers';
import { usePlayerStore } from '@/store/playerStore';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getLowResCloudinaryUrl } from '@/utils/helpers';


export default function AlbumDetail() {
  const router = useRouter()
  const params = useParams();
  const id = params?.albumId as string;
  const { setQueue, setCurrentSong } = usePlayerStore();
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await api.get(`/albums/${id}`).catch(() => ({ data: { data: null } }));
        setAlbum(res.data.data.album);
        console.log("Album Data: ", res.data.data.album);
        
      } catch (error) {
        console.error('Failed to fetch album:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Album not found</h2>
      </div>
    );
  }

  const songs = album.tracks || album.songs || [];

  const handlePlay = () => {
    if (songs.length > 0) {
      setQueue(songs);
      setCurrentSong(songs[0]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <img
            src={getLowResCloudinaryUrl(album.coverUrl, { width: 300, blur: 0 }) || 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=800'}
            alt={album.title}
            className="w-64 h-64 rounded-2xl shadow-2xl object-cover"
          />
          <div className="flex flex-col justify-end">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ALBUM</p>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {album.title}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">{album.artist?.name || 'Unknown'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(album.releaseDate || new Date().toISOString())} • {songs.length} songs
            </p>
          </div>
        </div>

        <div className="mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlay}
            className="bg-orange-500 text-white rounded-full p-4 shadow-xl hover:bg-orange-600 transition-colors"
          >
            <Play size={24} fill="white" />
          </motion.button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-1">#</div>
            <div className="col-span-9">Title</div>
            <div className="col-span-2 text-right">Duration</div>
          </div>
          {songs.map((song: any, index: number) => (
            <motion.div
              key={song.id}
              whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
              className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer"
              onClick={() => {
                setQueue(songs);
                setCurrentSong(song);
              }}
            >
              <div className="col-span-1 text-gray-600 dark:text-gray-400">{index + 1}</div>
              <div className="col-span-9">
                <p className="font-semibold text-gray-900 dark:text-white">{song.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{song.artist || album.artistName || 'Unknown'}</p>
              </div>
              <div className="col-span-2 text-right text-gray-600 dark:text-gray-400">
                {formatDuration(song.duration || 0)}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
