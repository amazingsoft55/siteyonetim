import { SITE_BRAND_NAME } from "@/lib/brand";

type Props = {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  rounded?: boolean;
};

/** Site logosu — /logo.png dosyasını kullanır. */
export function SiteLogo({
  width = 40,
  height = 40,
  className = "",
  alt = SITE_BRAND_NAME,
  rounded = false,
}: Props) {
  const borderRadius = rounded ? Math.floor(width * 0.22) : Math.floor(width * 0.18);

  return (
    <img
      src="/logo.png"
      alt={alt}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      style={{ borderRadius }}
      draggable={false}
    />
  );
}

/** @deprecated SiteLogo ile aynı. */
export function SuperMarkSvg(props: Props & { alt?: string }) {
  return <SiteLogo {...props} alt={props.alt ?? `${SITE_BRAND_NAME} — süper yönetici`} />;
}

/** @deprecated SiteLogo ile aynı. */
export function SiteMarkSvg(props: Props & { alt?: string }) {
  return <SiteLogo {...props} />;
}
