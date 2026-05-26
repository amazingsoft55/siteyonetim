"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { browserApiUrl } from "@/lib/browser-api-base";
import Image from "next/image";

export default function SifreBelirlePage() {
  const router = useRouter();
  const [np, setNp] = React.useState("");
  const [np2, setNp2] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (np.length < 8) {
      setErr("Şifre en az 8 karakter olmalıdır.");
      return;
    }
    if (np !== np2) {
      setErr("Şifreler eşleşmiyor.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(browserApiUrl("/api/auth/complete-password"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: np, confirmPassword: np2 }),
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
      const rec = j as { role?: string };
      localStorage.removeItem("user");
      if (rec.role === "SUPER_ADMIN") router.replace("/super-admin");
      else if (rec.role === "ADMIN") router.replace("/admin");
      else router.replace("/dashboard");
    } catch {
      setErr("Sunucuya ulaşılamadı.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0b0f19] px-4">
      <div className="w-full max-w-md p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl space-y-6">
        <div className="flex justify-center">
          <Image src="/logo.png" alt="" width={64} height={64} className="rounded-xl" />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-xl font-black text-zinc-900 dark:text-white">Kalıcı şifre belirleyin</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Hesabınız geçici veya ilk şifre ile açılmış. Güvenlik için en az 8 karakterlik yeni bir şifre girin.
          </p>
        </div>

        {err && (
          <div className="text-sm rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-3">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Yeni şifre</label>
            <input
              type="password"
              value={np}
              onChange={(e) => setNp(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 py-3 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete="new-password"
              required
              minLength={8}
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
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm disabled:opacity-60"
          >
            {busy ? "Kaydediliyor..." : "Şifreyi kaydet"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500">
          <Link href="/login" className="underline font-semibold text-indigo-600 dark:text-indigo-400">
            Çıkış ve giriş
          </Link>
        </p>
      </div>
    </div>
  );
}
