import type { Metadata, Viewport } from "next";
import { AdminSidebar } from "@/components/AdminSidebar";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  applicationName: "Site Yönetimi — Yönetici",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SY Yönetici",
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
  themeColor: "#e11d48",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminSidebar>{children}</AdminSidebar>;
}
