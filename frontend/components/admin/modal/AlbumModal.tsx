"use client";

import React, { useEffect, useState, useRef } from "react";
import { api } from '@/lib/api';
import { X, Save, Tag, Search } from "lucide-react";
import SearchSelect from "../SearchSelect";
import { useToastStore } from '@/store/toastStore';
import { a } from "framer-motion/client";


type Props = {
    open: boolean;
    albumId: string;
    onClose: () => void;
    onSave: (albumId: string) => Promise<void> | void;
};

export default function AlbumModal({ open, albumId, onClose, onSave }: Props) {
    const { addToast } = useToastStore();
    const [saving, setSaving] = useState(false);

    // form fields
    const [title, setTitle] = useState("");
    const [releaseDate, setReleaseDate] = useState("");
    const [description, setDescription] = useState("");
    const [credits, setCredits] = useState("");

    // selected relations
    const [genre, setGenre] = useState<any>(null);
    const [artist, setArtist] = useState<any>(null);

    // search inputs and options
    const [genreQuery, setGenreQuery] = useState("");
    const [artistQuery, setArtistQuery] = useState("");


    const [genreOptions, setGenreOptions] = useState<Array<{ id: string; name: string }>>([]);
    const [artistOptions, setArtistOptions] = useState<Array<{ id: string; name: string }>>([]);


    // State for album art and audio file
    const [albumArt, setAlbumArt] = useState<File | null>(null);


    const [loadingRelations, setLoadingRelations] = useState(false);

    // simple debounce
    const debounceRef = useRef<Record<string, number>>({});


    // Handle Album art change
    const handleAlbumArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAlbumArt(e.target.files[0]); // Create a URL for the image
        }
    };


    const debounceFetch = (key: string, fn: () => void, delay = 300) => {
        if (debounceRef.current[key]) {
            window.clearTimeout(debounceRef.current[key]);
        }
        debounceRef.current[key] = window.setTimeout(fn, delay);
    };

    // fetch track details when editing
    useEffect(() => {
        if (!open) return;

        if (!albumId || albumId === "new") {
            console.log("New Album data cleanup");
            // reset for new
            setTitle("");
            setReleaseDate("");
            setGenre(null);
            setGenreQuery("");
            setArtist(null);
            setArtistQuery("");
            setDescription("");
            setCredits("");
            setAlbumArt(null);
            return;
        }


        const load = async () => {
            try {
                setLoadingRelations(true);
                const { data } = await api.get(`/albums/${albumId}`);
                setTitle(data?.data?.album?.title ?? "");
                setDescription(data?.data?.album?.description ?? "");
                setCredits(data?.data?.album?.credit ?? "");
                setReleaseDate(data?.data?.album?.releaseDate?.split("T")[0] ?? "");
                setGenre(data?.data?.album?.genre ? { id: data.data.album.genre.id, name: data.data.album.genre.name } : null);
                setArtist(data?.data?.album?.artist ? { id: data.data.album.artist.id, name: data.data.album.artist.name } : null);
            } catch (err) {
                console.error("Failed to load album:", err);
            } finally {
                setLoadingRelations(false);
                setGenreQuery("");
                setArtistQuery("");
            }
        };

        load();
    }, [open, albumId]);

    // fetch relation options (searchable)
    useEffect(() => {
        if (!open) return;

        debounceFetch("genres", async () => {
            try {
                const { data } = await api.get("/genres/search", { params: { q: genreQuery } });
                setGenreOptions(data?.data?.genres || []);
            } catch (e) {
                console.error("genres fetch error", e);
            }
        });
    }, [genreQuery, open]);

    useEffect(() => {
        if (!open) return;
        debounceFetch("artists", async () => {
            try {
                const { data } = await api.get("/artists/search", { params: { q: artistQuery } });
                setArtistOptions(data?.data?.artists || []);
            } catch (e) {
                console.error("artists fetch error", e);
            }
        });
    }, [artistQuery, open]);



    if (!open) return null;

    const handleSave = async () => {
        setSaving(true);

        const payload = new FormData();
        payload.append("title", title);
        payload.append("releaseDate", releaseDate);
        if (genre?.id) payload.append("genreId", genre.id);
        if (artist?.id) payload.append("artistId", artist.id);
        payload.append("description", description ?? "");
        payload.append("credit", credits ?? "");



        try {
            if (albumId === "new") {
                // creating new album
                if (albumArt) payload.append("cover", albumArt);

                api.post("/albums", payload, { timeout: 10000 }).then(async (response) => {
                    addToast( "Album created successfully", "success");
                }).catch((err) => {
                    addToast(err?.response?.data?.message || "Album creation failed", "error");
                });

            } else {
                // updating existing album
                const updatePayload: any = {
                    title,
                    releaseDate,
                    description,
                    credit: credits,
                };
                if (genre?.id) updatePayload.genreId = genre.id;
                if (artist?.id) updatePayload.artistId = artist.id;
                api.put(`/albums/${albumId}`, updatePayload).then(async (response) => {
                    addToast( "Album updated successfully", "success");
                    onClose();
                }).catch((err) => {
                    addToast(err?.response?.data?.message || "Album update failed", "error");
                });
            }

            // always call onSave for parent refresh (for edit case)
            if (albumId) await onSave(albumId);
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
                                {!albumId || albumId === "new" ? "Create Album" : "Edit Album"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {!albumId || albumId === "new" ? "New Album" : `Album ID: ${albumId}`}
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
                            <span className="text-sm text-gray-600 dark:text-gray-400">Title</span>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Album title"
                            />
                        </label>

                        <SearchSelect
                            label="Artist"
                            query={artistQuery}
                            setQuery={setArtistQuery}
                            options={artistOptions}
                            onSelect={(artist: any) => {
                                setArtist(artist);
                                if (artist) setArtistQuery(artist.name);
                            }}
                            selected={artist}
                            fieldName="name"
                            placeholder={loadingRelations ? "Loading..." : "Search artists..."}
                        />


                        <label className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Release Date</span>
                            <input
                                type="date"
                                value={releaseDate}
                                onChange={(e) => setReleaseDate(e.target.value)}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </label>

                        <SearchSelect
                            label="Genre"
                            query={genreQuery}
                            setQuery={setGenreQuery}
                            options={genreOptions}
                            onSelect={(genre: any) => {
                                setGenre(genre);
                                if (genre) setGenreQuery(genre.name);
                            }}
                            selected={genre}
                            fieldName="name"
                            placeholder="Search genres..."
                        />
                    </div>


                    {/* Album art and audio */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!albumId || albumId === "new" ? "" : "hidden"}`}>
                        {/* Album Art Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Album Art
                            </label>

                            <div className="relative group">
                                <div className="aspect-square w-40 max-w-40 mx-autox bg-gray-900/50 dark:bg-[#0b0b0d] backdrop-blur-sm border-2 border-dashed border-gray-400/50 dark:border-gray-600 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-gray-500/70">
                                    {albumArt ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={URL.createObjectURL(albumArt)}
                                                alt="Album artwork"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Overlay on hover */}
                                            {/* <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <label
                                        htmlFor="trackArt"
                                        className="cursor-pointer bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-medium px-5 py-2.5 rounded-xl border border-white/30 shadow-lg transition-all duration-200 hover:scale-105"
                                    >
                                        Change Artwork
                                    </label>
                                    </div> */}

                                            {/* Remove button */}
                                            <button
                                                onClick={() => setAlbumArt(null)}
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
                                    onChange={handleAlbumArtChange}
                                />
                            </div>
                        </div>
                    </div>



                    {/* Description & Credits */}
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
                        <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Credits</span>
                            <textarea
                                value={credits}
                                onChange={(e) => setCredits(e.target.value)}
                                rows={5}
                                className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Producer, mixing, etc..."
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
                        {saving ? "Saving..." : <><Save size={16} /> {!albumId || albumId == "new" ? "Create Album" : "Update Album"}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

