"use client";
import { ReactNode } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { useSyncSession } from "@/hooks/useSyncSession";


export default function AppLayout({ children }: { children: ReactNode }) {
    useSyncSession();
    return (
        <MainLayout>
            {children}
        </MainLayout>
    );
}
