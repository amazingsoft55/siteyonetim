"use client";

import * as React from "react";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { AppDownloadButtons } from "@/components/AppDownloadButtons";

/** İstemci: oturum/nabız — kök süper-admin layout bunu sarar */
export default function SuperAdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PresenceHeartbeat />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <AppDownloadButtons variant="super-admin" />
      </div>
      {children}
    </>
  );
}
