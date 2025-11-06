'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Music, Image as ImageIcon, X } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { useRouter } from 'next/navigation';

export default function UploadSong() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    trackTitle: '',
    artistName: '',
    featuredArtists: '',
    albumTitle: '',
    genre: '',
    language: '',
    trackNumber: '',
    discNumber: '',
    releaseDate: '',
    lyrics: '',
    credits: '',
    tags: '',
  });

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile) {
      addToast('Please upload an audio file', 'error');
      return;
    }

    if (!formData.trackTitle || !formData.artistName || !formData.genre) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    addToast('Song uploaded successfully!', 'success');
    router.push('/app/library');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <Upload size={32} className="text-orange-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Upload Song</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xlx mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Audio File</h2>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
              {audioFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Music size={24} className="text-orange-500" />
                    <span className="text-gray-900 dark:text-white">{audioFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAudioFile(null)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="hidden"
                  />
                  <Music size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-900 dark:text-white font-semibold mb-2">
                    Click to upload audio file
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    MP3, WAV, FLAC (max 100MB)
                  </p>
                </label>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Track Metadata</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Track Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="trackTitle"
                  value={formData.trackTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Enter track title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Artist Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Enter artist name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Featured Artists
                </label>
                <input
                  type="text"
                  name="featuredArtists"
                  value={formData.featuredArtists}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Separate with commas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Album or Single Title
                </label>
                <input
                  type="text"
                  name="albumTitle"
                  value={formData.albumTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Enter album title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Genre <span className="text-red-500">*</span>
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                >
                  <option value="">Select genre</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Hip-hop">Hip-hop</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Classical">Classical</option>
                  <option value="R&B">R&B</option>
                  <option value="Country">Country</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="e.g., English, Spanish"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Track Number
                </label>
                <input
                  type="number"
                  name="trackNumber"
                  value={formData.trackNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Disc Number
                </label>
                <input
                  type="number"
                  name="discNumber"
                  value={formData.discNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Release Metadata</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Artwork
              </label>
              <div className="flex gap-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center flex-shrink-0">
                  {coverPreview ? (
                    <div className="relative">
                      <img src={coverPreview} alt="Cover" className="w-48 h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview('');
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block w-48">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                      <ImageIcon size={48} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        JPG or PNG<br/>(min 3000x3000px)
                      </p>
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Upload high-quality artwork for your release
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                    <li>Minimum resolution: 3000x3000 pixels</li>
                    <li>Square aspect ratio (1:1)</li>
                    <li>JPG or PNG format</li>
                    <li>No text or logos outside the artwork</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Release Date
                </label>
                <input
                  type="date"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (Mood/Subgenre)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="e.g., upbeat, chill, energetic"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Optional Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lyrics
                </label>
                <textarea
                  name="lyrics"
                  value={formData.lyrics}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Enter song lyrics (plain text or synchronized)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Credits
                </label>
                <textarea
                  name="credits"
                  value={formData.credits}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Producer, mixer, engineer credits, etc."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-orange-600 transition-colors"
            >
              Upload Song
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => router.push('/app/library')}
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