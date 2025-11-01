'use client';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserCheck, Play } from 'lucide-react';
import { mockArtists, mockAlbums, mockSongs } from '@/utils/mockData';
import { formatNumber } from '@/utils/helpers';
import { SongCard } from '@/components/SongCard';
import { AlbumCard } from '@/components/AlbumCard';
import { useState } from 'react';

export default function ArtistDetail() {
  const params = useParams();
  const id = params?.artistId as string;
  const [isFollowing, setIsFollowing] = useState(false);

  const artist = mockArtists.find((a) => a.id === id);
  const artistAlbums = mockAlbums.filter((album) => album.artistId === id);
  const artistSongs = mockSongs.filter((song) => song.artistId === id);

  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Artist not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative h-96 rounded-3xl overflow-hidden mb-8">
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-2 mb-4">
              {artist.verified && (
                <div className="bg-blue-500 text-white rounded-full p-1.5">
                  <UserCheck size={20} />
                </div>
              )}
              <span className="text-white font-semibold">Verified Artist</span>
            </div>
            <h1 className="text-6xl font-bold text-white mb-4">{artist.name}</h1>
            <p className="text-xl text-white/90">{formatNumber(artist.followers)} followers</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-orange-500 text-white rounded-full p-4 shadow-xl hover:bg-orange-600 transition-colors"
          >
            <Play size={24} fill="white" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-8 py-3 rounded-full font-semibold transition-colors ${
              isFollowing
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </motion.button>
        </div>

        <div className="mb-8">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{artist.bio}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {artist.genres.map((genre) => (
              <span
                key={genre}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Popular Songs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {artistSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {artistAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
