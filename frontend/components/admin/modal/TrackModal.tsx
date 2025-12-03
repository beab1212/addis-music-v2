"use client";

import React, { useEffect, useState, useRef } from "react";
import { api } from '@/lib/api';
import { X, Save, Tag, Search } from "lucide-react";
import SearchSelect from "../SearchSelect";


type Props = {
    open: boolean;
    trackId: string;
    onClose: () => void;
    onSave: (trackId: string) => Promise<void> | void;
};

export default function TrackModal({ open, trackId, onClose, onSave }: Props) {
    const [saving, setSaving] = useState(false);

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

    const [loadingRelations, setLoadingRelations] = useState(false);

    // simple debounce
    const debounceRef = useRef<Record<string, number>>({});

    const debounceFetch = (key: string, fn: () => void, delay = 300) => {
        if (debounceRef.current[key]) {
            window.clearTimeout(debounceRef.current[key]);
        }
        debounceRef.current[key] = window.setTimeout(fn, delay);
    };

    // fetch track details when editing
    useEffect(() => {
        if (!open) return;

        const load = async () => {
            if (!trackId) {
                // reset for new
                setTitle("");
                setMood("");
                setReleaseDate("");
                setGenre(null);
                setArtist(null);
                setAlbum(null);
                setTags([]);
                return;
            }

            try {
                setLoadingRelations(true);
                const { data } = await api.get(`/tracks/${trackId}`);
                // expect backend response shape: { id, title, mood, releaseDate, duration, genre, artist, album, tags }
                setTitle(data.title ?? "");
                setMood(data.mood ?? "");
                setReleaseDate(data.releaseDate ?? "");
                setGenre(data.genre ? { id: data.genre.id, name: data.genre.name } : null);
                setArtist(data.artist ? { id: data.artist.id, name: data.artist.name } : null);
                setAlbum(data.album ? { id: data.album.id, name: data.album.name } : null);
                setTags(Array.isArray(data.tags) ? data.tags.map((t: any) => ({ id: t.id, name: t.name })) : []);
            } catch (err) {
                console.error("Failed to load track:", err);
            } finally {
                setLoadingRelations(false);
            }
        };

        load();
    }, [open, trackId]);

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

    useEffect(() => {
        if (!open) return;
        debounceFetch("artists", async () => {
            try {
                const { data } = await api.get("/artists", { params: { q: artistQuery } });
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
                const { data } = await api.get("/albums", { params: { q: albumQuery } });
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

    const handleSelectTag = (t: { id: string; name: string }) => {
        if (tags.find(x => x.id === t.id)) return;
        setTags(prev => [...prev, t]);
    };

    const handleRemoveTag = (id: string) => {
        setTags(prev => prev.filter(t => t.id !== id));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload: any = {
                title,
                mood,
                releaseDate,
                genreId: genre?.id ?? null,
                artistId: artist?.id ?? null,
                albumId: album?.id ?? null,
                tagIds: tags.map(t => t.id),
            };

            if (trackId) {
                await api.patch(`/tracks/${trackId}`, payload);
            } else {
                const { data } = await api.post("/tracks", payload);
                // if created, inform parent with new id
                if (data?.id) {
                    await onSave(data.id);
                }
            }

            // always call onSave for parent refresh (for edit case)
            if (trackId) await onSave(trackId);
            onClose();
        } catch (err) {
            console.error("save failed", err);
            // keep saving false and keep modal open
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
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
                                {trackId ? "Edit Track" : "Create Track"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {trackId ? `Track ID: ${trackId}` : "New track"}
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

                    {/* Track Art & Audio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Track Art</span>
                            <div className="mt-2 flex items-center gap-4">
                                {/* Placeholder for track art upload */}
                                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-center text-gray-400">
                                    <span>Upload Art</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Audio File</span>
                            <div className="mt-2 flex items-center gap-4">
                                {/* Placeholder for audio file upload */}
                                <div className="w-full h-12 bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-center text-gray-400">
                                    <span>Upload Audio</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tags</span>
                        <div className="mt-2">
                            <input
                                value={tagQuery}
                                onChange={(e) => setTagQuery(e.target.value)}
                                placeholder="Search and add tags..."
                                className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            {tagOptions.length > 0 && (
                                <ul className="mt-1 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-[#0f0f12] z-10">
                                    {tagOptions.map(t => (
                                        <li
                                            key={t.id}
                                            onClick={() => {
                                                handleSelectTag(t);
                                                setTagQuery("");
                                                setTagOptions([]);
                                            }}
                                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                        >
                                            {t.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                                {tags.map(t => (
                                    <span key={t.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 rounded-full text-sm font-medium">
                                        {t.name}
                                        <button onClick={() => handleRemoveTag(t.id)}>
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
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
                        {saving ? "Saving..." : <><Save size={16} /> {trackId ? "Update Track" : "Create Track"}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

