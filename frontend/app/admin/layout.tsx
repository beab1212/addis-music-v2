"use client";
import { ReactNode } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { useSyncSession } from "@/hooks/useSyncSession";
import Protected from "@/components/Protected";
import { HLSPlayer } from "@/components/HLSPlayer";


export default function AppLayout({ children }: { children: ReactNode }) {
    useSyncSession();
    return (
        <AdminLayout>
            {/* Add HLSPlayer for playback */}
            <HLSPlayer />
            <Protected>{children}</Protected>
        </AdminLayout>
    );
}
