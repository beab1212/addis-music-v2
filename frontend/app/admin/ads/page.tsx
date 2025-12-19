'use client';
import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Search, Edit, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { capitalizeFirst, formatDuration } from '@/utils/helpers';
import AdModal from '@/components/admin/modal/AdModal';

export default function AdvertisementManagement() {
  const [ads, setAds] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  const { addToast } = useToastStore();
  const limit = 20;

  // Modal save logic
  const handleSaveAd = async (adId: string) => {
    console.log("Confirmed ad ID:", adId);

    // You can add API integration here later

    setOpenModal(false);
    addToast('Ad ID processed successfully', 'success');
  };

  // Modal open logic
  const openAdModal = (adId: string) => {
    setSelectedAdId(adId);
    setOpenModal(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAds(search);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [search]);

  const fetchAds = async (searchQuery: string | null = null) => {
    setLoading(true);
    try {
      let res = null;
      if (searchQuery !== null && searchQuery.trim() !== '') {
        res = await api.get(`/ads/search?q=${searchQuery.trim()}&page=${page}&limit=${limit}`);
      } else {
        res = await api.get(`/ads?page=${page}&limit=${limit}`);
        console.log('Fetched Data: ', res.data.data.advertisements);
      }
      setAds(res.data.data.advertisements || []);
      setTotal(res.data?.pagination?.totalPages || 0);
    } catch (error) {
      addToast('Failed to fetch ads', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad?')) return;
    try {
      await api.delete(`/ads/${id}`);
      addToast('Ad deleted', 'success');
      fetchAds();
    } catch (error) {
      addToast('Failed to delete ad', 'error');
    }
  };

  const toggleExpand = (id: string) => setExpandedId((cur) => (cur === id ? null : id));

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Music size={32} className="text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Ads Management</h1>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600"
            onClick={() => openAdModal("new")}
          >
            <Plus size={20} />
            Add Advertisement
          </button>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAds()}
              placeholder="Search ads..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Advertiser</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {ads.map((ad) => (
                <Fragment key={ad.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 dark:text-white">{ad.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{capitalizeFirst(ad.advertiser)}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{new Date(ad.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{new Date(ad.endDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          onClick={() => openAdModal(ad.id)}
                        >
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(ad.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => toggleExpand(ad.id)}
                          aria-expanded={expandedId === ad.id}
                          className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
                        >
                          {expandedId === ad.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  <AnimatePresence initial={false}>
                    {expandedId === ad.id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">More Info</h4>
                              <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
                                <li>Advertiser: {ad.advertiser}</li>
                                <li>Start Date: {new Date(ad.startDate).toLocaleDateString()}</li>
                                <li>End Date: {new Date(ad.endDate).toLocaleDateString()}</li>
                                <li>Product/Service Link: <a href={ad.targetUrl || ""} className='text-blue-500'>{ad.targetUrl || ""}</a></li>
                                <li>Product/Service Video Link: <a href={ad.videoUrl || ""} className='text-blue-500'>{ad.videoUrl || ""}</a></li>
                                <li>Budget: {ad.budget}</li>
                                <li>Status: {ad.active ? 'Active' : 'Inactive'}</li>
                                
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
            Showing {page} of {total}
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50">Previous</button>
            <button disabled={page == Math.min(page * limit, total)} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50">Next</button>
          </div>
        </div>
      </motion.div>

      {/* Always render TrackModal */}
      <AdModal
        open={openModal}
        adId={selectedAdId ?? ''}
        onClose={() => setOpenModal(false)}
        onSave={handleSaveAd}
      />
    </div>
  );
}
