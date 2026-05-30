import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/super-admin/", "/dashboard/", "/api/", "/login", "/sifre-sifirla", "/sifre-belirle"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/super-admin/", "/dashboard/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
