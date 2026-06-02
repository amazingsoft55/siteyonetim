"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  Check,
  ChevronRight,
  Cpu,
  Download,
  HardDrive,
  Loader2,
  Sparkles,
  Star,
  Smartphone,
  Tablet,
  Watch,
  Zap,
} from "lucide-react";
import { getAppDownloadUrl } from "@/lib/app-download-links";
import { getPublicSiteUrl } from "@/lib/site-url";

const base = getPublicSiteUrl();
const siteAndroidUrl = getAppDownloadUrl("site", "android");

type Platform = "android" | "ios" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  return "desktop";
}

const FEATURES = [
  { icon: Zap, title: "Işık Hızında", desc: "Yerel performans, anında açılış." },
  { icon: Smartphone, title: "Tüm Cihazlar", desc: "Telefon, tablet, masaüstü — hepsi için." },
  { icon: HardDrive, title: "Düşük Boyut", desc: "Sadece birkaç MB, cihazı yormaz." },
  { icon: Cpu, title: "Modern Altyapı", desc: "React Native + Expo ile sürekli güncel." },
];

export default function MobilPage() {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const apkInfo = useMemo(() => {
    if (!siteAndroidUrl) return null;
    return {
      url: siteAndroidUrl,
      sizeMB: 7.2,
      version: "1.0.0",
    };
  }, []);

  const handleDownload = async (url?: string) => {
    if (!url) return;
    setDownloading(true);
    setDone(false);
    setProgress(0);
    // Görsel ilerleme: tarayıcıda indirme tetiklenir
    const tick = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) {
          clearInterval(tick);
          return 92;
        }
        return p + Math.random() * 14 + 4;
      });
    }, 180);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = "siteyonetim.apk";
      a.rel = "noopener";
      a.target = "_self";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => {
        setProgress(100);
        setDone(true);
        clearInterval(tick);
      }, 1400);
    } catch {
      window.location.href = url;
      setProgress(100);
      setDone(true);
      clearInterval(tick);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-zinc-950 text-white">
      {/* Arka plan: animasyonlu gradient blob'lar */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-indigo-500/40 to-fuchsia-500/30 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -right-32 h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-violet-500/40 to-pink-500/30 blur-3xl animate-pulse"
          style={{ animationDelay: "1.2s" }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[320px] w-[320px] rounded-full bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 blur-3xl animate-pulse"
          style={{ animationDelay: "2.4s" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 py-12 sm:py-20">
        {/* Üst rozet */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-pink-200 bg-clip-text text-transparent">
            Yeni sürüm yayında · v{apkInfo?.version ?? "1.0.0"}
          </span>
        </div>

        {/* Logo */}
        <div className="relative mt-8 sm:mt-10">
          <div className="absolute inset-0 -z-10 rounded-[36px] bg-gradient-to-br from-indigo-500 to-fuchsia-500 blur-2xl opacity-60 animate-pulse" />
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-[32px] ring-1 ring-white/20 shadow-2xl shadow-indigo-500/40">
            <img src="/logo.png" alt="Site Yönetimi" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Başlık */}
        <h1 className="mt-8 text-center text-4xl font-extrabold tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-br from-white via-indigo-100 to-fuchsia-200 bg-clip-text text-transparent">
            Site Yönetimi
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
            avucunuzda.
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-center text-base leading-relaxed text-zinc-300 sm:text-lg">
          Aidat, duyuru ve arıza talepleri{" "}
          <span className="font-bold text-white">tek dokunuşta</span>. Modern, hızlı ve güvenli —
          sitenizin tüm ihtiyaçları için tek uygulama.
        </p>

        {/* Cihaz rozetleri */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <PlatformChip active={platform === "android"} icon={<Smartphone className="h-3.5 w-3.5" />} label="Android" />
          <PlatformChip active={platform === "ios"} icon={<Tablet className="h-3.5 w-3.5" />} label="iOS" />
          <PlatformChip active={platform === "desktop"} icon={<Watch className="h-3.5 w-3.5" />} label="PC / Web" />
        </div>

        {/* ANA BUTON — Yükle */}
        <div className="mt-10 w-full max-w-md">
          {apkInfo ? (
            <DownloadButton
              downloading={downloading}
              done={done}
              progress={progress}
              sizeMB={apkInfo.sizeMB}
              version={apkInfo.version}
              onClick={() => handleDownload(apkInfo.url)}
            />
          ) : (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-center text-sm text-amber-200">
              APK henüz yayında. Yöneticiniz mağaza bağlantısı paylaştığında buradan inecek.
            </div>
          )}

          {/* Diğer platformlar */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SecondaryButton
              icon={<Tablet className="h-4 w-4" />}
              label="iPhone / iPad"
              sub="Yakında — App Store"
              onClick={() => {
                if (platform === "ios") {
                  window.location.href = `${base}/pwa-install`;
                }
              }}
            />
            <SecondaryButton
              icon={<Watch className="h-4 w-4" />}
              label="Windows / Mac"
              sub="PWA olarak kullan"
              onClick={() => {
                window.location.href = `${base}/pwa-install`;
              }}
            />
          </div>
        </div>

        {/* Özellikler */}
        <div className="mt-14 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-indigo-500/10"
              style={{ animation: `fade-up 0.5s ease-out ${i * 80}ms both` }}
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 ring-1 ring-white/10">
                <f.icon className="h-4 w-4 text-indigo-200" />
              </div>
              <div className="text-sm font-bold text-white">{f.title}</div>
              <div className="mt-0.5 text-xs text-zinc-400">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Kullanıcı yorumu / sosyal kanıt */}
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-sm font-bold text-white">4.9</span>
            <span className="text-xs text-zinc-400">· Beta kullanıcılarından</span>
          </div>
        </div>

        {/* Footer linkler */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-zinc-500">
          <a href={`${base}/paketler`} className="hover:text-zinc-300">
            Paketler
          </a>
          <a href={`${base}/destek`} className="hover:text-zinc-300">
            Destek
          </a>
          <a href={`${base}/gizlilik-politikasi`} className="hover:text-zinc-300">
            Gizlilik
          </a>
          <a href={`${base}/kullanim-sartlari`} className="hover:text-zinc-300">
            Şartlar
          </a>
          <span className="text-zinc-600">·</span>
          <span>© {new Date().getFullYear()} Site Yönetimi</span>
        </div>
      </main>

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function PlatformChip({ active, icon, label }: { active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
        active
          ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30"
          : "border border-white/10 bg-white/5 text-zinc-300"
      }`}
    >
      {icon}
      {label}
    </span>
  );
}

function DownloadButton({
  downloading,
  done,
  progress,
  sizeMB,
  version,
  onClick,
}: {
  downloading: boolean;
  done: boolean;
  progress: number;
  sizeMB: number;
  version: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={downloading}
      className="group relative w-full overflow-hidden rounded-3xl p-[2px] shadow-2xl shadow-indigo-500/30 transition hover:shadow-fuchsia-500/40 active:scale-[0.99] disabled:cursor-wait"
    >
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,theme(colors.indigo.500),theme(colors.fuchsia.500),theme(colors.pink.500),theme(colors.indigo.500))] animate-[spin_6s_linear_infinite] opacity-90 group-hover:opacity-100" />
      <div className="relative flex items-center justify-between gap-3 rounded-[22px] bg-zinc-950/90 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/40">
            {done ? (
              <Check className="h-6 w-6 text-white" />
            ) : downloading ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : (
              <Download className="h-6 w-6 text-white transition group-hover:translate-y-0.5" />
            )}
          </div>
          <div className="text-left">
            <div className="text-base font-extrabold leading-tight text-white sm:text-lg">
              {done ? "İndirme Başladı ✓" : downloading ? "İndiriliyor…" : "Şimdi Yükle"}
            </div>
            <div className="text-[11px] font-medium text-zinc-400">
              {done
                ? "Bildirimden açıp kurabilirsiniz"
                : downloading
                  ? `v${version} · ${sizeMB} MB`
                  : `Android · v${version} · ${sizeMB} MB`}
            </div>
          </div>
        </div>
        <ArrowDownToLine className="h-5 w-5 text-zinc-300 transition group-hover:translate-y-0.5 group-hover:text-white" />
      </div>

      {downloading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 transition-all duration-200"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </button>
  );
}

function SecondaryButton({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-white">{label}</div>
        <div className="text-[11px] text-zinc-400">{sub}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
    </button>
  );
}
