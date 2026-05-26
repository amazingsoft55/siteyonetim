import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicSiteUrl();
  const paths = ["", "/iletisim", "/destek", "/hakkimizda"] as const;
  const lastModified = new Date();
  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.72,
  }));
}
