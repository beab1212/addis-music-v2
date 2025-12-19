'use client';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserCheck, Play } from 'lucide-react';
import { formatNumber } from '@/utils/helpers';
import { SongCard } from '@/components/SongCard';
import { AlbumCard } from '@/components/AlbumCard';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getLowResCloudinaryUrl, capitalizeFirst } from '@/utils/helpers';

export default function GenreDetail() {
  const params = useParams();
  const id = params?.genreId as string;

  const [genreInfo, setGenreInfo] = useState<any>(null);
  const [genreTracks, setGenreTracks] = useState<any[]>([]);
  const [genreTopTracks, setGenreTopTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchGenreData = async () => {
      setLoading(true);
      try {
        const genreInfoResponse = await api.get(`/genre-tracks/${id}/info`);
        setGenreInfo(genreInfoResponse.data.data.genre);

        const genreTracksResponse = await api.get(`/genre-tracks/${id}/top-tracks`, { params: { page: 1, limit: 6 } });
        setGenreTopTracks(genreTracksResponse.data.data.tracks);

        const genreAllTracksResponse = await api.get(`/genre-tracks/${id}/tracks`, { params: { page: 1, limit: 20 } });
        setGenreTracks(genreAllTracksResponse.data.data.tracks);
      } catch (error) {
        console.error('Error fetching genre data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenreData();
  }, [id]);



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!genreInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Genre not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative h-96 rounded-3xl overflow-hidden mb-8">
          <img
            src={getLowResCloudinaryUrl(genreInfo.coverUrl || 'https://res.cloudinary.com/dxcbu8zsz/image/upload/v1764662955/Music-album-cover-artwork-for-sale-2_z0nxok.jpg', { width: 1200, blur: 0 })}
            alt={genreInfo.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-6xl font-bold text-white mb-4">{capitalizeFirst(genreInfo.name)}</h1>
            <p className="text-xl text-white/90">{formatNumber(genreInfo.totalTracks || 0)} tracks</p>
          </div>
        </div>


        <div className="mb-12 pt-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Popular Songs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {genreTopTracks?.map((track) => (
              <SongCard key={track.id} song={track} />
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">All Songs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {genreTracks?.map((track) => (
              <SongCard key={track.id} song={track} />
            ))}
          </div>
        </div>

        
      </motion.div>
    </div>
  );
};
