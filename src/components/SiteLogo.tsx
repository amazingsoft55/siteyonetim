import { SITE_BRAND_NAME } from "@/lib/brand";

type Props = {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  rounded?: boolean;
};

/** Site logosu — SVG tabanlı, harici dosya gerektirmez. */
export function SiteLogo({
  width = 40,
  height = 40,
  className = "",
  alt = `${SITE_BRAND_NAME} logosu`,
  rounded = false,
}: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" rx="${rounded ? Math.floor(width * 0.2) : Math.floor(width * 0.15)}" fill="%234f46e5"/><path d="M${width * 0.28} ${height * 0.72}V${height * 0.38}l${width * 0.22}-${height * 0.13} ${width * 0.22} ${height * 0.13}v${height * 0.34}" stroke="%23fff" stroke-width="${width * 0.05}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M${width * 0.39} ${height * 0.72}v-${height * 0.17}h${width * 0.22}v${height * 0.17}" stroke="%23fff" stroke-width="${width * 0.04}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${width * 0.5}" cy="${height * 0.42}" r="${width * 0.04}" fill="%23fff"/></svg>`)}`}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      fetchPriority="high"
      className={[rounded ? "rounded-xl object-cover" : "object-contain", className].filter(Boolean).join(" ")}
    />
  );
}

/** @deprecated Ayrı süper-admin ikonu yok; ana logo kullanın. */
export function SuperMarkSvg(props: Props & { alt?: string }) {
  return <SiteLogo {...props} alt={props.alt ?? `${SITE_BRAND_NAME} — süper yönetici`} />;
}

/** @deprecated SiteLogo ile aynı. */
export function SiteMarkSvg(props: Props & { alt?: string }) {
  return <SiteLogo {...props} />;
}
