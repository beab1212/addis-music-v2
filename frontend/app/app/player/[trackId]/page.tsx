"use client";

import { useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import Player from "@/app/app/player/page"
import { usePlayerStore } from '@/store/playerStore';
import { useToastStore, } from '@/store/toastStore';
import { api } from "@/lib/api";


function page() {
    const params = useParams();
    const trackId = params?.trackId as string;
    const router = useRouter();
    const { addToast } = useToastStore();
    const { setCurrentSong, currentSong, setQueue } = usePlayerStore();

    const handlePlay = (track: any) => {
        setCurrentSong(track);
        setQueue([track]);
    };

    useEffect(() => {
        if (trackId) {
            // Fetch track details using the trackId
            api.get(`/tracks/${trackId}`)
                .then(response => {
                    const trackData = response.data.data.track;
                    if (!trackData) {
                        addToast('Requested track not found. Redirecting to app.', 'info');
                        router.push('/app');
                        return;
                    }
                    handlePlay(trackData);
                    router.push('/app/player/');
                })
                .catch(error => {
                    console.error("Error fetching track data:", error);
                    // Optionally handle the error, e.g., navigate back or show a message
                    addToast('Requested track not found. Redirecting to app.', 'info');
                    router.push('/app');
                });
        }
    }, [trackId, setCurrentSong, router]);

    if (!currentSong) {
        return <div>Loading...</div>;
    }
}

export default page