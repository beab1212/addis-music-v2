'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import { SongCard } from '@/components/SongCard';
import { ArtistCard } from '@/components/ArtistCard';
import { PlaylistCard } from '@/components/PlaylistCard';
import { AlbumCard } from '@/components/AlbumCard';
import { mockSongs, mockArtists, mockPlaylists, mockAlbums } from '@/utils/mockData';
import { api } from '@/lib/api';
type Tab = 'all' | 'songs' | 'artists' | 'albums' | 'playlists';

export default function Search() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [tracks, setTracks] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);

  const fetchData = async (query: string) => {
    try {
      if (query.trim() == '') {
        return
      }

      if (activeTab == 'all' || activeTab == 'songs') {
        const response = await api.get(`/tracks/semantic-search?q=${query.trim()}`);
        setTracks(response.data.data.tracks || []);
      }
      if (activeTab == 'all' || activeTab == 'artists') {
        const response = await api.get(`/artists/semantic-search?q=${query.trim()}`);
        setArtists(response.data.data.artists || []);
      }
      if (activeTab == 'all' || activeTab == 'albums') {
        const response = await api.get(`/albums/semantic-search?q=${query.trim()}`);
        setAlbums(response.data.data.albums || []);
      }
      if (activeTab == 'all' || activeTab == 'playlists') {
        const response = await api.get(`/playlists/semantic-search?q=${query.trim()}`);
        setPlaylists(response.data.data.playlists || []);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  }


  const tabs: Tab[] = ['all', 'songs', 'artists', 'albums', 'playlists'];

  useEffect(() => {
      // Delay setting the debouncedQuery state
      const timer = setTimeout(() => {
        fetchData(search);
      }, 500); // 500ms debounce delay
  
      // Clean up the previous timer on each render
      return () => clearTimeout(timer);
    }, [search]);

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

      {search === '' ? (
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
          {(activeTab === 'all' || activeTab === 'songs') && tracks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Songs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {tracks?.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'artists') && artists.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Artists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {artists?.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'albums') && albums.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Albums</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {albums?.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'playlists') && playlists.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Playlists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {playlists?.map((playlist: any) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </div>
          )}

          {tracks.length === 0 &&
            artists.length === 0 &&
            albums.length === 0 &&
            playlists.length === 0 && (
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
