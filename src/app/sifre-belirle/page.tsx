"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { browserApiUrl } from "@/lib/browser-api-base";
import { SiteLogo } from "@/components/SiteLogo";

export default function SifreBelirlePage() {
  const router = useRouter();
  const [np, setNp] = React.useState("");
  const [showNp, setShowNp] = React.useState(false);
  const [np2, setNp2] = React.useState("");
  const [showNp2, setShowNp2] = React.useState(false);
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
          <SiteLogo width={64} height={64} rounded className="rounded-xl" alt="" />
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
            <div className="relative">
              <input
                type={showNp ? "text" : "password"}
                value={np}
                onChange={(e) => setNp(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 py-3 pl-3 pr-11 outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white text-sm"
                autoComplete="new-password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNp(!showNp)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none"
                tabIndex={-1}
                aria-label={showNp ? "Şifreyi gizle" : "Şifreyi göster"}
                title={showNp ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showNp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Yeni şifre (tekrar)</label>
            <div className="relative">
              <input
                type={showNp2 ? "text" : "password"}
                value={np2}
                onChange={(e) => setNp2(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 py-3 pl-3 pr-11 outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white text-sm"
                autoComplete="new-password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNp2(!showNp2)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none"
                tabIndex={-1}
                aria-label={showNp2 ? "Şifreyi gizle" : "Şifreyi göster"}
                title={showNp2 ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showNp2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm disabled:opacity-60 transition cursor-pointer"
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
