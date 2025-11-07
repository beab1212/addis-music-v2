import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from '@/store/authStore';

export function useSyncSession() {
  const { data: session, isPending, error } = authClient.useSession();
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    // When session changes in Better Auth, update Zustand
    setSession(session ?? null);
  }, [session, setSession]);
}
