import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /** better-sqlite3 yalnızca yerel / Node VPS yolunda; Workers paketinden dışarı bırakılır */
  serverExternalPackages: ["better-sqlite3"],
};

initOpenNextCloudflareForDev();

export default nextConfig;
