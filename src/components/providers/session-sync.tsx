"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSessionStore } from "@/stores/session-store";

// Mirrors the Auth.js session into zustand so client components can read
// current user/role without re-subscribing to useSession() everywhere.
// Auth.js's SessionProvider remains the source of truth; this only syncs.
export function SessionSync() {
  const { data: session } = useSession();
  const setSession = useSessionStore((state) => state.setSession);
  const clear = useSessionStore((state) => state.clear);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as { id?: string; name?: string | null; email?: string | null; role?: string };
      setSession({
        id: user.id ?? "",
        name: user.name ?? "",
        email: user.email ?? "",
        role: user.role ?? "traveler",
      });
    } else {
      clear();
    }
  }, [session, setSession, clear]);

  return null;
}
