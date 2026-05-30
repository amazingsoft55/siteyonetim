"use client";

import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";

export default function SuperAdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PresenceHeartbeat />
      {children}
    </>
  );
}
