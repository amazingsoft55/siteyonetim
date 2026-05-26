"use client";

import * as React from "react";

const PNG = "/logo.png";
const FALLBACK_MARK = "/icons/app-mark.svg";

type Props = {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  rounded?: boolean;
};

/**
 * Varsayılan: `public/logo.png` varsa kullanılır; yoksa (404/boş) repodaki vektör işareti yüklenir.
 * Statik PNG yerine doğrudan vektör isterseniz `SiteMarkSvg` kullanın.
 */
export function SiteLogo({
  width = 40,
  height = 40,
  className = "",
  alt = "Site Yönetimi logosu",
  rounded = false,
}: Props) {
  const [src, setSrc] = React.useState<string>(PNG);

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      fetchPriority="high"
      onError={() => setSrc(FALLBACK_MARK)}
      className={[rounded ? "rounded-xl object-cover" : "object-contain", className].filter(Boolean).join(" ")}
    />
  );
}

/** Ana PWA için vektör işareti */
export function SiteMarkSvg({ width = 40, height = 40, className = "", alt }: Props & { alt?: string }) {
  return (
    <img
      src={FALLBACK_MARK}
      alt={alt ?? "Site Yönetimi işareti"}
      width={width}
      height={height}
      decoding="async"
      className={className}
    />
  );
}

/** Süper yönetici PWA / konsol ikonu */
export function SuperMarkSvg({ width = 40, height = 40, className = "", alt }: Props & { alt?: string }) {
  return (
    <img
      src="/icons/super-mark.svg"
      alt={alt ?? "Süper yönetici konsolu"}
      width={width}
      height={height}
      decoding="async"
      className={className}
    />
  );
}
