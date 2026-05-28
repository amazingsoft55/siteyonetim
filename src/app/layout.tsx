import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import {
  rootDefaultMetadata,
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
  buildWebsiteJsonLd,
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
    statusBarStyle: "default",
    title: "Site Yönetimi",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

const jsonLdBlocks = [
  buildOrganizationJsonLd(),
  buildSoftwareApplicationJsonLd(),
  buildWebsiteJsonLd(),
];

/** PWA: service worker + beforeinstallprompt sayfa yüklenmeden yakalanır. */
const pwaBootstrapScript = `
(function(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});
  }
  window.__deferredPwaInstall=null;
  window.__pwaInstallListeners=[];
  window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();
    window.__deferredPwaInstall=e;
    var list=window.__pwaInstallListeners||[];
    for(var i=0;i<list.length;i++){try{list[i](e);}catch(x){}}
  });
})();
`;

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
      <Script id="pwa-bootstrap" strategy="beforeInteractive">
        {pwaBootstrapScript}
      </Script>
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
          <ServiceWorkerRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
