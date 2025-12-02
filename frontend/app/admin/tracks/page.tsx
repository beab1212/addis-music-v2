'use client';
import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Search, Edit, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { getLowResCloudinaryUrl, capitalizeFirst, formatDuration } from '@/utils/helpers';

export default function TracksManagement() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { addToast } = useToastStore();
  const limit = 20;

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tracks?page=${page}&limit=${limit}`);
      setTracks(res.data.data.tracks || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (error) {
      addToast('Failed to fetch tracks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this track?')) return;
    try {
      await api.delete(`/tracks/${id}`);
      addToast('Track deleted', 'success');
      fetchTracks();
    } catch (error) {
      addToast('Failed to delete track', 'error');
    }
  };

  const toggleExpand = (id: string) => setExpandedId((cur) => (cur === id ? null : id));

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Music size={32} className="text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Tracks Management</h1>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600">
            <Plus size={20} />
            Add Track
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTracks()}
              placeholder="Search tracks..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Album</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tracks.map((track) => (
                <Fragment key={track.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getLowResCloudinaryUrl(
                            track.coverUrl || 'https://res.cloudinary.com/dxcbu8zsz/image/upload/v1764662955/Music-album-cover-artwork-for-sale-2_z0nxok.jpg',
                            { width: 40 }
                          )}
                          alt={track.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">{track.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{capitalizeFirst(track.artist?.name) || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{capitalizeFirst(track.album?.title) || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{formatDuration(track.durationSec)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(track.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => toggleExpand(track.id)}
                          aria-expanded={expandedId === track.id}
                          className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
                        >
                          {expandedId === track.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  <AnimatePresence initial={false}>
                    {expandedId === track.id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{track.description ?? 'No description'}</p>

                              <div className="mt-3">
                                <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">Tags</h5>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {(track.tags ?? []).length === 0 ? (
                                    <span className="text-sm text-gray-500">No tags</span>
                                  ) : (
                                    (track.tags ?? []).map((t: string, idx: number) => (
                                      <span key={idx} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded-full">
                                        {t}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">Genre</h5>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{track.genre?.name ?? 'N/A'}</p>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">Release Date</h5>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {track.releaseDate ? new Date(track.releaseDate).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">Credits</h5>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{track.credit ?? 'N/A'}</p>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">File</h5>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{track.fileType ?? 'N/A'}</p>
                                </div>
                              </div>

                              <div className="mt-4">
                                <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">More Info</h5>
                                <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
                                  <li>Plays: {track.plays ?? 0}</li>
                                  <li>Likes: {track.likes ?? 0}</li>
                                  <li>Duration: {formatDuration(track.durationSec)}</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50">Previous</button>
            <button disabled={page * limit >= total} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
