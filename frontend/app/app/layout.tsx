"use client";
import { ReactNode } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { useSyncSession } from "@/hooks/useSyncSession";
import Protected from "@/components/Protected"


export default function AppLayout({ children }: { children: ReactNode }) {
    useSyncSession();
    return (
        <MainLayout>
            <Protected>{children}</Protected>
        </MainLayout>
    );
}
