import { ReactNode } from "react";
import { MainLayout } from "@/layouts/MainLayout";


export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <MainLayout>
            {children}
        </MainLayout>
    );
}
