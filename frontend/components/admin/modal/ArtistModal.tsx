"use client";

import React, { useEffect, useState, useRef } from "react";
import { api } from '@/lib/api';
import { X, Save, Tag, Search, FormInputIcon } from "lucide-react";
import SearchSelect from "../SearchSelect";
import { useToastStore } from '@/store/toastStore';
import { a, b } from "framer-motion/client";


type Props = {
    open: boolean;
    artistId: string;
    onClose: () => void;
    onSave: (artistId: string) => Promise<void> | void;
};

export default function ArtistModal({ open, artistId, onClose, onSave }: Props) {
    const { addToast } = useToastStore();
    const [saving, setSaving] = useState(false);

    // form fields
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [isVerified, setIsVerified] = useState(false);


    // selected relations
    const [genre, setGenre] = useState<string[]>([]);


    // search inputs and options
    const [genreQuery, setGenreQuery] = useState("");


    const [genreOptions, setGenreOptions] = useState<Array<{ id: string; name: string }>>([]);


    // State for album art and audio file
    const [artistArt, setArtistArt] = useState<File | null>(null);


    const [loadingRelations, setLoadingRelations] = useState(false);

    // simple debounce
    const debounceRef = useRef<Record<string, number>>({});


    // Handle Artist art change
    const handleArtistArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setArtistArt(e.target.files[0]); // Create a URL for the image
        }
    };


    const debounceFetch = (key: string, fn: () => void, delay = 300) => {
        if (debounceRef.current[key]) {
            window.clearTimeout(debounceRef.current[key]);
        }
        debounceRef.current[key] = window.setTimeout(fn, delay);
    };

    // fetch artist details when editing
    useEffect(() => {
        if (!open) return;

        if (!artistId || artistId === "new") {
            console.log("New Artist data cleanup");
            // reset for new
            setName("");
            setGenre([]);
            setArtistArt(null);
            setBio("");
            return;
        }


        const load = async () => {
            try {
                setLoadingRelations(true);
                const { data } = await api.get(`/artists/${artistId}`);
                setName(data?.data?.artist?.name ?? "");
                setBio(data?.data?.artist?.bio ?? "");
                setGenre(data?.data?.artist?.genres ? data.data.artist.genres : []);
                setIsVerified(data?.data?.artist?.isVerified ?? false);
            } catch (err) {
                console.error("Failed to load artist:", err);
            } finally {
                setLoadingRelations(false);
                setGenreQuery("");
            }
        };

        load();
    }, [open, artistId]);

    // fetch relation options (searchable)
    useEffect(() => {
        if (!open) return;

        debounceFetch("genres", async () => {
            try {
                const { data } = await api.get("/genres", { params: { q: genreQuery } });
                setGenreOptions(data?.data?.genres || []);
            } catch (e) {
                console.error("genres fetch error", e);
            }
        });
    }, [genreQuery, open]);


    if (!open) return null;

    const handleSave = async () => {
        setSaving(true);

        const payload = new FormData();
        payload.append("name", name);
        payload.append("bio", bio ?? "");
        payload.append("isVerified", isVerified ? "true" : "false");
        if (genre && genre.length > 0) {
            genre.forEach((g) => payload.append("genres[]", g));
        }

        try {
            if (artistId === "new") {
                // creating new album
                if (artistArt) payload.append("image", artistArt);

                api.post("/artists", payload, { timeout: 10000 }).then(async (response) => {
                    addToast("Artist created successfully", "success");
                }).catch((err) => {
                    addToast(err?.response?.data?.message || "Artist creation failed", "error");
                });

            } else {
                // updating existing artist
                const updatePayload: any = {
                    name,
                    bio,
                    isVerified,
                    genres: genre,
                };
                api.put(`/artists/${artistId}`, updatePayload).then(async (response) => {
                    addToast("Artist updated successfully", "success");
                    onClose();
                }).catch((err) => {
                    addToast(err?.response?.data?.message || "Artist update failed", "error");
                });
            }

            // always call onSave for parent refresh (for edit case)
            if (artistId) await onSave(artistId);
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
                                {!artistId || artistId === "new" ? "Create Artist" : "Edit Artist"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {!artistId || artistId === "new" ? "New Artist" : `Artist ID: ${artistId}`}
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
                            <span className="text-sm text-gray-600 dark:text-gray-400">Name</span>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Artist name"
                            />
                        </label>

                        <div>
                            <SearchSelect
                                label="Genre"
                                query={genreQuery}
                                setQuery={setGenreQuery}
                                options={genreOptions}
                                onSelect={(genre: any) => {
                                    setGenre(prev => {
                                        if (prev.includes(genre.name)) return prev;
                                        return [...prev, genre.name];
                                    });
                                    // if (genre) setGenreQuery(genre.name);
                                    if (genre) setGenreQuery("");

                                }}
                                selected={genre}
                                fieldName="name"
                                isMulti={true}
                                placeholder="Search genres..."
                            />
                            {/* selected genre list */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {genre && genre.length > 0 ? (
                                    genre.map((g) => (
                                        <div
                                            key={g}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-800 rounded-full"
                                        >
                                            <span className="text-sm">{g}</span>
                                            <button
                                                onClick={() => setGenre(genre.filter((gen) => gen !== g))}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">No genre selected</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* isVerified Checker */}
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer group rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200">
                            <input
                                type="checkbox"
                                id="verified-checkbox"
                                checked={isVerified}
                                onChange={(e) => setIsVerified(e.target.checked)}
                                className="h-5 w-5 text-orange-600 border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 transition duration-200"
                                aria-checked={isVerified}
                                aria-labelledby="verified-label"
                            />
                            <span
                                id="verified-label"
                                className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-orange-600 group-focus-within:text-orange-600 transition-colors duration-200"
                            >
                                Verified Artist
                            </span>
                        </label>
                    </div>

                    {/* Album art and audio */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!artistId || artistId === "new" ? "" : "hidden"}`}>
                        {/* Album Art Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Album Art
                            </label>

                            <div className="relative group">
                                <div className="aspect-square w-40 max-w-40 mx-autox bg-gray-900/50 dark:bg-[#0b0b0d] backdrop-blur-sm border-2 border-dashed border-gray-400/50 dark:border-gray-600 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-gray-500/70">
                                    {artistArt ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={URL.createObjectURL(artistArt)}
                                                alt="Album artwork"
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Remove button */}
                                            <button
                                                onClick={() => setArtistArt(null)}
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
                                    onChange={handleArtistArtChange}
                                />
                            </div>
                        </div>

                    </div>



                    {/* Description & Credits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Bio</span>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={5}
                                className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Brief bio..."
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
                        {saving ? "Saving..." : <><Save size={16} /> {!artistId || artistId == "new" ? "Create Album" : "Update Album"}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

