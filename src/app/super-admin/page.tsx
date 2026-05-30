"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Clock,
  CreditCard,
  Cpu,
  Eye,
  Gauge,
  LifeBuoy,
  LogOut,
  Puzzle,
  RefreshCw,
  Search,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { describeFailedResponse } from "@/lib/json-error";

type SiteRow = { id: string; name: string; address: string | null; plan: string; createdAt: string | null };

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
  const color =
    n === null ? "text-zinc-400 border-zinc-200 dark:border-zinc-700"
    : n >= 90 ? "text-emerald-500 border-emerald-400 shadow-emerald-400/30"
    : n >= 70 ? "text-indigo-500 border-indigo-400 shadow-indigo-400/30"
    : "text-amber-500 border-amber-400 shadow-amber-400/30";

  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl border-2 bg-white dark:bg-zinc-900/80 ${color} shadow-sm min-w-[100px] transition-all hover:scale-105`}>
      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className={`mt-1 text-2xl font-black tabular-nums ${color.split(" ")[0]}`}>{n ?? "—"}</span>
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
        setLoadErr(describeFailedResponse(dr.status, dashText, "Özet API başarısız."));
        setDash(null);
        return;
      }
      setDash(dJson);

      const sitesText = await sr.text();
      if (!sr.ok) {
        setLoadErr(describeFailedResponse(sr.status, sitesText, "Siteler yüklenemedi."));
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
      setLoadErr("Bağlantı hatası.");
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
      if (!res.ok) setLoadErr(describeFailedResponse(res.status, bodyText, "Lighthouse güncellenemedi."));
      else await loadAll();
    } catch {
      setLoadErr("Lighthouse isteği başarısız.");
    }
    setPsiBusy(false);
  }

  const adminCount = dash?.totals?.byRole?.ADMIN ?? 0;
  const superCount = dash?.totals?.byRole?.SUPER_ADMIN ?? 0;
  const userCountOnly = dash?.totals?.byRole?.USER ?? 0;

  const cachedPsi = dash?.pageSpeed?.cached as
    | { scores?: { performance?: number | null; seo?: number | null; accessibility?: number | null; bestPractices?: number | null }; fetchedAt?: string; analyzedUrl?: string }
    | null;

  return (
    <div className="min-h-full bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-[#060a12] dark:via-[#0b0f19] dark:to-indigo-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              Merhaba, Süper Yönetici
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${dash ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {dash?.freshAt
                ? `Son güncelleme: ${new Date(dash.freshAt).toLocaleString("tr-TR")}`
                : "Veriler yükleniyor…"}
            </p>
          </div>
          <button
            type="button"
            onClick={refreshNow}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 shadow-sm transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
            Yenile
          </button>
        </div>

        {/* ── Error ── */}
        {loadErr && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-950 dark:text-amber-100">
            <p className="font-semibold">{loadErr}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link href="/kurulum" className="text-xs font-bold underline text-indigo-700 dark:text-indigo-400">Kurulum rehberi</Link>
              <button type="button" onClick={refreshNow} className="text-xs font-bold underline">Tekrar dene</button>
            </div>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/super-admin/kullanicilar", title: "Kullanıcılar", desc: "Site ve hesap yönetimi", icon: Users, gradient: "from-blue-500 to-cyan-500" },
            { href: "/super-admin/destek", title: "Destek", desc: "Talep ve mesaj yönetimi", icon: LifeBuoy, gradient: "from-violet-500 to-purple-500" },
            { href: "/super-admin/features", title: "Özellikler", desc: "Platform özellikleri", icon: Puzzle, gradient: "from-pink-500 to-rose-500" },
            { href: "/super-admin/plans", title: "Paketler", desc: "Fiyatlandırma yönetimi", icon: CreditCard, gradient: "from-emerald-500 to-teal-500" },
            { href: "/kurulum", title: "Kurulum", desc: "Sistem yapılandırması", icon: Settings, gradient: "from-amber-500 to-orange-500" },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${c.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${c.gradient} text-white shadow-lg mb-3`}>
                <c.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{c.title}</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{c.desc}</p>
              <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors" />
            </Link>
          ))}
        </div>

        {/* ── Loading skeleton ── */}
        {!dash && !loadErr && (
          <div className="grid gap-4 md:grid-cols-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-zinc-200/80 dark:bg-zinc-800/60" />
            ))}
          </div>
        )}

        {dash && (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* DB Latency - Hero Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-xl shadow-indigo-900/20">
                <Cpu className="absolute -right-2 -top-2 h-20 w-20 opacity-10" />
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-100/80">Veritabanı</p>
                  <p className="mt-2 text-4xl font-black tabular-nums">
                    {dash.dbLatencyMs != null ? `${dash.dbLatencyMs}` : "—"}
                  </p>
                  <p className="text-sm font-medium text-indigo-100/70">ms yanıt süresi</p>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-500/10" />
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">Canlı Oturum</span>
                </div>
                <p className="mt-3 text-4xl font-black tabular-nums text-zinc-900 dark:text-zinc-50">
                  {dash.live.onlineAuthenticatedUsersApprox}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Son {dash.presenceWindowMinutes} dakika
                </p>
              </div>

              {/* Page Views */}
              <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-blue-500/10" />
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">Görüntülenme</span>
                </div>
                <p className="mt-3 text-4xl font-black tabular-nums text-zinc-900 dark:text-zinc-50">
                  {dash.publicSite.pageViewsTrackedTodayUtc}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Bugün</p>
              </div>

              {/* 24h Logins */}
              <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-500/10" />
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">Son 24s Giriş</span>
                </div>
                <p className="mt-3 text-4xl font-black tabular-nums text-zinc-900 dark:text-zinc-50">
                  {dash.live.distinctLoginsLast24h}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Benzersiz kullanıcı</p>
              </div>
            </div>

            {/* ── Lighthouse + Operations ── */}
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Lighthouse */}
              <div className="lg:col-span-3 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-lg font-black flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                      <Gauge className="h-5 w-5 text-violet-500" />
                      Lighthouse Skorları
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Mobil PageSpeed analizi</p>
                  </div>
                  <button
                    type="button"
                    onClick={runPageSpeed}
                    disabled={psiBusy || !dash.pageSpeed?.configured}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-600/20 hover:shadow-xl disabled:opacity-45 transition-all"
                  >
                    <Search className="h-3.5 w-3.5" />
                    {psiBusy ? "Çalışıyor…" : "Güncelle"}
                  </button>
                </div>

                {!dash.pageSpeed?.configured ? (
                  <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 p-6 text-sm text-zinc-600 dark:text-zinc-300">
                    {dash.pageSpeed?.analyzeHint ?? "GOOGLE_PAGESPEED_API_KEY ile etkinleşir."}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <ScoreOrb label="SEO" value={cachedPsi?.scores?.seo ?? null} />
                    <ScoreOrb label="Performans" value={cachedPsi?.scores?.performance ?? null} />
                    <ScoreOrb label="Erişilebilirlik" value={cachedPsi?.scores?.accessibility ?? null} />
                    <ScoreOrb label="Pratikler" value={cachedPsi?.scores?.bestPractices ?? null} />
                  </div>
                )}

                {cachedPsi?.fetchedAt && (
                  <p className="mt-4 text-[11px] text-zinc-400">
                    Son analiz: {new Date(cachedPsi.fetchedAt).toLocaleString("tr-TR")}
                    {cachedPsi.analyzedUrl ? ` · ${cachedPsi.analyzedUrl}` : ""}
                  </p>
                )}
              </div>

              {/* Operations */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-sm">
                  <h3 className="text-sm font-black uppercase tracking-wide text-zinc-500 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" /> Operasyon
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                      <span className="text-zinc-600 dark:text-zinc-400">İletişim mesajları</span>
                      <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{dash.operations.openPublicContactMessages ?? 0}</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                      <span className="text-zinc-600 dark:text-zinc-400">Yönetici destek</span>
                      <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{dash.operations.openAdminSupportTickets}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-zinc-600 dark:text-zinc-400">Sakin talepleri</span>
                      <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{dash.operations.openResidentRequests}</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-indigo-200/50 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 text-xs leading-relaxed text-indigo-950 dark:text-indigo-100">
                  <strong>Not:</strong> {dash.platformExplain}
                </div>
              </div>
            </div>

            {/* ── User Counts ── */}
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { icon: Building2, title: "Siteler", value: dash.totals.sites, color: "from-indigo-500 to-violet-500" },
                { icon: Shield, title: "Süper Yön.", value: superCount, color: "from-rose-500 to-pink-500" },
                { icon: Users, title: "Yöneticiler", value: adminCount, color: "from-amber-500 to-orange-500" },
                { icon: Users, title: "Sakinler", value: userCountOnly, color: "from-emerald-500 to-teal-500" },
              ].map((c) => (
                <div
                  key={c.title}
                  className="relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/50 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${c.color} opacity-10`} />
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${c.color} text-white shadow-lg`}>
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-500">{c.title}</p>
                      <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{c.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Sites Table ── */}
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm overflow-hidden">
          <div className="flex flex-col gap-4 p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/40 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-50">Siteler</h2>
              <p className="text-xs text-zinc-500 mt-1">{filteredSites.length}/{sites.length} site gösteriliyor</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="search"
                  value={siteQ}
                  onChange={(e) => setSiteQ(e.target.value)}
                  placeholder="Site ara…"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 py-2.5 pl-10 pr-3 text-sm"
                />
              </div>
              <Link href="/super-admin/kullanicilar" className="inline-flex shrink-0 items-center justify-center gap-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all">
                Tümünü yönet <ArrowRight className="h-4 w-4" />
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
                  <tr key={s.id} className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-indigo-50/40 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">{s.name}</td>
                    <td className="py-3 px-4 text-sm text-zinc-500">{s.address ?? "—"}</td>
                    <td className="py-3 px-4 text-sm text-zinc-500">{s.createdAt ?? "—"}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/super-admin/kullanicilar?siteId=${encodeURIComponent(s.id)}`}
                        className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Yönet <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {sites.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 px-4 text-center text-zinc-500 text-sm">
                      Henüz site yok.
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

      </div>
    </div>
  );
}
