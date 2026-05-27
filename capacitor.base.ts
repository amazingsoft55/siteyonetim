import type { CapacitorConfig } from "@capacitor/cli";

/** Canlı site kökü — Capacitor native kabuk bu adrese bağlanır. */
export function resolveCapacitorServerOrigin(): string {
  const raw =
    process.env.CAPACITOR_SERVER_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";
  return raw.replace(/\/$/, "");
}

export function withRemoteServer(
  config: CapacitorConfig,
  entryPath: string,
): CapacitorConfig {
  const origin = resolveCapacitorServerOrigin();
  if (!origin) {
    return config;
  }
  const path = entryPath.startsWith("/") ? entryPath : `/${entryPath}`;
  return {
    ...config,
    server: {
      url: `${origin}${path}`,
      cleartext: false,
      androidScheme: "https",
    },
  };
}
