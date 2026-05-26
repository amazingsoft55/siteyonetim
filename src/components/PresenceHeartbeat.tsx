"use client";

import { useEffect } from "react";

export function PresenceHeartbeat({ intervalMs = 55000 }: { intervalMs?: number }) {
  useEffect(() => {
    async function ping() {
      try {
        if (typeof window === "undefined") return;
        await fetch("/api/presence/ping", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: window.location.pathname }),
          keepalive: true,
        });
      } catch {
        /* sessiz */
      }
    }

    void ping();
    const id = setInterval(() => void ping(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return null;
}
