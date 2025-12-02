'use client';
import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Tag, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { getLowResCloudinaryUrl } from '@/utils/helpers';

export default function GenresManagement() {
  const [genres, setGenres] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const { addToast } = useToastStore();
  const limit = 20;

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const q = encodeURIComponent(search || '');
      const res = await api.get(`/genres?page=${page}&limit=${limit}&q=${q}`);
      setGenres(res.data.data.genres || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      addToast('Failed to load genres', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (g: any) => { setEditing(g); setModalOpen(true); };

  const handleSave = async (data: any) => {
    try {
      if (editing?.id) {
        await api.put(`/genres/${editing.id}`, data);
        addToast('Genre updated', 'success');
      } else {
        await api.post('/genres', data);
        addToast('Genre created', 'success');
      }
      setModalOpen(false);
      fetchGenres();
    } catch (err) {
      addToast('Save failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this genre?')) return;
    try {
      await api.delete(`/genres/${id}`);
      addToast('Genre deleted', 'success');
      fetchGenres();
    } catch (err) {
      addToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Tag size={28} className="text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Genres</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md">
              <Plus size={16} /> Add Genre
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              className="w-full pl-11 pr-4 py-2 rounded-md border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 outline-none"
              placeholder="Search genres..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchGenres()}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-center text-xs text-gray-500 uppercase w-40">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {genres.map((g) => (
                <Fragment key={g.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{g.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{g.description?.slice(0, 80) ?? ''}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(g)} className="p-2 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(g.id)} className="p-2 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 size={16} />
                        </button>
                        <button onClick={() => window.open(`/app/genres/${g.slug}`, '_blank')} className="p-2 text-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50">Previous</button>
            <button disabled={page * limit >= total} onClick={() => setPage(page + 1)} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}