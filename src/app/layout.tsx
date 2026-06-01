import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ModalProvider } from "@/components/ModalProvider";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SplashScreen } from "@/components/SplashScreen";
import {
  rootDefaultMetadata,
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
  buildWebsiteJsonLd,
  buildFAQJsonLd,
  buildLocalBusinessJsonLd,
} from "@/lib/seo-constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...rootDefaultMetadata(),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Site Yönetimi",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#4f46e5",
    "theme-color": "#4f46e5",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const jsonLdBlocks = [
  buildOrganizationJsonLd(),
  buildSoftwareApplicationJsonLd(),
  buildWebsiteJsonLd(),
  buildFAQJsonLd(),
  buildLocalBusinessJsonLd(),
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* iOS için apple touch icon */}
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* iOS Safari standalone mod */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Android Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* PWA renk */}
        <meta name="theme-color" content="#4f46e5" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        {/* Viewport — zoom engelleme */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <Script id="pwa-bootstrap" src="/pwa-bootstrap.js" strategy="beforeInteractive" />
      <Script
        id="pwa-standalone-detect"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
                document.documentElement.classList.add('pwa-standalone');
              }
            })();
          `,
        }}
      />
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground">
        {jsonLdBlocks.map((data, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider>
            <ServiceWorkerRegister />
            <SplashScreen />
            <InstallPrompt />
            {children}
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
