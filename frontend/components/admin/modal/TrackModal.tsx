"use client";

import React, { useEffect, useState, useRef } from "react";
import { api } from '@/lib/api';
import { X, Save, Tag, Search } from "lucide-react";
import SearchSelect from "../SearchSelect";
import { useToastStore } from '@/store/toastStore';
import ProgressSpinner from "@/components/ProgressSpinner";


type Props = {
    open: boolean;
    trackId: string;
    onClose: () => void;
    onSave: (trackId: string) => Promise<void> | void;
};

export default function TrackModal({ open, trackId, onClose, onSave }: Props) {
    const { addToast } = useToastStore();
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // form fields
    const [title, setTitle] = useState("");
    const [mood, setMood] = useState("");
    const [releaseDate, setReleaseDate] = useState("");
    const [description, setDescription] = useState("");
    const [credits, setCredits] = useState("");

    // selected relations
    const [genre, setGenre] = useState<any>(null);
    const [artist, setArtist] = useState<any>(null);
    const [album, setAlbum] = useState<any>(null);
    const [tags, setTags] = useState<Array<any>>([]);

    // search inputs and options
    const [genreQuery, setGenreQuery] = useState("");
    const [artistQuery, setArtistQuery] = useState("");
    const [albumQuery, setAlbumQuery] = useState("");
    const [tagQuery, setTagQuery] = useState("");

    const [genreOptions, setGenreOptions] = useState<Array<{ id: string; name: string }>>([]);
    const [artistOptions, setArtistOptions] = useState<Array<{ id: string; name: string }>>([]);
    const [albumOptions, setAlbumOptions] = useState<Array<{ id: string; name: string }>>([]);
    const [tagOptions, setTagOptions] = useState<Array<{ id: string; name: string }>>([]);

    // State for track art and audio file
    const [trackArt, setTrackArt] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);

    const [loadingRelations, setLoadingRelations] = useState(false);

    // simple debounce
    const debounceRef = useRef<Record<string, number>>({});


    // Handle track art change
    const handleTrackArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setTrackArt(e.target.files[0]); // Create a URL for the image
            console.log("Selected track art file:", e.target.files[0]);
        }
    };

    // Handle audio file change
    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAudioFile(e.target.files[0]); // Store the selected audio file
            console.log("Selected track art file:", e.target.files[0]);
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

        if (!trackId || trackId === "new") {
            console.log("New Track data cleanup");
            // reset for new
            setTitle("");
            setMood("");
            setReleaseDate("");
            setGenre(null);
            setGenreQuery("");
            setArtist(null);
            setArtistQuery("");
            setAlbum(null);
            setAlbumQuery("");
            setTags([]);
            setDescription("");
            setCredits("");
            setTrackArt(null);
            setAudioFile(null);
            return;
        }


        const load = async () => {
            try {
                setLoadingRelations(true);
                const { data } = await api.get(`/tracks/${trackId}`);
                // expect backend response shape: { id, title, mood, releaseDate, duration, genre, artist, album, tags }
                setTitle(data?.data?.track?.title ?? "");
                setMood(data?.data?.track?.tags.join(", ") ?? "");
                setDescription(data?.data?.track?.description ?? "");
                setCredits(data?.data?.track?.credit ?? "");
                setReleaseDate(data?.data?.track?.releaseDate?.split("T")[0] ?? "");
                setGenre(data?.data?.track?.genre ? { id: data.data.track.genre.id, name: data.data.track.genre.name } : null);
                setArtist(data?.data?.track?.artist ? { id: data.data.track.artist.id, name: data.data.track.artist.name } : null);
                setAlbum(data?.data?.track?.album ? { id: data.data.track.album.id, title: data.data.track.album.title } : null);
                setTags(Array.isArray(data?.data?.track?.tags) ? data.data.track.tags.map((t: any) => ({ id: t.id, name: t.name })) : []);
            } catch (err) {
                console.error("Failed to load track:", err);
            } finally {
                setLoadingRelations(false);
                setGenreQuery("");
                setArtistQuery("");
                setAlbumQuery("");
                setTagQuery("");
            }
        };

        load();
    }, [open, trackId]);

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

    useEffect(() => {
        if (!open) return;
        debounceFetch("albums", async () => {
            try {
                const { data } = await api.get("/albums/search", { params: { q: albumQuery } });
                setAlbumOptions(data?.data?.albums || []);
            } catch (e) {
                console.error("albums fetch error", e);
            }
        });
    }, [albumQuery, open]);

    useEffect(() => {
        if (!open) return;
        debounceFetch("tags", async () => {
            try {
                const { data } = await api.get("/tags", { params: { q: tagQuery } });
                setTagOptions(data?.data?.tags || []);
            } catch (e) {
                console.error("tags fetch error", e);
            }
        });
    }, [tagQuery, open]);

    if (!open) return null;

    const handleSave = async () => {
        const isNewTrack = !trackId || trackId === "new";
        if (!isNewTrack && !trackId) return;

        setSaving(true);
        setUploadProgress(0);

        try {
            if (isNewTrack) {
                if (!audioFile) {
                    addToast("Please upload an audio file", "error");
                    return;
                }

                const payload = new FormData();
                payload.append("title", title);
                payload.append("releaseDate", releaseDate || "");
                payload.append("description", description || "");
                payload.append("credit", credits || "");

                if (genre?.id) payload.append("genreId", genre.id);
                if (artist?.id) payload.append("artistId", artist.id);
                if (album?.id) payload.append("albumId", album.id);
                if (trackArt) payload.append("cover", trackArt);
                payload.append("audio", audioFile);

                mood.split(",").map(t => t.trim()).filter(Boolean).forEach(tag => {
                    payload.append("tags[]", tag);
                });

                await api.post("/tracks/upload", payload, {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 0,
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(percent);
                        }
                    },
                });

                addToast("Track created successfully!", "success");
                onSave("new");
                onClose();
            } else {
                // Update existing track
                const updatePayload: any = {
                    title,
                    releaseDate: releaseDate || null,
                    description: description || "",
                    credit: credits || "",
                    tags: mood.split(",").map(t => t.trim()).filter(Boolean),
                };

                if (genre?.id) updatePayload.genreId = genre.id;
                else updatePayload.genreId = null;

                if (artist?.id) updatePayload.artistId = artist.id;
                else updatePayload.artistId = null;

                if (album?.id) updatePayload.albumId = album.id;
                else updatePayload.albumId = null;

                await api.post(`/tracks/${trackId}`, updatePayload);
                addToast("Track updated successfully!", "success");
                await onSave(trackId);
                onClose();
            }
        } catch (err: any) {
            const message = err?.response?.data?.message || (isNewTrack ? "Upload failed" : "Update failed");
            addToast(message, "error");
            setUploadProgress(0);
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
                                {!trackId || trackId === "new" ? "Create Track" : "Edit Track"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {!trackId || trackId === "new" ? "New track" : `Track ID: ${trackId}`}
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
                                placeholder="Track title"
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

                        <SearchSelect
                            label="Album"
                            query={albumQuery}
                            setQuery={setAlbumQuery}
                            options={albumOptions}
                            onSelect={(album: any) => {
                                setAlbum(album);
                                if (album) setAlbumQuery(album.name);
                            }}
                            selected={album}
                            fieldName="title"
                            placeholder={loadingRelations ? "Loading..." : "Search albums..."}
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

                        <label className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Mood</span>
                            <input
                                value={mood}
                                onChange={(e) => setMood(e.target.value)}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g. Chill, Energetic"
                            />
                        </label>
                    </div>


                    {/* Track art and audio */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!trackId || trackId === "new" ? "" : "hidden"}`}>
                        {/* Track Art Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Track Art
                            </label>

                            <div className="relative group">
                                <div className="aspect-square w-40 max-w-40 mx-autox bg-gray-900/50 dark:bg-[#0b0b0d] backdrop-blur-sm border-2 border-dashed border-gray-400/50 dark:border-gray-600 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-gray-500/70">
                                    {trackArt ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={URL.createObjectURL(trackArt)}
                                                alt="Track artwork"
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
                                                onClick={() => setTrackArt(null)}
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
                                    onChange={handleTrackArtChange}
                                />
                            </div>
                        </div>

                        {/* Audio File Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Audio File
                            </label>

                            <div className="relative group">
                                <div className="w-full max-w-md mx-autox h-24 bg-gray-900/50 dark:bg-[#0b0b0d] backdrop-blur-sm border-2 border-dashed border-gray-400/50 dark:border-gray-600 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-gray-500/70 flex items-center justify-center">
                                    {audioFile ? (
                                        <div className="flex items-center justify-between w-full px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-600/20 rounded-lg">
                                                    <svg
                                                        className="w-6 h-6 text-purple-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium truncate max-w-xs">
                                                        {audioFile.name}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">
                                                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <label
                                                    htmlFor="audioFile"
                                                    className="cursor-pointer bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-medium px-4 py-2 rounded-xl border border-white/30 shadow-lg transition-all duration-200 hover:scale-105"
                                                >
                                                    Change
                                                </label>
                                                <button
                                                    onClick={() => setAudioFile(null)}
                                                    className="bg-red-600/90 hover:bg-red-700 text-white text-xs font-semibold px-2 py-1.5 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="audioFile"
                                            className="flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            <div className="mb-3 p-3 bg-gray-700/50 rounded-full">
                                                <svg
                                                    className="w-8 h-8"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                                    />
                                                </svg>
                                            </div>
                                            <span className="text-lg font-medium">Upload Audio</span>
                                            <span className="text-xs opacity-80">MP3, WAV, FLAC • Max 100MB</span>
                                        </label>
                                    )}
                                </div>

                                <input
                                    id="audioFile"
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={handleAudioChange}
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
                        {saving ? "Saving..." : <><Save size={16} /> {!trackId || trackId == "new" ? "Create Track" : "Update Track"}</>}
                    </button>
                </div>
                <ProgressSpinner
                    value={uploadProgress}
                    text={uploadProgress < 100 ? "Uploading…" : "Finalizing"}
                />
            </div>
        </div>
    );
}

