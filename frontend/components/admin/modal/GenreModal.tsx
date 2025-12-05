"use client";

import React, { useEffect, useState, useRef } from "react";
import { api } from '@/lib/api';
import { X, Save, Tag, Search, FormInputIcon } from "lucide-react";
import SearchSelect from "../SearchSelect";
import { useToastStore } from '@/store/toastStore';
import { a, b } from "framer-motion/client";


type Props = {
    open: boolean;
    genreId: string;
    onClose: () => void;
    onSave: (genreId: string) => Promise<void> | void;
};

export default function GenreModal({ open, genreId, onClose, onSave }: Props) {
    const { addToast } = useToastStore();
    const [saving, setSaving] = useState(false);

    // form fields
    const [name, setName] = useState("");

    const [loadingRelations, setLoadingRelations] = useState(false);


    // fetch artist details when editing
    useEffect(() => {
        if (!open) return;

        if (!genreId || genreId === "new") {
            console.log("New Genre data cleanup");
            // reset for new
            setName("");
            return;
        }


        const load = async () => {
            try {
                const { data } = await api.get(`/genres/${genreId}`);
                setName(data?.data?.genre?.name ?? "");
            } catch (err) {
                console.error("Failed to load genre:", err);
            }
        };

        load();
    }, [open, genreId]);


    if (!open) return null;

    const handleSave = async () => {
        setSaving(true);

        const payload: any = {
            name,
        };

        try {
            if (genreId === "new") {
                // creating new genre
                api.post("/genres", payload).then(async (response) => {
                    addToast("Genre created successfully", "success");
                }).catch((err) => {
                    addToast(err?.response?.data?.message || "Genre creation failed", "error");
                });

            } else {
                // updating existing genre
                const updatePayload: any = {
                    name,
                };
                api.put(`/genres/${genreId}`, updatePayload).then(async (response) => {
                    addToast("Genre updated successfully", "success");
                    onClose();
                }).catch((err) => {
                    addToast(err?.response?.data?.message || "Genre update failed", "error");
                });
            }

            // always call onSave for parent refresh (for edit case)
            if (genreId) await onSave(genreId);
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
                                {!genreId || genreId === "new" ? "Create Genre" : "Edit Genre"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {!genreId || genreId === "new" ? "New Genre" : `Genre ID: ${genreId}`}
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
                        {saving ? "Saving..." : <><Save size={16} /> {!genreId || genreId == "new" ? "Create Genre" : "Update Genre"}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

