export type AppDownloadVariant = "site" | "super-admin";

export type DownloadPlatform = "ios" | "android" | "windows" | "linux";

const SITE: Record<DownloadPlatform, string | undefined> = {
  ios: process.env.NEXT_PUBLIC_SITE_DOWNLOAD_IOS,
  android: process.env.NEXT_PUBLIC_SITE_DOWNLOAD_ANDROID,
  windows: process.env.NEXT_PUBLIC_SITE_DOWNLOAD_WINDOWS,
  linux: process.env.NEXT_PUBLIC_SITE_DOWNLOAD_LINUX,
};

const SUPER: Record<DownloadPlatform, string | undefined> = {
  ios: process.env.NEXT_PUBLIC_SUPER_DOWNLOAD_IOS,
  android: process.env.NEXT_PUBLIC_SUPER_DOWNLOAD_ANDROID,
  windows: process.env.NEXT_PUBLIC_SUPER_DOWNLOAD_WINDOWS,
  linux: process.env.NEXT_PUBLIC_SUPER_DOWNLOAD_LINUX,
};

const GENERIC: Record<DownloadPlatform, string | undefined> = {
  ios: process.env.NEXT_PUBLIC_DOWNLOAD_IOS,
  android: process.env.NEXT_PUBLIC_DOWNLOAD_ANDROID,
  windows: process.env.NEXT_PUBLIC_DOWNLOAD_WINDOWS,
  linux: process.env.NEXT_PUBLIC_DOWNLOAD_LINUX,
};

/** Mağaza / APK indirme adresi — boşsa rehber sayfasına gidilir. */
export function getAppDownloadUrl(variant: AppDownloadVariant, platform: DownloadPlatform): string {
  const table = variant === "super-admin" ? SUPER : SITE;
  const direct = table[platform]?.trim();
  if (direct) return direct;
  return GENERIC[platform]?.trim() ?? "";
}

export function mobilGuideHref(variant: AppDownloadVariant, platform: DownloadPlatform): string {
  const app = variant === "super-admin" ? "super" : "site";
  return `/mobil?app=${app}&platform=${platform}#${platform}`;
}
