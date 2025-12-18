"use client";
import React, { useEffect, useState, useRef } from "react";
import { api } from '@/lib/api';
import { X, Save, Tag, Search, FormInputIcon } from "lucide-react";
import { useToastStore } from '@/store/toastStore';
import { useRouter } from 'next/navigation';

type Props = {
    open: boolean;
    playlistId: string;
    onClose: () => void;
    onSave: (playlistId: string) => Promise<void> | void;
};

export default function PlaylistModal({ open, playlistId, onClose, onSave }: Props) {
    const { addToast } = useToastStore();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    // form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);


    // State for playlist art upload
    const [playlistArt, setPlaylistArt] = useState<File | null>(null);


    const [loadingRelations, setLoadingRelations] = useState(false);


    // Handle Playlist art change
    const handlePlaylistArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPlaylistArt(e.target.files[0]); // Create a URL for the image
        }
    };



    // fetch Playlist details when editing
    useEffect(() => {
        if (!open) return;

        if (!playlistId || playlistId === "new") {
            console.log("New Playlist data cleanup");
            // reset for new
            setDescription("");
            setTitle("");
            setIsPublic(false);
            setPlaylistArt(null);
            return;
        }


        const load = async () => {
            try {
                setLoadingRelations(true);
                const { data } = await api.get(`/playlists/${playlistId}`);
                setTitle(data?.data?.playlist?.title ?? "");
                setDescription(data?.data?.playlist?.description ?? "");
                setIsPublic(data?.data?.playlist?.isPublic ?? false);
                setPlaylistArt(data?.data?.playlist?.art ?? null);
            } catch (err) {
                console.error("Failed to load playlist:", err);
            } finally {
                setLoadingRelations(false);
            }
        };

        load();
    }, [open, playlistId]);


    if (!open) return null;

    const handleSave = async () => {
        setSaving(true);

        const payload = new FormData();
        payload.append("title", title);
        payload.append("description", description ?? "");
        payload.append("isPublic", isPublic ? "true" : "false");

        console.log("Debugging: ", playlistId);
        

        try {
            if (playlistId === "new" || !playlistId) {
                // creating new album
                if (playlistArt) payload.append("image", playlistArt);

                api.post("/playlists", payload, { timeout: 10000 }).then(async (response) => {
                    addToast("Playlist created successfully", "success");
                    router.push(`/app/playlist/${response.data.data.playlist.id}`);
                    onClose();
                }).catch((err) => {
                    addToast(err?.response?.data?.message || "Playlist creation failed", "error");
                });

            } else {
                // updating existing playlist
                const updatePayload: any = {
                    title,
                    description,
                    isPublic,
                };
                api.put(`/playlists/${playlistId}`, updatePayload).then(async (response) => {
                    addToast("Playlist updated successfully", "success");
                    router.push(`/app/playlist/${playlistId}`);
                    onClose();
                }).catch((err) => {
                    addToast(err?.response?.data?.message || "Playlist update failed", "error");
                });
            }

            // always call onSave for parent refresh (for edit case)
            if (playlistId) await onSave(playlistId);
            onClose();
        } catch (err) {
            console.error("save failed", err);
            // keep saving false and keep modal open
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center px-4 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !saving && onClose()}
            />

            {/* Modal Container */}
            <div className="
                relative z-10 w-full max-w-7xl
                bg-white dark:bg-[#0f0f12]
                border border-gray-200 dark:border-gray-800/70
                ring-1 ring-black/5 dark:ring-white/5
                rounded-2xl shadow-2xl
                flex flex-col
                max-h-screen 
            ">
                {/* Header - Fixed */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 p-2">
                            <Tag size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {!playlistId || playlistId === "new" ? "Create Playlist" : "Edit Playlist"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {!playlistId || playlistId === "new" ? "New Playlist" : `Playlist ID: ${playlistId}`}
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

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 text-gray-700 dark:text-gray-300 space-y-6 modern-scrollbar-minimal">
                    {/* All your form content goes here */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Playlist Title</span>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Playlist title"
                            />
                        </label>
                    </div>
                    
                    {/* isVerified Checker */}
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer group rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200">
                            <input
                                type="checkbox"
                                id="verified-checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="h-5 w-5 text-orange-600 border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 transition duration-200"
                                aria-checked={isPublic}
                                aria-labelledby="verified-label"
                            />
                            <span
                                id="verified-label"
                                className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-orange-600 group-focus-within:text-orange-600 transition-colors duration-200"
                            >
                                Public Playlist
                            </span>
                        </label>
                    </div>

                    {/* Album art and audio */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!playlistId || playlistId === "new" ? "" : "hidden"}`}>
                        {/* Album Art Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Album Art
                            </label>

                            <div className="relative group">
                                <div className="aspect-square w-40 max-w-40 mx-autox bg-gray-900/50 dark:bg-[#0b0b0d] backdrop-blur-sm border-2 border-dashed border-gray-400/50 dark:border-gray-600 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-gray-500/70">
                                    {playlistArt ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={URL.createObjectURL(playlistArt)}
                                                alt="Album artwork"
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Remove button */}
                                            <button
                                                onClick={() => setPlaylistArt(null)}
                                                className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                                            >
                                                ✕ Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="trackArt"
                                            className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            <div className="mb-3 p-3 bg-gray-700/50 rounded-full">
                                                <svg
                                                    className="w-10 h-10"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <span className="text-lg font-medium">Upload Artwork</span>
                                            <span className="text-xs mt-1 opacity-80">PNG, JPG up to 10MB</span>
                                        </label>
                                    )}
                                </div>

                                <input
                                    id="trackArt"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePlaylistArtChange}
                                />
                            </div>
                        </div>

                    </div>



                    {/* Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Description</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Brief description..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer - Fixed */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-[#0f0f12]">
                    <button
                        onClick={() => !saving && onClose()}
                        className="px-5 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loadingRelations}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {saving ? "Saving..." : <><Save size={16} /> {!playlistId || playlistId == "new" ? "Create Playlist" : "Update Playlist"}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

