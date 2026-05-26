import type { Metadata } from "next";
import { getPublicSiteUrl } from "./site-url";

const siteUrl = getPublicSiteUrl();

export const defaultKeywords = [
  "site yönetimi",
  "apartman yönetim yazılımı",
  "site yönetim sistemi",
  "aidat takip",
  "apartman aidat yazılımı",
  "yönetici paneli apartman",
  "site sakinleri uygulaması",
  "bina site yönetimi",
  "site topluluğu yönetimi",
];

export function buildOrganizationJsonLd(): Record<string, unknown> {
  const name = "Site Yönetimi";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      "Apartman ve site yöneticileri ile sakinler için aidat, duyuru ve talep süreçlerini tek yerden yöneten güvenli dijital platform.",
    knowsAbout: defaultKeywords.slice(0, 6),
  };
}

export function buildSoftwareApplicationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Site Yönetimi",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android, iOS",
    description:
      "Aidat işlemleri, duyurular ve arıza talepleri dahil yaşam alanı yönetimini tek uygulamada toplayan yazılım.",
    url: siteUrl,
    inLanguage: "tr-TR",
  };
}

export function buildWebsiteJsonLd(): Record<string, unknown> {
  const name = "Site Yönetimi";
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: siteUrl,
    inLanguage: "tr-TR",
    publisher: { "@type": "Organization", name, url: siteUrl },
  };
}

/** Kök metadata ve OG/Twitter için ortak alanlar */
export function rootDefaultMetadata(): Metadata {
  const title = {
    default: "Site Yönetimi — Apartman ve Site Yönetim Platformu",
    template: "%s | Site Yönetimi",
  };
  const description =
    "Apartman ve site yöneticilerine özel yazılım: aidat takibi, duyurular, arıza bildirimi ve güvenli sakin iletişimi. Web ve mobilde profesyonel site yönetimi.";

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: defaultKeywords,
    applicationName: "Site Yönetimi",
    category: "business",
    alternates: { canonical: siteUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: siteUrl,
      siteName: "Site Yönetimi",
      title: title.default,
      description,
      images: [{ url: "/logo.png", width: 512, height: 512, alt: "Site Yönetimi" }],
    },
    twitter: {
      card: "summary_large_image",
      title: title.default,
      description,
    },
  };
}
