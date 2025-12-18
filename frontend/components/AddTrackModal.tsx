"use client";
import React, { useEffect, useState } from "react";
import { api } from '@/lib/api';
import { X, Save, Tag, Search } from "lucide-react";
import { useToastStore } from '@/store/toastStore';
import { useRouter } from 'next/navigation';
import { SongCard } from "./SongCard";
import { usePlayerStore } from "@/store/playerStore";

type Props = {
    open: boolean;
    playlistId: string;
    onClose: () => void;
    onSave: (playlistId: string) => Promise<void> | void;
};

export default function AddTrackModal({ open, playlistId, onClose, onSave }: Props) {
    const { addToast } = useToastStore();
    const router = useRouter();
    const currentSong = usePlayerStore((state) => state.currentSong);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [trackData, setTrackData] = useState<any[]>([]);
    const [selectedTracks, setSelectedTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const limit = 20;

    // Fetch tracks based on search or initial page load
    const fetchTracks = async (searchQuery: string | null = null) => {
        setLoading(true);
        try {
            const response = searchQuery
                ? await api.get(`/tracks/semantic-search?q=${searchQuery.trim()}&page=${page}&limit=${limit}`)
                : await api.get(`/tracks?page=${page}&limit=${limit}`);
                
            setTrackData(response.data.data.tracks || []);
        } catch (error) {
            addToast('Failed to fetch tracks', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTrackSelection = (track: any) => {
        setSelectedTracks(prevSelected => 
            prevSelected.some(t => t.id === track.id)
                ? prevSelected.filter(t => t.id !== track.id)
                : [...prevSelected, track]
        );
    };

    // Fetch tracks when the modal opens
    useEffect(() => {
        if (open) fetchTracks();
    }, [open]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (selectedTracks.length === 0) {
                addToast('Please select at least one track to add.', 'info');
                setSaving(false);
                return;
            }

            const trackIds = selectedTracks.map(track => track.id);
            api.post(`/playlist-items/${playlistId}/items/bulk`, { trackIds }).then((res) => {
                addToast(res.data.message || 'Tracks added to playlist successfully', 'success');
                onClose();
            }).catch((err) => {
                addToast(err.response?.data?.message || 'Failed to add tracks to playlist', 'error');
            });

            if (playlistId) await onSave(playlistId);
        } catch (err) {
            addToast('Failed to add tracks to playlist', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center px-4 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !saving && onClose()}
            />

            {/* Modal Container */}
            <div className="relative z-10 w-full max-w-7xl bg-white dark:bg-[#0f0f12] border border-gray-200 dark:border-gray-800/70 rounded-2xl shadow-2xl flex flex-col max-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 p-2">
                            <Tag size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Add Track to Playlist
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Playlist ID: {playlistId}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => !saving && onClose()}
                        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 px-6 py-6 text-gray-700 dark:text-gray-300 space-y-6">
                    {/* Search Bar */}
                    <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg p-6 mb-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchTracks(search)}
                                placeholder="Search tracks..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Selected Tracks */}
                    <div>
                        <h4 className="text-md font-semibold mb-4">Selected Tracks</h4>
                        <div className="max-h-60 flex flex-row gap-3 flex-wrap">
                            {selectedTracks.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No tracks selected.</p>
                            ) : (
                                selectedTracks.map((track) => (
                                    <div key={track.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center space-x-2 flex-grow">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">{track.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{track.artist?.name || 'Unknown Artist'}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedTracks(prev => prev.filter(t => t.id !== track.id))}
                                            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Track List */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 modern-scrollbar-minimal">
                    {loading ? (
                        <p>Loading tracks...</p>
                    ) : trackData.length === 0 ? (
                        <p>No tracks found.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {trackData.map((track: any) => (
                                <div key={track.id} 
                                     className={`shrink-0 w-56 cursor-pointer border-2 rounded-lg ${selectedTracks.some(t => t.id === track.id) ? 'border-orange-500' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'} p-1`}
                                     onClick={() => handleTrackSelection(track)}>
                                    <SongCard song={track} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0 bg-white dark:bg-[#0f0f12] ${currentSong ? 'mb-24' : ''}`}>
                    <button
                        onClick={() => !saving && onClose()}
                        className="px-5 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {saving ? "Saving..." : <><Save size={16} /> {"Add to Playlist"}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
