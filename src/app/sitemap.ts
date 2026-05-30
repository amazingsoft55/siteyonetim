import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/hakkimizda`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/iletisim`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/destek`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/gizlilik-politikasi`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/kullanim-sartlari`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/sifremi-unuttum`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  return staticPages;
}
