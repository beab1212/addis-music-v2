'use client';
import { motion } from 'framer-motion';
import { Play, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getLowResCloudinaryUrl, capitalizeFirst } from '@/utils/helpers';

export default function Genre() {
  const [genres, setGenres] = useState([]);
  const navigate = useRouter();


  useEffect(() => {
    // Fetch genres from API or use mock data
    const fetchGenres = async () => {
      try {
        const response = await api.get('/genre-tracks');
        setGenres(response.data.data.genres);
        console.log('Fetched genres:', response.data.data.genres);
      } catch (error) {
        console.error('Error fetching liked songs:', error);
      }
    };

    fetchGenres();
  }, [])


  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-linear-to-br from-pink-500 to-orange-500 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-end gap-6">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Play size={64} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-white/90 mb-2">{"-"}</p>
              <h1 className="text-5xl font-bold text-white mb-4">Explore Genres</h1>
              <p className="text-white/90">{"-"}</p>
            </div>
          </div>
        </div>

        {genres.length > 0 ? (
          <>
            <div className="mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-orange-500 text-white rounded-full p-4 shadow-xl hover:bg-orange-600 transition-colors"
              >
              </motion.button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {genres?.map((genre: any) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate.push(`/app/genre/${genre.id}`)}
                  className="bg-white dark:bg-gray-950 border-gray-500 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer group"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={getLowResCloudinaryUrl(genre.coverUrl || 'https://res.cloudinary.com/dxcbu8zsz/image/upload/v1764662955/Music-album-cover-artwork-for-sale-2_z0nxok.jpg', { width: 300, height: 300 })}
                      alt={genre.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{capitalizeFirst(genre?.name)}</h3>
                    <div className="flex items-center justify-between mt-2">
                      {/* <span className="text-xs text-gray-500 dark:text-gray-500">{formatNumber(song.plays)} plays</span> */}
                      <span className="text-xs text-gray-500 dark:text-gray-500">{genre.trackCount} tracks</span>

                      <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            {/* <Heart size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" /> */}
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No genres yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Genre will be added soon explore.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
