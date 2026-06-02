import type { Metadata } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

const base = getPublicSiteUrl();

export const metadata: Metadata = {
  title: "Site Yönetimi Mobil — Tek Dokunuşla Yükle",
  description:
    "Site Yönetimi mobil uygulamasını tek tıkla indir. Android, iOS ve PC için modern, hızlı ve güvenli.",
  alternates: { canonical: `${base}/mobil` },
};

export default function MobilLayout({ children }: { children: React.ReactNode }) {
  return children;
}
