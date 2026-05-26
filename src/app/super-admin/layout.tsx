"use client";

import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PresenceHeartbeat />
      {children}
    </>
  );
}
