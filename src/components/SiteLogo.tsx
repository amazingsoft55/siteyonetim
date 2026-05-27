"use client";

const PRIMARY_MARK = "/icons/app-mark.svg";
const SUPER_MARK = "/icons/super-mark.svg";

type Props = {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  rounded?: boolean;
};

/** Ana logo: tek kaynak olarak `public/icons/app-mark.svg` (PWA ile aynı; mobil uyumlu). */
export function SiteLogo({
  width = 40,
  height = 40,
  className = "",
  alt = "Site Yönetimi logosu",
  rounded = false,
}: Props) {
  return (
    <img
      src={PRIMARY_MARK}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      fetchPriority="high"
      className={[rounded ? "rounded-xl object-cover" : "object-contain", className].filter(Boolean).join(" ")}
    />
  );
}

export function SiteMarkSvg({ width = 40, height = 40, className = "", alt }: Props & { alt?: string }) {
  return (
    <img
      src={PRIMARY_MARK}
      alt={alt ?? "Site Yönetimi işareti"}
      width={width}
      height={height}
      decoding="async"
      className={className}
    />
  );
}

/** Süper yönetici uygulama ikonu — `manifest-super-admin` ile aynı dosya */
export function SuperMarkSvg({ width = 40, height = 40, className = "", alt }: Props & { alt?: string }) {
  return (
    <img
      src={SUPER_MARK}
      alt={alt ?? "Süper yönetici konsolu"}
      width={width}
      height={height}
      decoding="async"
      className={className}
    />
  );
}
