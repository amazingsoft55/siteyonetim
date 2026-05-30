"use client";

import * as React from "react";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { NotificationBell } from "@/components/NotificationBell";

/** İstemci: oturum/nabız — kök süper-admin layout bunu sarar */
export default function SuperAdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PresenceHeartbeat />
      <div className="fixed top-4 right-4 z-50">
        <NotificationBell />
      </div>
      {children}
    </>
  );
}
