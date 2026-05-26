"use client";

import * as React from "react";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";

/** İstemci: oturum/nabız — kök süper-admin layout bunu sarar */
export default function SuperAdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PresenceHeartbeat />
      {children}
    </>
  );
}
