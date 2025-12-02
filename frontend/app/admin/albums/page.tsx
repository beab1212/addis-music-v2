'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Album, Search, Edit, Trash2, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { useRouter } from 'next/navigation';

export default function AlbumsManagement() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { addToast } = useToastStore();
  const router = useRouter();
  const limit = 20;

  const fetchAlbums = async () => {
    try {
      const res = await api.get(`/albums?page=${page}&limit=${limit}&q=${search}`);
      setAlbums(res.data.data.albums || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (error) {
      addToast('Failed to fetch albums', 'error');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Album size={32} className="text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Albums Management</h1>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600">
            <Plus size={20} />
            Add Album
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAlbums()}
              placeholder="Search albums..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {albums.map((album) => (
            <motion.div key={album.id} whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
              <img src={album.coverUrl} alt={album.title} className="w-full aspect-square object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{album.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{album.artist?.name}</p>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => router.push(`/app/album/${album.id}/edit`)} className="flex-1 p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                    <Edit size={18} className="mx-auto" />
                  </button>
                  <button onClick={() => handleDelete(album.id)} className="flex-1 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 size={18} className="mx-auto" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
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
