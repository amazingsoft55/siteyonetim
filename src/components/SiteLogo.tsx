import { SITE_BRAND_NAME, SITE_LOGO_PATH } from "@/lib/brand";

type Props = {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  rounded?: boolean;
};

/** Site logosu — her yerde aynı PNG (`public/logo.png`). */
export function SiteLogo({
  width = 40,
  height = 40,
  className = "",
  alt = `${SITE_BRAND_NAME} logosu`,
  rounded = false,
}: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tek statik marka dosyası; Cloudflare ASSETS ile uyumlu
    <img
      src={SITE_LOGO_PATH}
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
