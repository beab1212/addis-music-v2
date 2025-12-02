"use client";
import { ReactNode } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { useSyncSession } from "@/hooks/useSyncSession";
import Protected from "@/components/Protected";
import { HLSPlayer } from "@/components/HLSPlayer";


export default function AppLayout({ children }: { children: ReactNode }) {
    useSyncSession();
    return (
        <MainLayout>
            {/* Add HLSPlayer for playback */}
            <HLSPlayer />
            <Protected>{children}</Protected>
        </MainLayout>
    );
}
