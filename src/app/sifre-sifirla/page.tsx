"use client";

import * as React from "react";
import Link from "next/link";
import { Suspense } from "react";
import { browserApiUrl } from "@/lib/browser-api-base";
import { SiteLogo } from "@/components/SiteLogo";

function ResetFormInner() {
  const [token, setToken] = React.useState("");
  const [np, setNp] = React.useState("");
  const [np2, setNp2] = React.useState("");
  const [err, setErr] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const t = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("t") : null;
    setToken(t?.trim() || "");
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOkMsg("");
    if (!token || token.length < 20) {
      setErr("Geçersiz bağlantı. E-postanızdaki linki kullanın.");
      return;
    }
    if (np.length < 8 || np !== np2) {
      setErr("Şifre en az 8 karakter olmalı ve iki alan eşleşmelidir.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(browserApiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: np, confirmPassword: np2 }),
      });
      const j: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          j !== null && typeof j === "object" && "error" in j && typeof (j as { error: unknown }).error === "string"
            ? (j as { error: string }).error
            : "İşlem başarısız.";
        setErr(msg);
        setBusy(false);
        return;
      }
      const m =
        j !== null && typeof j === "object" && "message" in j && typeof (j as { message: unknown }).message === "string"
          ? (j as { message: string }).message
          : "Tamam.";
      setOkMsg(m);
      setNp("");
      setNp2("");
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
        <h1 className="text-xl font-black text-center text-zinc-900 dark:text-white">Şifreyi sıfırlayın</h1>
        {okMsg ?
          <p className="text-sm text-center text-emerald-600 dark:text-emerald-400 font-medium">{okMsg}</p>
        : null}
        {err ?
          <div className="text-sm rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 text-red-700 p-3">{err}</div>
        : null}
        {!token ?
          <p className="text-sm text-zinc-500 text-center">
            Bağlantıda <code className="text-xs">t=</code> parametresi yok. E-postanızdaki linki açın.
          </p>
        : <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Yeni şifre</label>
              <input
                type="password"
                value={np}
                onChange={(e) => setNp(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 py-3 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Yeni şifre (tekrar)</label>
              <input
                type="password"
                value={np2}
                onChange={(e) => setNp2(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 py-3 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm disabled:opacity-60"
            >
              {busy ? "Kaydediliyor..." : "Şifreyi güncelle"}
            </button>
          </form>}
        <p className="text-center text-xs text-zinc-500">
          <Link href="/login" className="underline font-semibold text-indigo-600 dark:text-indigo-400">
            Girişe dön
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SifreSifirlaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <ResetFormInner />
    </Suspense>
  );
}
