"use client";

import * as React from "react";
import Link from "next/link";

type SetupBanner =
  | { kind: "ok"; text: string }
  | { kind: "warn"; text: string }
  | {
      kind: "err";
      code?: string;
      message?: string;
      steps?: string[];
      sqliteFilePath?: string;
    };

/** Canlı kurulum / veritabanı durumu — yalnızca teknik rehber sayfasında gösterilir. */
export function KurulumStatusPanel() {
  const [setupBanner, setSetupBanner] = React.useState<SetupBanner | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/setup/status")
      .then((r) => r.json().catch(() => null))
      .then((data) => {
        if (cancelled) return;
        setLoading(false);
        if (!data || typeof data !== "object") return;
        const d = data as {
          ok?: boolean;
          code?: string;
          message?: string;
          needsSeed?: boolean;
          hasSupportTicketsTable?: boolean;
          steps?: string[];
          sqliteFilePath?: string;
        };
        if (d.ok === false) {
          setSetupBanner({
            kind: "err",
            code: typeof d.code === "string" ? d.code : undefined,
            message: typeof d.message === "string" ? d.message : "Veritabanı şu anda kullanılamıyor.",
            steps: Array.isArray(d.steps) ? d.steps.filter((s): s is string => typeof s === "string") : [],
            sqliteFilePath: typeof d.sqliteFilePath === "string" ? d.sqliteFilePath : undefined,
          });
          return;
        }
        if (d.needsSeed) {
          setSetupBanner({
            kind: "warn",
            text:
              "Henüz ilk site veya kullanıcı kaydı yok. Şemayı uygulayın (`npm run db:apply` veya D1 için `npm run db:d1:remote`) ve kullanıcıları süper yönetici panelinden oluşturun; tablolar tamamen boşsa `.env` ile `/api/seed` kullanılabilir.",
          });
          return;
        }
        if (d.ok && d.hasSupportTicketsTable === false) {
          setSetupBanner({
            kind: "warn",
            text: "Bazı şema tabloları eksik olabilir. `drizzle/full-schema.sql` dosyasını `npm run db:apply` veya D1 için `npm run db:d1:remote` ile yeniden uygulayın.",
          });
          return;
        }
        if (d.ok) {
          setSetupBanner({ kind: "ok", text: "Veritabanı bağlı; uygulama giriş almaya hazır görünüyor." });
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 text-sm text-zinc-500 dark:text-zinc-400">
        Durum kontrol ediliyor…
      </div>
    );
  }

  if (!setupBanner) return null;

  if (setupBanner.kind === "err") {
    return (
      <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-6 space-y-3 text-sm text-amber-950 dark:text-amber-100">
        <p className="font-bold text-base">Veritabanı kullanılamıyor</p>
        {setupBanner.code ? (
          <p className="text-[11px] font-mono opacity-90">{setupBanner.code}</p>
        ) : null}
        {setupBanner.message ? <p className="leading-relaxed">{setupBanner.message}</p> : null}
        {setupBanner.steps && setupBanner.steps.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
            {setupBanner.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        ) : null}
        {setupBanner.sqliteFilePath ? (
          <p className="text-[11px] break-all opacity-95">
            Dosya hedefi:{" "}
            <code className="rounded bg-white/70 dark:bg-zinc-900/80 px-1 py-px">{setupBanner.sqliteFilePath}</code>
          </p>
        ) : null}
      </div>
    );
  }

  if (setupBanner.kind === "warn") {
    return (
      <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-6 space-y-2 text-sm text-amber-950 dark:text-amber-100">
        <p className="font-semibold">Kurulum gerekli</p>
        <p className="leading-relaxed">{setupBanner.text}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 text-sm text-emerald-950 dark:text-emerald-100">
      <p className="font-semibold">{setupBanner.text}</p>
    </div>
  );
}
