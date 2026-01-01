'use client';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { formatDuration, formatDate } from '@/utils/helpers';
import { usePlayerStore } from '@/store/playerStore';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getLowResCloudinaryUrl, capitalizeFirst } from '@/utils/helpers';


export default function AlbumDetail() {
  const router = useRouter()
  const params = useParams();
  const id = params?.albumId as string;
  const { setQueue, setCurrentSong, currentSong } = usePlayerStore();
  const [album, setAlbum] = useState<any>(null);
  const [albumTrack, setAlbumTrack] = useState<any>(null);
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

  useEffect(() => {
    const fetchAlbumTrack = async () => {
      try {
        const res = await api.get(`/albums/${id}/track`).catch(() => ({ data: { data: null } }));
        setAlbumTrack(res.data.data.tracks);
        console.log("Album Track Data: ", res.data.data.tracks);
        
      } catch (error) {
        console.error('Failed to fetch album track:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbumTrack();
  }, [id])

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

  const handlePlay = () => {
    if (albumTrack?.length > 0) {
      setQueue(albumTrack);
      setCurrentSong(albumTrack[0]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <img
            src={getLowResCloudinaryUrl(album.coverUrl || 'https://res.cloudinary.com/dxcbu8zsz/image/upload/v1764662955/Music-album-cover-artwork-for-sale-2_z0nxok.jpg', { width: 300, height: 300 })}
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
              {formatDate(album.releaseDate || new Date().toISOString())} • {albumTrack?.length} songs
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

        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="sm:col-span-1 col-span-3">#</div>
            <div className="col-span-7">Title</div>
            <div className="col-span-2 text-right">Duration</div>
          </div>
          {albumTrack.map((song: any, index: number) => (
            <motion.div
              key={song.id}
              whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
              className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer"
              onClick={() => {
                setQueue(albumTrack);
                setCurrentSong(song);
              }}
            >
              <div className="sm:col-span-1 col-span-3 text-gray-600 dark:text-gray-400">
                <div className='flex flex-row gap-4 items-center'>
                  {index + 1}
                  <img
                    src={getLowResCloudinaryUrl(song.coverUrl || 'https://res.cloudinary.com/dxcbu8zsz/image/upload/v1764662955/Music-album-cover-artwork-for-sale-2_z0nxok.jpg', { width: 300, height: 300 })}
                    alt={song.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                </div>
              </div>
              <div className="col-span-7 ">
                <p className={`font-semibold  ${currentSong?.id === song.id ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>{capitalizeFirst(song.title)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/app/artist/${song.artist?.id || ''}`)
                  }}
                >{capitalizeFirst(song.artist?.name || album.artist?.name || 'Unknown')}</p>
              </div>
              <div className="col-span-2 text-right text-gray-600 dark:text-gray-400">
                {formatDuration(song.durationSec || 0)}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
