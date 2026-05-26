"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const ALLOWED_PATHS = new Set(["/", "/iletisim", "/destek", "/hakkimizda"]);

/** Herkese açık sayfalarda günlük ziyaret sinyali (SQLite; bot UA elenir). */
export function PublicVisitBeacon() {
  const pathname = usePathname();

  React.useEffect(() => {
    if (!pathname || !ALLOWED_PATHS.has(pathname)) return;
    const utcDay = new Date().toISOString().slice(0, 10);
    const key = `pv_sent:${utcDay}:${pathname}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      /* private mode */
    }

    async function fire() {
      try {
        const sent = navigator.sendBeacon(
          "/api/telemetry/pageview",
          new Blob([JSON.stringify({ pathname })], { type: "application/json" }),
        );
        if (!sent) {
          await fetch("/api/telemetry/pageview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pathname }),
          });
        }
        try {
          sessionStorage.setItem(key, "1");
        } catch {
          /* skip */
        }
      } catch {
        /* sessiz */
      }
    }

    void fire();
  }, [pathname]);

  return null;
}
