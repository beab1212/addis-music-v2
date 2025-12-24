'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TrendingUp, Users, Music, Album, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/lib/api';

export default function Analytics() {
  const [userGrowth, setUserGrowth] = useState<{ totalUsers: number; averageGrowth: number } | null>(null);
  const [trackGrowth, setTrackGrowth] = useState<{ totalTracks: number; averageGrowth: number } | null>(null);
  const [albumGrowth, setAlbumGrowth] = useState<{ totalAlbums: number; averageGrowth: number } | null>(null);
  const [totalPlaysGrowth, setTotalPlaysGrowth] = useState<{ totalPlays: number; averageGrowth: number } | null>(null);
  const [revenueGrowth, setRevenueGrowth] = useState<{ totalRevenue: number; averageGrowth: number } | null>(null);
  const [genreDistribution, setGenreDistribution] = useState<any[]>([]);

  const fetchAllAnalytics = async () => {
    try {
      const [
        usersRes,
        tracksRes,
        albumsRes,
        playsRes,
        revenueRes,
        genreRes,
      ] = await Promise.all([
        api.get('/admin/analytics/total-users-with-average-growth'),
        api.get('/admin/analytics/total-tracks-with-average-growth'),
        api.get('/admin/analytics/total-albums-with-average-growth'),
        api.get('/admin/analytics/total-plays-with-average-growth'),
        api.get('/admin/analytics/total-revenue-with-average-growth'),
        api.get('/admin/analytics/genre-distribution'),
      ]);

      setUserGrowth(usersRes.data.data);
      setTrackGrowth(tracksRes.data.data);
      setAlbumGrowth(albumsRes.data.data);
      setTotalPlaysGrowth(playsRes.data.data);
      setRevenueGrowth(revenueRes.data.data);
      setGenreDistribution(genreRes.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics data', error);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllAnalytics();
    }, 10000)

    return () => clearTimeout(interval);
  }, []);


  const monthlyData = [
    { month: 'Jan', users: 4000, streams: 24000, revenue: 12000 },
    { month: 'Feb', users: 3000, streams: 13980, revenue: 15000 },
    { month: 'Mar', users: 2000, streams: 98000, revenue: 18000 },
    { month: 'Apr', users: 2780, streams: 39080, revenue: 22000 },
    { month: 'May', users: 1890, streams: 48000, revenue: 25000 },
    { month: 'Jun', users: 2390, streams: 38000, revenue: 28000 },
  ];

  const COLORS = ['#f97316', '#ec4899', '#8b5cf6', '#06b6d4'];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp size={32} className="text-orange-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* total user */}
          <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4`}>
              <Users size={24} className="text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Users</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{userGrowth?.totalUsers || 0}</p>
              <span className="text-green-500 text-sm font-semibold">+{userGrowth?.averageGrowth || 0}%</span>
            </div>
          </motion.div>

          {/* total track */}
          <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mb-4`}>
              <Music size={24} className="text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Tracks</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{trackGrowth?.totalTracks || 0}</p>
              <span className="text-green-500 text-sm font-semibold">+{trackGrowth?.averageGrowth || 0}%</span>
            </div>
          </motion.div>

          {/* total track */}
          <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4`}>
              <Album size={24} className="text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Albums</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{albumGrowth?.totalAlbums || 0}</p>
              <span className="text-green-500 text-sm font-semibold">+{albumGrowth?.averageGrowth || 0}%</span>
            </div>
          </motion.div>

          {/* total revenue */}
          <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-4`}>
              <DollarSign size={24} className="text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Revenue</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{revenueGrowth?.totalRevenue || 0}</p>
              <span className="text-green-500 text-sm font-semibold">ETB {revenueGrowth?.averageGrowth || 0}</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Growth Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                <Area type="monotone" dataKey="streams" stackId="2" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Genre Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={genreDistribution} cx="50%" cy="50%" labelLine={false} label={({ genre, percentage }: any) => `${genre} ${percentage.toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="percentage">
                  {genreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
