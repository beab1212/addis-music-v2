"use client";
import { ReactNode } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { useSyncSession } from "@/hooks/useSyncSession";

import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";


export default function AppLayout({ children }: { children: ReactNode }) {
    const { data: session, isPending, error } = authClient.useSession();
    useSyncSession();

    if (!session) {
        return redirect("/")
    }

    return (
        <MainLayout>
            {children}
        </MainLayout>
    );
}
