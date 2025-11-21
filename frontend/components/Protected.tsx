"use client";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";


export default function Protected({ children }: { children: ReactNode }) {
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) router.push("/");
  }, [isPending, session]);

  if (isPending || !session) return <p>Loading...</p>;

  return children;
}
