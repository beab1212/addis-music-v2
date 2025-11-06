'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, X, Image as ImageIcon } from 'lucide-react';
import { usePlaylistStore } from '@/store/playlistStore';
import { useToastStore } from '@/store/toastStore';

export default function EditPlaylist() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params?.playlistId as string;
  const { getPlaylistById, updatePlaylist } = usePlaylistStore();
  const { addToast } = useToastStore();

  const playlist = getPlaylistById(playlistId);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
  });

  const [coverPreview, setCoverPreview] = useState<string>('');

  useEffect(() => {
    if (playlist) {
      setFormData({
        name: playlist.name,
        description: playlist.description,
        isPublic: playlist.isPublic,
      });
      setCoverPreview(playlist.coverUrl);
    }
  }, [playlist]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast('Please enter a playlist name', 'error');
      return;
    }

    updatePlaylist(playlistId, {
      name: formData.name,
      description: formData.description,
      isPublic: formData.isPublic,
      coverUrl: coverPreview,
    });

    addToast('Playlist updated successfully!', 'success');
    router.push(`/app/playlist/${playlistId}`);
  };

  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Playlist not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Edit Playlist</h1>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Image
              </label>
              <div className="flex gap-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center flex-shrink-0">
                  {coverPreview ? (
                    <div className="relative">
                      <img src={coverPreview} alt="Cover" className="w-48 h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setCoverPreview('')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block w-48">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                      <ImageIcon size={48} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload
                      </p>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Playlist Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Enter playlist name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Describe your playlist"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isPublic"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-500 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Make this playlist public
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-orange-600 transition-colors"
            >
              <Save size={20} />
              Save Changes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => router.push(`/app/playlist/${playlistId}`)}
              className="px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
