import { SITE_BRAND_NAME } from "@/lib/brand";

type Props = {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  rounded?: boolean;
};

/** Site logosu — text tabanlı, her cihazda çalışır. */
export function SiteLogo({
  width = 40,
  height = 40,
  className = "",
  alt = `${SITE_BRAND_NAME} logosu`,
  rounded = false,
}: Props) {
  const initials = SITE_BRAND_NAME.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const fontSize = Math.floor(height * 0.42);
  const borderRadius = rounded ? Math.floor(width * 0.22) : Math.floor(width * 0.18);

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-extrabold select-none ${className}`}
      style={{ width, height, borderRadius, fontSize, lineHeight: 1, letterSpacing: "-0.5px" }}
      role="img"
      aria-label={alt}
    >
      {initials}
    </div>
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
