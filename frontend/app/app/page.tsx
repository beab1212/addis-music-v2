'use client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SongCard } from '@/components/SongCard';
import { ArtistCard } from '@/components/ArtistCard';
import { PlaylistCard } from '@/components/PlaylistCard';
import { AlbumCard } from '@/components/AlbumCard';
import { mockSongs, mockArtists, mockPlaylists, mockAlbums } from '@/utils/mockData';
import { useRef, useEffect, useState, use } from 'react';
import { api } from '@/lib/api';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-300"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </div>
  );
};

export default function Home() {

  const [trendingData, setTrendingData] = useState<any>(null);
  const [featuredArtistsData, setFeaturedArtistsData] = useState<any>(null);
  const [popularPlaylistsData, setPopularPlaylistsData] = useState<any>(null);
  const [newAlbumsData, setNewAlbumsData] = useState<any>(null);
  const [recommendedForYouData, setRecommendedForYouData] = useState<any>(null);
  const [soundYouMayLikeData, setSoundYouMayLikeData] = useState<any>(null);
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/tracks');
        setTestData(response.data?.data?.tracks || []);
        console.log('Test Data:', response.data?.data?.tracks);
      } catch (error) {
        console.error('Error fetching test data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchRecommendedData = async () => {
      try {
        const response = await api.get('/personalization/for-you?page=1&limit=20');
        setRecommendedForYouData(response.data?.data?.tracks || []);
        console.log('Recommended Data:', response.data?.data);
      } catch (error) {
        console.error('Error fetching recommended data:', error);
      }
    };

    fetchRecommendedData();
  }, []);

  useEffect(() => {
    const fetchSoundsYouMayLikeData = async () => {
      try {
        const response = await api.get('/personalization/sounds-you-may-like?page=1&limit=20');
        setSoundYouMayLikeData(response.data?.data?.tracks || []);
        console.log('Sounds You May Like Data:', response.data?.data);
      } catch (error) {
        console.error('Error fetching sounds you may like data:', error);
      }
    };

    fetchSoundsYouMayLikeData();
  }, []);

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        const response = await api.get('/personalization/trending-now');
        setTrendingData(response.data?.data?.tracks || []);
        console.log('Trending Data:', response.data?.data);
      } catch (error) {
        console.error('Error fetching trending data:', error);
      }
    };

    fetchTrendingData();
  }, []);

  useEffect(() => {
    const fetchNewAlbumsData = async () => {
      try {
        const response = await api.get('/personalization/new-albums');
        setNewAlbumsData(response.data?.data?.albums || []);
        console.log('New Albums Data:', response.data?.data);
      } catch (error) {
        console.error('Error fetching new albums data:', error);
      }
    };

    fetchNewAlbumsData();
  }, []);

  useEffect(() => {
    const fetchPopularPlaylistsData = async () => {
      try {
        const response = await api.get('/personalization/popular-playlists');
        setPopularPlaylistsData(response.data?.data?.playlists || []);
        console.log('Popular Playlists Data:', response.data?.data);
      } catch (error) {
        console.error('Error fetching popular playlists data:', error);
      }
    };

    fetchPopularPlaylistsData();
  }, []);

  useEffect(() => {
    const fetchFeaturedArtistsData = async () => {
      try {
        const response = await api.get('/personalization/featured-artists');
        setFeaturedArtistsData(response.data?.data?.artists || []);
        console.log('Featured Artists Data:', response.data?.data);
      } catch (error) {
        console.error('Error fetching featured artists data:', error);
      }
    };

    fetchFeaturedArtistsData();
  }, []);


  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="relative h-80 rounded-3xl overflow-hidden bg-linear-to-br from-orange-400 via-pink-500 to-purple-600 p-8 flex items-end shadow-2xl">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 text-white">
            <h1 className="text-5xl font-bold mb-4">Discover Your Sound</h1>
            <p className="text-xl opacity-90 mb-6">Explore millions of songs from artists around the world</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-shadow"
            >
              Start Listening
            </motion.button>
          </div>
        </div>
      </motion.div>

      <Section title="Recommended for You">
        {recommendedForYouData?.map((song: any) => (
          <div key={song.id} className="flex-shrink-0 w-56">
            <SongCard song={song} />
          </div>
        ))}
      </Section>

      <Section title="Sounds You May Like">
        {soundYouMayLikeData?.map((song: any) => (
          <div key={song.id} className="flex-shrink-0 w-56">
            <SongCard song={song} />
          </div>
        ))}
      </Section>

      <Section title="Trending Now">
        {trendingData?.map((song: any) => (
          <div key={song.id} className="flex-shrink-0 w-56">
            <SongCard song={song} />
          </div>
        ))}
      </Section>
      

      <Section title="Featured Artists">
        {featuredArtistsData?.map((artist: any) => (
          <div key={artist.id} className="flex-shrink-0 w-56">
            <ArtistCard artist={artist} />
          </div>
        ))}
      </Section>

      <Section title="Popular Playlists">
        {mockPlaylists.map((playlist) => (
          <div key={playlist.id} className="flex-shrink-0 w-56">
            <PlaylistCard playlist={playlist} />
          </div>
        ))}
      </Section>

      <Section title="New Albums">
        {newAlbumsData?.map((album: any) => (
          <div key={album.id} className="flex-shrink-0 w-56">
            <AlbumCard album={album} />
          </div>
        ))}
      </Section>


      <Section title="Test Track Section">
        {testData?.map((song: any) => (
          <div key={song.id} className="flex-shrink-0 w-56">
            <SongCard song={song} />
          </div>
        ))}
      </Section>
    </div>
  );
};
