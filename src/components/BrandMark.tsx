type MarkProps = {
  size?: number;
  className?: string;
  title?: string;
};

/** Ağ isteği gerektirmez — Cloudflare Workers’da /icons 404 olsa bile görünür. */
export function AppBrandMark({ size = 40, className = "", title = "Site Yönetimi" }: MarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="brand" x1="8%" y1="0%" x2="92%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" ry="112" fill="url(#brand)" />
      <g fill="#ffffff" transform="translate(0,16)">
        <path d="M144 392V184l112-72 112 72v208h-48V232l-64-41-64 41v160h-48zm112-392 96 152h-72V88h-48v64h-72z" />
        <rect x="174" y="248" width="36" height="36" rx="6" opacity="0.9" />
        <rect x="238" y="248" width="36" height="36" rx="6" opacity="0.9" />
        <rect x="302" y="248" width="36" height="36" rx="6" opacity="0.9" />
        <rect x="206" y="308" width="36" height="36" rx="6" opacity="0.9" />
        <rect x="270" y="308" width="36" height="36" rx="6" opacity="0.9" />
      </g>
    </svg>
  );
}

export function SuperBrandMark({ size = 40, className = "", title = "Süper yönetici" }: MarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="sa" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="55%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" ry="112" fill="url(#sa)" />
      <g fill="#f8fafc">
        <path d="m256 88 148 74v174c0 72-148 148-148 148S108 408 108 336V162z" opacity="0.18" />
        <path d="m256 128 118 62v154c0 58-118 126-118 126S138 402 138 344V190z" />
      </g>
      <circle cx="256" cy="248" r="44" fill="#fbbf24" stroke="#fef3c7" strokeWidth="8" />
      <rect x="234" y="288" width="44" height="108" rx="12" fill="#fbbf24" stroke="#fef3c7" strokeWidth="8" />
    </svg>
  );
}
