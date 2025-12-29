"use client";
import React, { useEffect, useState } from "react";
import { api } from '@/lib/api';
import { X, Save, Tag, Search, UserMinus, Heart, Music } from "lucide-react";
import { useToastStore } from '@/store/toastStore';
import { useRouter } from 'next/navigation';

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function FollowModal({ open, onClose }: Props) {
    const { addToast } = useToastStore();
    const navigate = useRouter();
    const [artists, setArtists] = useState<any[]>([]);
    const [followedArtistsCount, setFollowedArtistsCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    // Fetch followed artists when modal opens
    useEffect(() => {
        if (open) {
            fetchFollowedArtists();
        }
    }, [open]);

    const fetchFollowedArtists = async () => {
        setLoading(true);
        try {
            const followCountResponse = await api.get('/artist-follows/follow-count');
            const response = await api.get('/artist-follows');
            console.log(response.data);
            setArtists(response.data.data.follows || []);
            setFollowedArtistsCount(followCountResponse.data.data.totalFollows);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (artistId: string) => {
        if (!confirm("Unfollow this artist?")) return;
        try {
            await api.delete(`/artist-follows/${artistId}/unfollow`);
            setArtists(artists.filter(a => a.artist.id !== artistId));
            addToast("Artist unfollowed successfully.", "success");
        } catch (err: any) {
            console.error(err);
            addToast("Failed to unfollow artist.", "error");
        }
    };

    const filteredArtists = artists.filter(artist =>
        artist.artist?.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (!open) return null;
    
    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center px-4 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => onClose()}
            />

            {/* Modal Container - TikTok-like vertical feed */}
            <div className="relative z-10 w-full max-w-xl bg-white dark:bg-[#0f0f12] border border-gray-200 dark:border-gray-800/70 rounded-2xl shadow-2xl flex flex-col max-h-screen overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 p-2">
                            <Music size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Followed Artists
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Scroll to explore
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onClose()}
                        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search followed artists..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 dark:text-gray-300 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </div>

                {/* Artist Feed - Vertical Scroll */}
                <div className="flex-1 overflow-y-auto modern-scrollbar-minimal">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            <p className="ml-3 text-gray-500">Loading artists...</p>
                        </div>
                    ) : filteredArtists.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-gray-500">No followed artists found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 p-6">
                            {filteredArtists.map(artist => (
                                <div key={artist.id} className="relative rounded-2xl border border-gray-200 dark:border-gray-800/70 bg-white dark:bg-[#0b0b0d] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => navigate.push(`/app/artist/${artist?.artist.id}`)}
                                >
                                    {/* Artist Image Background */}
                                    <div className="relative h-48 bg-gradient-to-br from-orange-500 to-pink-600">
                                        {artist.artist?.imageUrl && (
                                            <img 
                                                src={artist.artist.imageUrl} 
                                                alt={artist.artist?.name} 
                                                className="w-full h-full object-cover opacity-80" 
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/20"></div>
                                        {/* Unfollow Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleUnfollow(artist?.artist.id)
                                            }}
                                            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                                            title="Unfollow"
                                        >
                                            <UserMinus size={16} />
                                        </button>
                                        {/* Heart Icon */}
                                        <div className="absolute bottom-4 left-4">
                                            <Heart size={24} className="text-white fill-white" />
                                        </div>
                                    </div>
                                    {/* Artist Info */}
                                    <div className="p-4">
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{artist.artist?.name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{artist.artist?.bio || "Artist bio not available."}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Music size={14} />
                                            <span>Followed on {new Date(artist.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}