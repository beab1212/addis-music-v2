'use client';
import { motion } from 'framer-motion';
import { UserCheck } from 'lucide-react';
import { Artist } from '@/types';
import { formatNumber, getLowResCloudinaryUrl } from '@/utils/helpers';
import { useRouter } from 'next/navigation';

interface ArtistCardProps {
  artist: Artist;
}

export const ArtistCard = ({ artist }: ArtistCardProps) => {
  const navigate = useRouter();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate.push(`/app/artist/${artist.id}`)}
      className="bg-white dark:bg-gray-950 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer group"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
           src={getLowResCloudinaryUrl(artist.imageUrl || 'https://res.cloudinary.com/dxcbu8zsz/image/upload/v1764662955/Music-album-cover-artwork-for-sale-2_z0nxok.jpg', { width: 1200, blur: 0 })}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {artist.verified && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1.5">
            <UserCheck size={16} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{artist.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(artist.followers)} followers</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {artist.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
