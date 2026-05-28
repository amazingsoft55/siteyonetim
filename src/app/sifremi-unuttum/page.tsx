"use client";

import * as React from "react";
import Link from "next/link";
import { browserApiUrl } from "@/lib/browser-api-base";
import { readJsonError } from "@/lib/json-error";
import { SiteLogo } from "@/components/SiteLogo";

export default function SifremiUnuttumPage() {
  const [email, setEmail] = React.useState("");
  const [msg, setMsg] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [emailReady, setEmailReady] = React.useState<boolean | null>(null);
  const [emailMissing, setEmailMissing] = React.useState<string[]>([]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch(browserApiUrl("/api/setup/status"));
      const j: unknown = await res.json().catch(() => null);
      if (!alive) return;
      const ok =
        j !== null &&
        typeof j === "object" &&
        "emailConfigured" in j &&
        (j as { emailConfigured: unknown }).emailConfigured === true;
      setEmailReady(ok);
      const missing =
        j !== null &&
        typeof j === "object" &&
        "emailMissing" in j &&
        Array.isArray((j as { emailMissing: unknown }).emailMissing) ?
          (j as { emailMissing: string[] }).emailMissing
        : [];
      setEmailMissing(missing);
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      const res = await fetch(browserApiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setErr(readJsonError(j, "İstek başarısız."));
        setBusy(false);
        return;
      }
      const m =
        j !== null && typeof j === "object" && "message" in j && typeof (j as { message: unknown }).message === "string"
          ? (j as { message: string }).message
          : "İşlem kaydedildi.";
      setMsg(m);
    } catch {
      setErr("Sunucuya ulaşılamadı.");
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0b0f19] px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl space-y-6">
        <div className="flex justify-center">
          <SiteLogo width={64} height={64} rounded className="rounded-xl" alt="" />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-xl font-black text-zinc-900 dark:text-white">Şifre sıfırlama</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Kayıtlı <strong>e-posta adresinize</strong> logo ve marka ile sıfırlama bağlantısı gönderilir. Yönetici,
            sakin ve süper yönetici hesapları için geçerlidir.
          </p>
        </div>
        {emailReady === false && (
          <div className="text-sm rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100 p-3 space-y-1">
            <p>
              Sunucuda e-posta ayarları henüz tamamlanmadı.
              {emailMissing.length > 0 ?
                <> Eksik: {emailMissing.join(", ")}.</>
              : null}{" "}
              (<Link href="/kurulum#gmail" className="underline">kurulum rehberi</Link>)
            </p>
            {emailMissing.includes("GMAIL_REFRESH_TOKEN") && (
              <p className="text-xs">
                Google OAuth&apos;da <strong>403 access_denied</strong> aldıysanız: Cloud Console → OAuth consent screen →
                Test users → <strong>ccode4779@gmail.com</strong> ekleyin, sonra yeniden yetkilendirin.
              </p>
            )}
          </div>
        )}
        {msg ? (
          <div className="text-sm rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 p-3">
            {msg}
          </div>
        ) : null}
        {err ? <div className="text-sm text-red-600 dark:text-red-400 p-2">{err}</div> : null}
        {!msg ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 py-3 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Kayıtlı e-posta adresiniz"
                autoComplete="email"
              />
            </div>
            <button
              type="submit"
              disabled={busy || emailReady === false}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm disabled:opacity-60"
            >
              {busy ? "Gönderiliyor..." : "Sıfırlama bağlantısı gönder"}
            </button>
          </form>
        ) : null}
        <p className="text-center text-xs text-zinc-500">
          <Link href="/login" className="underline font-semibold text-indigo-600 dark:text-indigo-400">
            Girişe dön
          </Link>
        </p>
      </div>
    </div>
  );
}
