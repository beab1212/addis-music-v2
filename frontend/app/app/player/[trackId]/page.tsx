"use client";

import { useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import { Player } from "@/pages/Player"
import { usePlayerStore } from '@/store/playerStore';
import { useToastStore } from '@/store/toastStore';
import { api } from "@/lib/api";


function page() {
    const params = useParams();
    const trackId = params?.trackId as string;
    const router = useRouter();
    const { addToast } = useToastStore();
    const { setCurrentSong } = usePlayerStore();

    useEffect(() => {
        if (trackId) {
            // Fetch track details using the trackId
            api.get(`/tracks/${trackId}`)
                .then(response => {
                    const trackData = response.data;
                    setCurrentSong(trackData);
                })
                .catch(error => {
                    console.error("Error fetching track data:", error);
                    // Optionally handle the error, e.g., navigate back or show a message
                    addToast('Requested track not found. Redirecting to app.', 'info');
                    router.push('/app');
                });
        }
    }, [trackId, setCurrentSong, router]);
    return (
        <Player />
    )
}

export default page