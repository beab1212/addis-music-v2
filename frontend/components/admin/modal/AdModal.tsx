"use client";

import React, { useEffect, useState, useRef } from "react";
import { api } from '@/lib/api';
import { X, Save, Tag, Search } from "lucide-react";
import SearchSelect from "../SearchSelect";
import { useToastStore } from '@/store/toastStore';


type Props = {
    open: boolean;
    adId: string;
    onClose: () => void;
    onSave: (adId: string) => Promise<void> | void;
};

export default function AdModal({ open, adId, onClose, onSave }: Props) {
    const { addToast } = useToastStore();
    const [saving, setSaving] = useState(false);

    // form fields
    const [title, setTitle] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [advertiser, setAdvertiser] = useState("");
    const [isActive, setIsActive] = useState<boolean>(true);

    // search inputs and options
    const [genreQuery, setGenreQuery] = useState("");
    const [artistQuery, setArtistQuery] = useState("");
    const [albumQuery, setAlbumQuery] = useState("");
    const [tagQuery, setTagQuery] = useState("");

    const [genreOptions, setGenreOptions] = useState<Array<{ id: string; name: string }>>([]);
    const [artistOptions, setArtistOptions] = useState<Array<{ id: string; name: string }>>([]);
    const [albumOptions, setAlbumOptions] = useState<Array<{ id: string; name: string }>>([]);
    const [tagOptions, setTagOptions] = useState<Array<{ id: string; name: string }>>([]);

    // State for ad art and audio file
    const [adArt, setAdArt] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);

    const [loadingRelations, setLoadingRelations] = useState(false);

    // simple debounce
    const debounceRef = useRef<Record<string, number>>({});


    // Handle ad art change
    const handleAdArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAdArt(e.target.files[0]); // Create a URL for the image
        }
    };

    // Handle audio file change
    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAudioFile(e.target.files[0]); // Store the selected audio file
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

        if (!adId || adId === "new") {
                console.log("New Ad data cleanup");
                // reset for new
                setTitle("");
                setLinkUrl("");
                setVideoUrl("");
                setStartDate("");
                setEndDate("");
                setAdArt(null);
                setAudioFile(null);
                return;
            }


        const load = async () => {
            try {
                setLoadingRelations(true);
                const { data } = await api.get(`/ads/${adId}`);

                console.log("Data: ", data);

                // expect backend response shape: data.advertisement
                setTitle(data?.data?.advertisement?.title ?? "");
                setAdvertiser(data?.data?.advertisement?.advertiser ?? "");
                setLinkUrl(data?.data?.advertisement?.targetUrl ?? "");
                setVideoUrl(data?.data?.advertisement?.videoUrl ?? "");
                setStartDate(data?.data?.advertisement?.startDate?.split("T")[0] ?? "");
                setEndDate(data?.data?.advertisement?.endDate?.split("T")[0] ?? "");
                setIsActive(data?.data?.advertisement?.active ?? true);
                setAdArt(data?.data?.advertisement?.art ?? null);
                setAudioFile(data?.data?.advertisement?.audioFile ?? null);
            } catch (err) {
                console.error("Failed to load ad:", err);
            } finally {
                setLoadingRelations(false);
                setGenreQuery("");
                setArtistQuery("");
                setAlbumQuery("");
                setTagQuery("");
            }
        };

        load();
    }, [open, adId]);


    if (!open) return null;


    const handleSave = async () => {
        setSaving(true);

        const payload = new FormData();
        payload.append("title", title);
        payload.append("linkUrl", linkUrl);
        payload.append("videoUrl", videoUrl);
        payload.append("startDate", startDate);
        payload.append("endDate", endDate);
        payload.append("advertiser", advertiser);
        payload.append("isActive", isActive ? "true" : "false");
        
        

        try {
            if (adId === "new") {
                // creating new ad
                if (audioFile) payload.append("audio", audioFile);
                if (adArt) payload.append("cover", adArt);

                api.post("/ads/upload", payload, { timeout: 10000 }).then(async (response) => {
                    addToast( "Ad created successfully", "success");                    
                }).catch((err) => {
                    addToast(err?.response?.data?.message || "Ad creation failed", "error");
                });
            
            } else {
                // updating existing ad
                const updatePayload: any = {
                    title,
                    linkUrl,
                    videoUrl,
                    startDate,
                    endDate,
                    advertiser,
                    isActive,
                };
                api.put(`/ads/${adId}`, updatePayload).then(async (response) => {
                    addToast( "Ad updated successfully", "success");                    
                    onClose();
                }).catch((err) => {
                    addToast(err?.response?.data?.message || "Ad update failed", "error");
                });
            }
        
            // always call onSave for parent refresh (for edit case)
            if (adId) await onSave(adId);
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
                                {!adId || adId === "new" ? "Create Advertisement" : "Edit Advertisement"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {!adId || adId === "new" ? "New advertisement" : ` ID: ${adId}`}
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
                                placeholder="Advertisement title"
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Advertiser</span>
                            <input
                                value={advertiser}
                                onChange={(e) => setAdvertiser(e.target.value)}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Advertisement company name"
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Site Link</span>
                            <input
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Product/service link"
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Ad Video Link</span>
                            <input
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Product/service video link"
                            />
                        </label>


                        <label className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Start Date</span>
                            <input
                                type="date"
                                value={startDate || ""}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-400">End Date</span>
                            <input
                                type="date"
                                value={endDate || ""}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group rounded-lg p-2 hover:bg-gray-10 transition duration-200">
                            <input
                                type="checkbox"
                                id="is-active-checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="h-5 w-5 text-orange-600 border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 transition duration-200"
                                aria-checked={isActive}
                                aria-labelledby="is-active-label"
                            />
                            <span
                                id="is-active-label"
                                className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-orange-600 group-focus-within:text-orange-600 transition-colors duration-200"
                            >
                                Active
                            </span>
                        </label>


                    </div>

                    
                    {/* Track art and audio */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!adId || adId === "new" ? "" : "hidden"}`}>
                        {/* Track Art Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Ad Art
                            </label>

                            <div className="relative group">
                            <div className="aspect-square w-40 max-w-40 mx-autox bg-gray-900/50 dark:bg-[#0b0b0d] backdrop-blur-sm border-2 border-dashed border-gray-400/50 dark:border-gray-600 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-gray-500/70">
                                {adArt ? (
                                <div className="relative w-full h-full">
                                    <img
                                    src={URL.createObjectURL(adArt)}
                                    alt="Ad artwork"
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
                                    onClick={() => setAdArt(null)}
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
                                onChange={handleAdArtChange}
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
                        {saving ? "Saving..." : <><Save size={16} /> {!adId || adId == "new" ? "Create Track" : "Update Track"}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
