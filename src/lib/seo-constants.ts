import type { Metadata } from "next";
import { getPublicSiteUrl } from "./site-url";
import { SITE_LOGO_PATH } from "./brand";

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
  "apartman site aidat programı",
  "site yönetim programı ücretsiz",
  "aidat toplama uygulaması",
];

export function buildOrganizationJsonLd(): Record<string, unknown> {
  const name = "Site Yönetimi";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: siteUrl,
    logo: `${siteUrl}${SITE_LOGO_PATH}`,
    description:
      "Apartman ve site yöneticileri ile sakinler için aidat, duyuru ve talep süreçlerini tek yerden yöneten güvenli dijital platform.",
    knowsAbout: defaultKeywords.slice(0, 6),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "Turkish",
      email: "destek@siteyonetimi.app",
      telephone: "+90-212-000-00-00",
    },
    sameAs: [],
    address: {
      "@type": "PostalAddress",
      addressLocality: "İstanbul",
      addressCountry: "TR",
    },
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
    offers: {
      "@type": "Offer",
      price: "49",
      priceCurrency: "TRY",
      priceValidUntil: "2026-12-31",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
    },
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
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/arama?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildFAQJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Site yönetimi uygulaması nedir?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Site yönetimi uygulaması, apartman ve site sakinlerinin aidatlarını takip ettiği, duyuruları gördüğü ve arıza taleplerini ileteceği dijital platformdur.",
        },
      },
      {
        "@type": "Question",
        name: "Aidat takibi nasıl yapılır?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Platformumuz üzerinden aidat borçlarınızı, ödeme durumlarınızı ve dekontlarınızı tek ekrandan takip edebilirsiniz. Otomatik hatırlatmalarla gecikme yaşanmaz.",
        },
      },
      {
        "@type": "Question",
        name: "Site yönetimi yazılımı ücretsiz mi?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "14 günlük ücretsiz deneme süresi sunuyoruz. Ardından aylık 49 TL'den başlayan fiyatlarla hizmetimizi kullanmaya devam edebilirsiniz.",
        },
      },
      {
        "@type": "Question",
        name: "Mobil uygulama var mı?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Evet. Android ve iOS için PWA uygulamamız mevcuttur. Uygulama mağazasından indirmenize gerek yok, tarayıcınızdan yükleyebilirsiniz.",
        },
      },
    ],
  };
}

export function buildLocalBusinessJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Site Yönetimi",
    description: "Apartman ve site yönetimi için dijital platform",
    url: siteUrl,
    telephone: "+90-212-000-00-00",
    email: "destek@siteyonetimi.app",
    address: {
      "@type": "PostalAddress",
      addressLocality: "İstanbul",
      addressCountry: "TR",
    },
    priceRange: "$$",
    openingHours: "Mo-Su 00:00-23:59",
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
    icons: {
      icon: [
        { url: SITE_LOGO_PATH, type: "image/png", sizes: "512x512" },
        { url: SITE_LOGO_PATH, type: "image/png", sizes: "any" },
      ],
      apple: [{ url: SITE_LOGO_PATH, sizes: "180x180", type: "image/png" }],
    },
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
      images: [{ url: SITE_LOGO_PATH, width: 512, height: 512, alt: "Site Yönetimi" }],
    },
    twitter: {
      card: "summary_large_image",
      title: title.default,
      description,
    },
  };
}
