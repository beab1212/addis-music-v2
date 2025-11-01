'use client';
import { motion } from 'framer-motion';
import { Users, Music, Album, TrendingUp, BarChart3 } from 'lucide-react';
import { mockSongs, mockArtists, mockAlbums, mockUser } from '@/utils/mockData';
import { formatNumber } from '@/utils/helpers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function Admin() {
  const monthlyData = [
    { month: 'Jan', users: 4000, streams: 24000 },
    { month: 'Feb', users: 3000, streams: 13980 },
    { month: 'Mar', users: 2000, streams: 98000 },
    { month: 'Apr', users: 2780, streams: 39080 },
    { month: 'May', users: 1890, streams: 48000 },
    { month: 'Jun', users: 2390, streams: 38000 },
  ];

  const genreData = [
    { name: 'Pop', value: 400 },
    { name: 'Rock', value: 300 },
    { name: 'Electronic', value: 300 },
    { name: 'Hip-hop', value: 200 },
  ];

  const COLORS = ['#f97316', '#ec4899', '#8b5cf6', '#06b6d4'];

  const stats = [
    {
      label: 'Total Users',
      value: '125,430',
      change: '+12.5%',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Songs',
      value: formatNumber(mockSongs.length * 1000),
      change: '+5.2%',
      icon: Music,
      color: 'from-orange-500 to-pink-500',
    },
    {
      label: 'Total Albums',
      value: formatNumber(mockAlbums.length * 100),
      change: '+8.1%',
      icon: Album,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Monthly Streams',
      value: '52.4M',
      change: '+18.3%',
      icon: TrendingUp,
      color: 'from-green-500 to-teal-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 size={32} className="text-orange-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <span className="text-green-500 text-sm font-semibold">{stat.change}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              User Growth & Streamssd
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="streams"
                  stackId="2"
                  stroke="#ec4899"
                  fill="#ec4899"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Genre Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Top Artists</h2>
            <div className="space-y-4">
              {mockArtists.slice(0, 5).map((artist, index) => (
                <div key={artist.id} className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400 w-8">{index + 1}</span>
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{artist.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatNumber(artist.followers)} followers
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Top Songs</h2>
            <div className="space-y-4">
              {mockSongs.slice(0, 5).map((song, index) => (
                <div key={song.id} className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400 w-8">{index + 1}</span>
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{song.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{song.artist}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatNumber(song.plays)} plays
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
