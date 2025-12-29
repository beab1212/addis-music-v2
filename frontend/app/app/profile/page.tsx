'use client';
import { motion } from 'framer-motion';
import { Edit, LogOut, Crown, RefreshCcw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { PlaylistCard } from '@/components/PlaylistCard';
import { mockSongs } from '@/utils/mockData';
import { SongCard } from '@/components/SongCard';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import FollowModal from '@/components/FollowModal';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useRouter();
  const { addToast } = useToastStore();
  const [refresh, setRefresh] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    country: '',
    bio: '',
  });

  // Modal state
  const [openFollowModal, setOpenFollowModal] = useState(false);

  const [likedSongs, setLikedSongs] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [followedArtistsCount, setFollowedArtistsCount] = useState(0);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/user/profile', formData);
      // Optionally, you can refresh user data here
      setEditMode(false);
      addToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Failed to update profile', 'error');
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }
    try {
      await api.post('/subscriptions/cancel-subscription');
      addToast('Subscription canceled successfully', 'success');
      // Optionally, refresh current window to reflect changes
      navigate.refresh();
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Failed to cancel subscription', 'error');
    }
  };

  useEffect(() => {
    // Fetch liked songs from API or use mock data
    const fetchLikedSongs = async () => {
      try {
        const response = await api.get('/track-likes/liked-tracks');
        const playlistsResponse = await api.get('/playlists/user');
        const userResponse = await api.get('/user/me');
        const followCountResponse = await api.get('/artist-follows/follow-count');

        setFollowedArtistsCount(followCountResponse.data.data.totalFollows);
        setUserPlaylists(playlistsResponse.data.data.playlists);
        setLikedSongs(response.data.data.tracks);
        setUserInfo(userResponse.data.data);

        if (userResponse.data.data.userProfile) {
          setFormData({
            firstName: userResponse.data.data.userProfile.firstName || '',
            lastName: userResponse.data.data.userProfile.lastName || '',
            displayName: userResponse.data.data.userProfile.displayName || '',
            country: userResponse.data.data.userProfile.country || '',
            bio: userResponse.data.data.userProfile.bio || '',
          });
        }

      } catch (error) {
        console.error('Error fetching liked songs:', error);
      }
    };

    fetchLikedSongs();
  }, [refresh]);




  const handleLogout = () => {
    logout();
    navigate.push('/');
  };

  useEffect(() => {
    console.log("User: ", user);
  }, [user])

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-linear-to-br from-orange-400 to-pink-500 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <img
              src={user?.image || 'https://img.freepik.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_hybrid&w=740&q=80'}
              alt={user?.username}
              className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
            />
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-4xl font-bold text-white">{userInfo?.userProfile?.firstName} {userInfo?.userProfile?.lastName}</h1>
                {user?.isPremium && (
                  <div className="bg-yellow-400 text-gray-900 rounded-full p-1.5">
                    <Crown size={20} />
                  </div>
                )}
              </div>
              <p className="text-white/90 mb-4">{user?.email}</p>
              <p className="text-white/80">{user?.bio}</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(!editMode)}
                className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <Edit size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <LogOut size={20} />
              </motion.button>
            </div>
          </div>
        </div>

        <div className={`${editMode ? 'block' : 'hidden'} mb-12`}>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-8">
            Account Information
          </h2>

          <div className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8" onSubmit={handleSubmit}>

              {/* Input */}
              <div className="relative">
                <input
                  type="text"
                  name='firstName'
                  defaultValue={formData.firstName || ''}
                  onChange={changeHandler}
                  placeholder=" "
                  className="peer w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 pt-6 pb-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-0 outline-none transition"
                />
                <label className="pointer-events-none absolute left-4 top-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
            peer-placeholder-shown:text-gray-400
            peer-focus:top-2 peer-focus:text-sm peer-focus:text-orange-500">
                  First Name
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name='lastName'
                  defaultValue={formData.lastName || ''}
                  onChange={changeHandler}
                  placeholder=" "
                  className="peer w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 pt-6 pb-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-0 outline-none transition"
                />
                <label className="pointer-events-none absolute left-4 top-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
            peer-placeholder-shown:text-gray-400
            peer-focus:top-2 peer-focus:text-sm peer-focus:text-orange-500">
                  Last Name
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name='displayName'
                  defaultValue={formData.displayName || ''}
                  onChange={changeHandler}
                  placeholder=" "
                  className="peer w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 pt-6 pb-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-0 outline-none transition"
                />
                <label className="pointer-events-none absolute left-4 top-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
            peer-placeholder-shown:text-gray-400
            peer-focus:top-2 peer-focus:text-sm peer-focus:text-orange-500">
                  Display Name
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name='country'
                  defaultValue={formData.country || ''}
                  onChange={changeHandler}
                  placeholder=" "
                  className="peer w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 pt-6 pb-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-0 outline-none transition"
                />
                <label className="pointer-events-none absolute left-4 top-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
            peer-placeholder-shown:text-gray-400
            peer-focus:top-2 peer-focus:text-sm peer-focus:text-orange-500">
                  Country
                </label>
              </div>



              {/* Bio */}
              <div className="md:col-span-2 relative">
                <textarea
                  defaultValue={user?.bio || ''}
                  placeholder=" "
                  rows={5}
                  className="peer w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 pt-6 pb-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-0 outline-none transition resize-none"
                />
                <label className="pointer-events-none absolute left-4 top-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
          peer-placeholder-shown:text-gray-400
          peer-focus:top-2 peer-focus:text-sm peer-focus:text-orange-500">
                  Bio
                </label>
              </div>

              {/* Actions */}
              <div className="md:col-span-2 flex justify-end pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>


        {user?.subscription?.status !== 'ACTIVE' && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-linear-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-2xl p-6 mb-8 cursor-pointer"
            onClick={() => navigate.push('/app/premium')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Upgrade to Premium</h3>
                <p className="text-white/90">Get unlimited access to all features</p>
              </div>
              <Crown size={48} className="text-white" />
            </div>
          </motion.div>
        )}
        {user?.subscription?.status === 'ACTIVE' && (
          <motion.div
            className="bg-green-500/20 border border-green-500 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">Premium Active</h3>
                <p className="text-green-900/90">Thank you for being a premium member!</p>
              </div>
              <div className="flex items-center gap-4">
                <Crown size={48} className="text-green-900" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelSubscription}
                  className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                >
                  <RefreshCcw size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            onClick={() => navigate.push("/app/library")}
          >
            <p className="text-gray-600 dark:text-gray-400 mb-2">Playlists</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {userPlaylists.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            onClick={() => navigate.push("/app/liked")}
          >
            <p className="text-gray-600 dark:text-gray-400 mb-2">Liked Songs</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{likedSongs.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg cursor-pointer" onClick={() => setOpenFollowModal(true)}>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Following</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {followedArtistsCount || 0}
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Playlists</h2>
          {userPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {userPlaylists.map((playlist: any) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No playlists yet</p>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Liked Songs</h2>
          {likedSongs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {likedSongs.map((song: any) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No liked songs yet</p>
          )}
        </div>
      </motion.div>

      <FollowModal
        open={openFollowModal}
        onClose={() => {
          setOpenFollowModal(false)
          setRefresh(!refresh)
        }}
      />
    </div>
  );
};
