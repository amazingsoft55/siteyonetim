"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  Cpu,
  Eye,
  Gauge,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { describeFailedResponse } from "@/lib/json-error";
import { SuperAdminTopBar } from "@/components/SuperAdminTopBar";

type SiteRow = { id: string; name: string; address: string | null; createdAt: string | null };

type DashboardPayload = {
  ok: boolean;
  freshAt: string;
  dbLatencyMs: number | null;
  presenceWindowMinutes: number;
  totals: { sites: number; users: number; byRole: Record<string, number> };
  live: { onlineAuthenticatedUsersApprox: number; distinctLoginsLast24h: number };
  publicSite: { pageViewsTrackedTodayUtc: number; coverage: string };
  operations: {
    openAdminSupportTickets: number;
    openResidentRequests: number;
    openPublicContactMessages?: number;
  };
  pageSpeed: {
    configured: boolean;
    cached: Record<string, unknown> | null;
    analyzeHint?: string;
  };
  platformExplain?: string;
};

function ScoreOrb({ label, value }: { label: string; value: number | null | undefined }) {
  const n = value == null || Number.isNaN(Number(value)) ? null : Math.round(Number(value));
  const hue =
    n === null ? "border-zinc-300 dark:border-zinc-600"
    : n >= 90 ? "border-emerald-400 shadow-emerald-400/20"
    : n >= 70 ? "border-indigo-400 shadow-indigo-400/20"
    : "border-amber-400 shadow-amber-400/20";
  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl border-2 bg-white/80 dark:bg-zinc-900/60 ${hue} shadow-sm min-w-[104px]`}>
      <span className="text-[10px] uppercase font-bold tracking-wide text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="mt-1 text-xl font-black tabular-nums text-zinc-950 dark:text-white">{n ?? "—"}</span>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [sites, setSites] = React.useState<SiteRow[]>([]);
  const [dash, setDash] = React.useState<DashboardPayload | null>(null);
  const [loadErr, setLoadErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [psiBusy, setPsiBusy] = React.useState(false);
  const [tick, setTick] = React.useState(0);
  const [siteQ, setSiteQ] = React.useState("");

  const filteredSites = React.useMemo(
    () =>
      sites.filter((s) =>
        `${s.name} ${s.address ?? ""}`.toLowerCase().includes(siteQ.trim().toLowerCase()),
      ),
    [sites, siteQ],
  );

  const loadAll = React.useCallback(async () => {
    setLoadErr("");
    try {
      const fetchOpts = { credentials: "include" as const };
      const [dr, sr] = await Promise.all([
        fetch("/api/super-admin/dashboard", fetchOpts),
        fetch("/api/super-admin/sites", fetchOpts),
      ]);
      const dashText = await dr.text();
      if (!dr.ok) {
        setLoadErr(describeFailedResponse(dr.status, dashText, "Özet yüklenemedi."));
        setDash(null);
        return;
      }

      let dJson: DashboardPayload;
      try {
        dJson = JSON.parse(dashText) as DashboardPayload;
      } catch {
        setLoadErr(`Özet JSON okunamadı [HTTP ${dr.status}].`);
        setDash(null);
        return;
      }
      if (dJson && typeof dJson === "object" && dJson.ok === false) {
        setLoadErr(
          describeFailedResponse(
            dr.status,
            dashText,
            "Özet API başarısız.",
          ),
        );
        setDash(null);
        return;
      }
      setDash(dJson);

      const sitesText = await sr.text();
      if (!sr.ok) {
        setLoadErr(describeFailedResponse(sr.status, sitesText, "Siteler yüklenemedi (özet geldi)."));
        setSites([]);
        return;
      }
      let sJson: unknown;
      try {
        sJson = JSON.parse(sitesText) as unknown;
      } catch {
        setLoadErr("Siteler listesi JSON olarak okunamadı.");
        setSites([]);
        return;
      }
      setSites(Array.isArray(sJson) ? sJson : []);
    } catch {
      setLoadErr("Bağlantı hatası (ağ veya tarayıcı isteği koparıldı). Tekrar deneyin.");
      setDash(null);
    }
  }, []);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll, tick]);

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 45_000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
    router.push("/login");
  };

  async function refreshNow() {
    setBusy(true);
    await loadAll();
    setBusy(false);
  }

  async function runPageSpeed() {
    setPsiBusy(true);
    setLoadErr("");
    try {
      const res = await fetch("/api/super-admin/insights/pagespeed", { method: "POST", credentials: "include" });
      const bodyText = await res.text().catch(() => "");
      if (!res.ok) {
        setLoadErr(describeFailedResponse(res.status, bodyText, "Lighthouse güncellenemedi."));
      } else {
        await loadAll();
      }
    } catch {
      setLoadErr("Lighthouse isteği başarısız.");
    }
    setPsiBusy(false);
  }

  const adminCount = dash?.totals?.byRole?.ADMIN ?? 0;
  const superCount = dash?.totals?.byRole?.SUPER_ADMIN ?? 0;
  const userCountOnly = dash?.totals?.byRole?.USER ?? 0;

  const cachedPsi = dash?.pageSpeed?.cached as
    | {
        scores?: {
          performance?: number | null;
          seo?: number | null;
          accessibility?: number | null;
          bestPractices?: number | null;
        };
        fetchedAt?: string;
        analyzedUrl?: string;
      }
    | null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 via-zinc-50 to-white dark:from-[#060a12] dark:via-[#0b0f19] dark:to-zinc-950 text-zinc-900 dark:text-zinc-100">
      <SuperAdminTopBar
        title="Süper yönetici merkezi"
        subtitle={
          <span className="inline-flex items-center gap-2">
            <span
              className={`inline-flex h-2 w-2 shrink-0 rounded-full ${dash ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
            />
            {dash?.freshAt ? `Ölçüm: ${new Date(dash.freshAt).toLocaleString("tr-TR")}` : "Ölçüm bekleniyor…"}
          </span>
        }
        actions={
          <>
            <button
              type="button"
              onClick={refreshNow}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
              Yenile
            </button>
            <Link
              href="/mobil?app=super"
              className="hidden sm:inline-flex text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Süper admin uygulaması
            </Link>
            <Link
              href="/super-admin/kullanicilar"
              className="hidden sm:inline-flex text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Kullanıcılar
            </Link>
            <Link
              href="/super-admin/hesabim"
              className="hidden sm:inline-flex text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Hesabım
            </Link>
            <Link
              href="/super-admin/destek"
              className="hidden sm:inline-flex text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Destek
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              Çıkış
            </button>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {loadErr && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-950 dark:text-amber-100 space-y-2">
            <p className="font-semibold">{loadErr}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/kurulum" className="text-xs font-bold underline text-indigo-700 dark:text-indigo-400">
                Kurulum ve veritabanı kontrolü
              </Link>
              <button type="button" onClick={refreshNow} className="text-xs font-bold underline">
                Tekrar dene
              </button>
            </div>
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/super-admin/kullanicilar", title: "Siteler & kullanıcılar", desc: "Hesap ve proje yönetimi", icon: Users },
            { href: "/super-admin/destek", title: "Destek talepleri", desc: "Yönetici destek kuyruğu", icon: Activity },
            { href: "/kurulum", title: "Kurulum rehberi", desc: "Şema ve ortam değişkenleri", icon: Gauge },
            { href: "/api/setup/status", title: "Kurulum durumu API", desc: "Sağlık ve teşhis (JSON)", icon: Cpu },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/50 p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors flex gap-3"
            >
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 h-fit shrink-0">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {c.title}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">{c.desc}</p>
              </div>
            </Link>
          ))}
        </section>

        {!dash && !loadErr && (
          <div className="grid gap-4 md:grid-cols-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/60" />
            ))}
          </div>
        )}

        {dash && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative overflow-hidden rounded-3xl border border-indigo-200/60 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-xl shadow-indigo-900/20">
                <Cpu className="absolute right-4 top-4 h-16 w-16 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-100/90">Veritabanı yanıt süresi</p>
                <p className="mt-2 text-3xl font-black tabular-nums">
                  {dash.dbLatencyMs != null ? `${dash.dbLatencyMs} ms` : "—"}
                </p>
                <p className="mt-2 text-[11px] leading-snug text-indigo-100/85 max-w-[18rem]">
                  SQLite gidiş-dönüş süresi (ms); örnek anlık ölçüm.
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">Aktif oturum (yaklaşık)</span>
                </div>
                <p className="mt-3 text-3xl font-black tabular-nums">{dash.live.onlineAuthenticatedUsersApprox}</p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Son {dash.presenceWindowMinutes} dakikada /api/presence/ping sinyali alan oturumlar (yönetici & sakin
                  panelleri dahil).
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">Bugün görüntülenme</span>
                </div>
                <p className="mt-3 text-3xl font-black tabular-nums">{dash.publicSite.pageViewsTrackedTodayUtc}</p>
                <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{dash.publicSite.coverage}</p>
              </div>

              <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">Son 24s giriş</span>
                </div>
                <p className="mt-3 text-3xl font-black tabular-nums">{dash.live.distinctLoginsLast24h}</p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  last_login_at alanına göre güncel hesapların sayısı.
                </p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-lg font-black flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-violet-500" />
                      Lighthouse (Google PageSpeed)
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Mobil strateji; sahada ölçülen gerçek Lighthouse skoru. Ana URL: NEXT_PUBLIC_SITE_URL
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={runPageSpeed}
                    disabled={psiBusy || !dash.pageSpeed?.configured}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md disabled:opacity-45"
                  >
                    <Search className="h-3.5 w-3.5" />
                    {psiBusy ? "Çalışıyor…" : "Lighthouse güncelle"}
                  </button>
                </div>

                {!dash.pageSpeed?.configured ? (
                  <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 p-6 text-sm text-zinc-600 dark:text-zinc-300">
                    {dash.pageSpeed?.analyzeHint ??
                      "GOOGLE_PAGESPEED_API_KEY ile PageSpeed Insights etkinleşir."}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <ScoreOrb label="SEO" value={cachedPsi?.scores?.seo ?? null} />
                    <ScoreOrb label="Performans" value={cachedPsi?.scores?.performance ?? null} />
                    <ScoreOrb label="Erişilebilirlik" value={cachedPsi?.scores?.accessibility ?? null} />
                    <ScoreOrb label="En iyi pratikler" value={cachedPsi?.scores?.bestPractices ?? null} />
                  </div>
                )}

                {cachedPsi?.fetchedAt && (
                  <p className="mt-4 text-[11px] text-zinc-400">
                    Son analiz: {new Date(cachedPsi.fetchedAt).toLocaleString("tr-TR")}
                    {cachedPsi.analyzedUrl ? ` · ${cachedPsi.analyzedUrl}` : ""}
                  </p>
                )}
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-sm">
                  <h3 className="text-sm font-black uppercase tracking-wide text-zinc-500 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" /> Operasyon
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <span className="text-zinc-600 dark:text-zinc-400">Açık iletişim / ziyaretçi</span>
                      <span className="font-bold">{dash.operations.openPublicContactMessages ?? 0}</span>
                    </li>
                    <li className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <span className="text-zinc-600 dark:text-zinc-400">Açık yönetici destek</span>
                      <span className="font-bold">{dash.operations.openAdminSupportTickets}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Açık sakin talebi</span>
                      <span className="font-bold">{dash.operations.openResidentRequests}</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-3xl border border-indigo-200/50 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 text-xs leading-relaxed text-indigo-950 dark:text-indigo-100">
                  <strong>Not:</strong> {dash.platformExplain}
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-4">
              {[
                {
                  icon: Building2,
                  title: "Siteler",
                  value: dash.totals.sites,
                  subtitle: "Kayıtlı projeler",
                },
                {
                  icon: Shield,
                  title: "Süper yön.",
                  value: superCount,
                  subtitle: "Platform kullanıcıları",
                },
                {
                  icon: Users,
                  title: "Yöneticiler",
                  value: adminCount,
                  subtitle: "Siteler ADMIN",
                },
                {
                  icon: Users,
                  title: "Sakinler",
                  value: userCountOnly,
                  subtitle: "Uç kullanıcı",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/50 p-4 flex gap-4 items-center shadow-sm"
                >
                  <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <c.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500">{c.title}</p>
                    <p className="text-2xl font-black">{c.value}</p>
                    <p className="text-[11px] text-zinc-400">{c.subtitle}</p>
                  </div>
                </div>
              ))}
            </section>

            <div className="text-[11px] text-zinc-400">
              Roller detayı (canlı veri):{" "}
              {Object.entries(dash.totals.byRole)
                .filter(([, n]) => n > 0)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" · ") || "—"}
            </div>
          </>
        )}

        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm overflow-hidden">
          <div className="flex flex-col gap-4 p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/40 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 min-w-0">
              <h2 className="text-lg font-black">Siteler tablosu</h2>
              <p className="text-xs text-zinc-500">
                SQLite’dan canlı liste. Arama tablo üzerinde süzme yapar ({filteredSites.length}/{sites.length}
                site).
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="search"
                  value={siteQ}
                  onChange={(e) => setSiteQ(e.target.value)}
                  placeholder="Site veya adres ara…"
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 py-2.5 pl-10 pr-3 text-sm"
                />
              </div>
              <Link href="/super-admin/kullanicilar" className="inline-flex shrink-0 items-center justify-center gap-1 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-2xl">
                Tam yönetim <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[11px] uppercase font-bold text-zinc-500">
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-4">Adres</th>
                  <th className="py-3 px-4">Kayıt</th>
                  <th className="py-3 px-4">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-indigo-50/40 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4 font-semibold">{s.name}</td>
                    <td className="py-3 px-4 text-sm text-zinc-500">{s.address ?? "—"}</td>
                    <td className="py-3 px-4 text-sm text-zinc-500">{s.createdAt ?? "—"}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/super-admin/kullanicilar?siteId=${encodeURIComponent(s.id)}`}
                        className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        İnsanları yönet
                      </Link>
                    </td>
                  </tr>
                ))}
                {sites.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 px-4 text-center text-zinc-500 text-sm">
                      Henüz site yok. Kullanıcılar sayfasından ekleyebilirsiniz.
                    </td>
                  </tr>
                )}
                {sites.length > 0 && filteredSites.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 px-4 text-center text-zinc-500 text-sm">
                      Aramanıza uyan site yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
