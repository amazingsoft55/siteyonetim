import type { Metadata, Viewport } from "next";
import SuperAdminProviders from "./super-admin-providers";

/**
 * Süper yönetici alanı için ayrı manifest / ikon ile “kurulumlanabilir ikinci uygulama” hissi:
 * kullanıcı /super-admin açıyken ana ekrana eklerse start_url doğrudan bu panele gider.
 */
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
      { url: "/icons/super-mark.svg", type: "image/svg+xml", sizes: "512x512" },
      { url: "/icons/super-mark.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "192x192" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/super-mark.svg", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#312e81",
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <SuperAdminProviders>{children}</SuperAdminProviders>;
}
