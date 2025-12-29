'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

import { SongCard } from '@/components/SongCard';
import { ArtistCard } from '@/components/ArtistCard';
import { PlaylistCard } from '@/components/PlaylistCard';
import { AlbumCard } from '@/components/AlbumCard';
import { Section } from '@/components/Section';

interface HomeData {
  recommended: any[];
  sounds: any[];
  trending: any[];
  artists: any[];
  playlists: any[];
  albums: any[];
  test: any[];
}

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          recommended,
          sounds,
          trending,
          albums,
          playlists,
          artists,
          test,
        ] = await Promise.all([
          api.get('/personalization/for-you?page=1&limit=20'),
          api.get('/personalization/sounds-you-may-like?page=1&limit=20'),
          api.get('/personalization/trending-now'),
          api.get('/personalization/new-albums'),
          api.get('/personalization/popular-playlists'),
          api.get('/personalization/featured-artists'),
          api.get('/personalization/tracks-from-artist-you-follow'),
        ]);

        setData({
          recommended: recommended.data?.data?.tracks ?? [],
          sounds: sounds.data?.data?.tracks ?? [],
          trending: trending.data?.data?.tracks ?? [],
          albums: albums.data?.data?.albums ?? [],
          playlists: playlists.data?.data?.playlists ?? [],
          artists: artists.data?.data?.artists ?? [],
          test: test.data?.data?.tracks ?? [],
        });
      } catch (err) {
        console.error('Home fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading…</div>;
  }

  if (!data) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="relative h-80 rounded-3xl overflow-hidden bg-linear-to-br from-orange-400 via-pink-500 to-purple-600 p-8 flex items-end shadow-2xl">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 text-white">
            <h1 className="text-5xl font-bold mb-4">Discover Your Sound</h1>
            <p className="text-xl opacity-90 mb-6">
              Explore millions of songs from artists around the world
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold shadow-xl"
            >
              Start Listening
            </motion.button>
          </div>
        </div>
      </motion.div>

      <Section title="Recommended for You">
        {data.recommended.map((s) => (
          <div key={s.id} className="w-56 shrink-0">
            <SongCard song={s} />
          </div>
        ))}
      </Section>

      <Section title="Sounds You May Like">
        {data.sounds.map((s) => (
          <div key={s.id} className="w-56 shrink-0">
            <SongCard song={s} />
          </div>
        ))}
      </Section>

      <Section title="Trending Now">
        {data.trending.map((s) => (
          <div key={s.id} className="w-56 shrink-0">
            <SongCard song={s} />
          </div>
        ))}
      </Section>

      <Section title="Featured Artists">
        {data.artists.map((a) => (
          <div key={a.id} className="w-56 shrink-0">
            <ArtistCard artist={a} />
          </div>
        ))}
      </Section>

      <Section title="Popular Playlists">
        {data.playlists.map((p) => (
          <div key={p.id} className="w-56 shrink-0">
            <PlaylistCard playlist={p} />
          </div>
        ))}
      </Section>

      <Section title="New Albums">
        {data.albums.map((a) => (
          <div key={a.id} className="w-56 shrink-0">
            <AlbumCard album={a} />
          </div>
        ))}
      </Section>

      <Section title="From Artists you Follow">
        {data.test.map((s) => (
          <div key={s.id} className="w-56 shrink-0">
            <SongCard song={s} />
          </div>
        ))}
      </Section>
    </div>
  );
}
