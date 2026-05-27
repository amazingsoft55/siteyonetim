"use client";

import * as React from "react";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { MobileInstallPrompt } from "@/components/MobileInstallPrompt";

/** İstemci: oturum/nabız — kök süper-admin layout bunu sarar */
export default function SuperAdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PresenceHeartbeat />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <MobileInstallPrompt variant="super-admin" />
      </div>
      {children}
    </>
  );
}
