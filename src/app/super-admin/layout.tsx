import type { Metadata, Viewport } from "next";
import { SuperAdminSidebar } from "@/components/SuperAdminSidebar";

export const metadata: Metadata = {
  manifest: "/manifest-super-admin.json",
  applicationName: "Site Yönetimi — Süper Yönetici",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SY Süper",
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
      { url: "/logo.png", type: "image/png", sizes: "any" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#312e81",
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <SuperAdminSidebar>{children}</SuperAdminSidebar>;
}
