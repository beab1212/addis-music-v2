'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import { SongCard } from '@/components/SongCard';
import { ArtistCard } from '@/components/ArtistCard';
import { PlaylistCard } from '@/components/PlaylistCard';
import { AlbumCard } from '@/components/AlbumCard';
import { mockSongs, mockArtists, mockPlaylists, mockAlbums } from '@/utils/mockData';

type Tab = 'all' | 'songs' | 'artists' | 'albums' | 'playlists';

export default function Search() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const tabs: Tab[] = ['all', 'songs', 'artists', 'albums', 'playlists'];

  const filteredSongs = mockSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
  );

  const filteredArtists = mockArtists.filter((artist) =>
    artist.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAlbums = mockAlbums.filter(
    (album) =>
      album.title.toLowerCase().includes(query.toLowerCase()) ||
      album.artistName.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPlaylists = mockPlaylists.filter((playlist) =>
    playlist.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Search</h1>

        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all shadow-lg"
          />
        </div>

        <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {query === '' ? (
        <div className="text-center py-20">
          <SearchIcon size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Start searching
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Find your favorite songs, artists, albums, and playlists
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {(activeTab === 'all' || activeTab === 'songs') && filteredSongs.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Songs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredSongs.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'artists') && filteredArtists.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Artists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'albums') && filteredAlbums.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Albums</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAlbums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'playlists') && filteredPlaylists.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Playlists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredPlaylists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </div>
          )}

          {filteredSongs.length === 0 &&
            filteredArtists.length === 0 &&
            filteredAlbums.length === 0 &&
            filteredPlaylists.length === 0 && (
              <div className="text-center py-20">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Try searching for something else
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
