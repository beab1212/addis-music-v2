'use client';
import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Album, Search, Edit, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { useRouter } from 'next/navigation';
import { getLowResCloudinaryUrl, capitalizeFirst } from '@/utils/helpers';

export default function AlbumsManagement() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { addToast } = useToastStore();
  const router = useRouter();
  const limit = 20;

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/albums?page=${page}&limit=${limit}&q=${encodeURIComponent(search)}`);
      setAlbums(res.data.data.albums || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (error) {
      addToast('Failed to fetch albums', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this album?')) return;
    try {
      await api.delete(`/albums/${id}`);
      addToast('Album deleted', 'success');
      fetchAlbums();
    } catch (error) {
      addToast('Failed to delete album', 'error');
    }
  };

  const toggleExpand = (id: string) => setExpandedId((cur) => (cur === id ? null : id));

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Album size={32} className="text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Albums Management</h1>
          </div>
          <button
            onClick={() => router.push('/app/admin/albums/create')}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600"
          >
            <Plus size={20} />
            Add Album
          </button>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAlbums()}
              placeholder="Search albums..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cover / Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tracks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Released</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {albums.map((album) => (
                <Fragment key={album.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getLowResCloudinaryUrl(
                            album.coverUrl || 'https://res.cloudinary.com/dxcbu8zsz/image/upload/v1764662955/Music-album-cover-artwork-for-sale-2_z0nxok.jpg',
                            { width: 56, height: 56 }
                          )}
                          alt={album.title}
                          className="w-14 h-14 rounded object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{album.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{album.label ?? ''}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{capitalizeFirst(album.artist?.name) || 'N/A'}</td>

                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{(album.tracksCount ?? album.tracks?.length) ?? 'N/A'}</td>

                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/app/admin/albums/${album.id}/edit`)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(album.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => toggleExpand(album.id)}
                          aria-expanded={expandedId === album.id}
                          className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
                        >
                          {expandedId === album.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  <AnimatePresence initial={false}>
                    {expandedId === album.id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-4">
                              <img
                                src={getLowResCloudinaryUrl(
                                  album.coverUrl || 'https://res.cloudinary.com/dxcbu8zsz/image/upload/v1764662955/Music-album-cover-artwork-for-sale-2_z0nxok.jpg',
                                  { width: 112, height: 112 }
                                )}
                                alt={album.title}
                                className="w-28 h-28 rounded object-cover"
                              />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{album.title}</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{album.description ?? 'No description'}</p>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">Details</h5>
                              <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
                                <li>Artist: {album.artist?.name ?? 'N/A'}</li>
                                <li>Label: {album.label ?? 'N/A'}</li>
                                <li>Genre: {album.genre?.name ?? 'N/A'}</li>
                                <li>Release Date: {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : 'N/A'}</li>
                                <li>Tracks: {(album.tracks ?? []).length}</li>
                              </ul>
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
