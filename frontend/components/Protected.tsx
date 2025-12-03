"use client";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useToastStore } from '@/store/toastStore';


type ProtectedProps = { children: ReactNode; allowedRoles?: string[] };

export default function Protected({ children, allowedRoles = ["user", "admin"] }: ProtectedProps) {
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (!isPending && !session) router.push("/");
  }, [isPending, session]);

  if (isPending || !session) return <p>Loading...</p>;

  
  if (allowedRoles.length > 0 && !allowedRoles.includes((session.user as any)?.role || "")) {
    addToast("You do not have permission to access this page.", "error");
    router.push("/app");
  }
  
  return children;
}
