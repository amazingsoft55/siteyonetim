import * as React from "react";

type Props = {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  rounded?: boolean;
};

/**
 * PWA yüklemede basit <img> kullanır; böylece manifest’ten yüklenirken proxy yoluna takılmaz.
 * statik public kökünden doğrudan img ile yüklenir.
 */
export function SiteLogo({
  width = 40,
  height = 40,
  className = "",
  alt = "Site Yönetimi logosu",
  rounded = false,
}: Props) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      fetchPriority="high"
      className={[rounded ? "rounded-xl object-cover" : "object-contain", className].filter(Boolean).join(" ")}
    />
  );
}

/** Ana PWA için vektör yedek (boyut bildirimi: any — tarayıcı ölçekler) */
export function SiteMarkSvg({ width = 40, height = 40, className = "", alt }: Props & { alt?: string }) {
  return (
    <img
      src="/icons/app-mark.svg"
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
