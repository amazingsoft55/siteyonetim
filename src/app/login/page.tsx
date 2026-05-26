"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [usernameOrPhone, setUsernameOrPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [setupBanner, setSetupBanner] = React.useState<{ kind: "ok" | "warn" | "err"; text: string } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/setup/status")
      .then((r) => r.json().catch(() => null))
      .then((data) => {
        if (cancelled || !data || typeof data !== "object") return;
        const d = data as {
          ok?: boolean;
          code?: string;
          message?: string;
          needsSeed?: boolean;
          hasSupportTicketsTable?: boolean;
          steps?: string[];
        };
        if (d.ok === false) {
          const lines = Array.isArray(d.steps) ? d.steps.join(" ") : d.message ?? "Veritabanı bağlantısı yok.";
          setSetupBanner({
            kind: "err",
            text: `${d.code ?? ""} ${lines}`.trim(),
          });
          return;
        }
        if (d.needsSeed) {
          setSetupBanner({
            kind: "warn",
            text: "Henüz ilk site ve süper yönetici oluşturulmamış. Ortam değişkenleri tanımlandıktan sonra GET /api/seed kullanın (/kurulum).",
          });
          return;
        }
        if (d.ok && d.hasSupportTicketsTable === false) {
          setSetupBanner({
            kind: "warn",
            text: "Destek talepleri tablosu eksik olabilir. full-schema.sql veya 0002 migrasyonunu uygulayın.",
          });
          return;
        }
        if (d.ok) setSetupBanner({ kind: "ok", text: "Veritabanı bağlı. Giriş yapabilirsiniz." });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrPhone || !password) {
      setErrorMsg("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          usernameOrPhone: usernameOrPhone.replace(/\s+/g, ""), 
          password 
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const rec =
          data !== null && typeof data === "object" ?
            (data as {
              error?: unknown;
            })
          : {};
        const errText = typeof rec.error === "string" ? rec.error : "Giriş başarısız.";
        setErrorMsg(errText);
        setLoading(false);
        return;
      }

      const ok = data as {
        user: { role: string; id: string; name: string; siteId?: string | null };
      };

      if (!ok?.user || typeof ok.user.role !== "string") {
        setErrorMsg("Geçersiz sunucu yanıtı.");
        setLoading(false);
        return;
      }

      // Başarılı, role göre yönlendir
      localStorage.setItem("user", JSON.stringify(ok.user));
      
      if (ok.user.role === "SUPER_ADMIN") {
        router.push("/super-admin");
      } else if (ok.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setErrorMsg("Sunucuya bağlanılamadı.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#0b0f19] px-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-zinc-900/80 dark:backdrop-blur-md p-8 rounded-3xl shadow-xl border border-zinc-200/50 dark:border-zinc-800/80">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center relative text-center">

          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl mb-4 shadow-md transition-all transform hover:scale-105 shadow-indigo-600/20"
          >
            <Image src="/logo.png" alt="Site Logo" width={80} height={80} className="rounded-2xl object-cover" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Siteniz Yönetimde
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sisteme giriş yapın
          </p>
        </div>

        {/* Kurulum durumu */}
        {setupBanner && setupBanner.kind === "err" && (
          <div className="p-4 text-sm rounded-2xl bg-amber-50 text-amber-950 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800 space-y-2">
            <p className="font-semibold">Veritabanı / geliştirme ortamı</p>
            <p className="text-xs sm:text-sm leading-relaxed">{setupBanner.text}</p>
            <Link
              href="/kurulum"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 dark:text-indigo-400 underline underline-offset-2"
            >
              Kurulum rehberine git →
            </Link>
          </div>
        )}
        {setupBanner && setupBanner.kind === "warn" && (
          <div className="p-3.5 text-sm rounded-xl bg-amber-50/90 text-amber-900 border border-amber-200/80 dark:bg-amber-950/35 dark:text-amber-100 dark:border-amber-800/60 space-y-1">
            <p>{setupBanner.text}</p>
            <Link href="/kurulum" className="text-xs font-bold underline text-indigo-700 dark:text-indigo-400">
              Adım adım talimatlar
            </Link>
          </div>
        )}
        {setupBanner && setupBanner.kind === "ok" && (
          <div className="p-3 text-xs rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/35 dark:text-emerald-100 dark:border-emerald-900/70">
            {setupBanner.text}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 text-sm rounded-xl bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/50 animate-in fade-in duration-200 space-y-2">
            <p>{errorMsg}</p>
            {(errorMsg.includes("D1") || errorMsg.includes("bağlantı")) && (
              <Link href="/kurulum" className="text-xs font-bold underline">
                Kurulum sayfasına git
              </Link>
            )}
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                Kullanıcı Adı veya Telefon Numarası
              </label>
              <input
                type="text"
                required
                value={usernameOrPhone}
                onChange={(e) => setUsernameOrPhone(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 py-3 px-4 text-zinc-950 dark:text-zinc-50 focus:ring-2 outline-none bg-zinc-50 dark:bg-zinc-950/50 transition-all focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="E‑posta veya telefon numarası"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                Şifre
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 py-3 px-4 text-zinc-950 dark:text-zinc-50 focus:ring-2 outline-none bg-zinc-50 dark:bg-zinc-950/50 transition-all focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-zinc-600 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-indigo-600 focus:ring-indigo-600"
              />
              <span className="ml-2">Beni Hatırla</span>
            </label>
            <a
              href="#"
              className="font-semibold hover:underline text-indigo-600 dark:text-indigo-400"
            >
              Şifremi Unuttum
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
          >
            {loading ? (
              <span>Giriş Yapılıyor...</span>
            ) : (
              <>
                <span>Giriş Yap</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Giriş bilgileri yalnızca veritabanındaki hesaplara göredir. İlk kurulum için{" "}
          <Link href="/kurulum" className="font-bold text-indigo-600 dark:text-indigo-400 underline">
            Kurulum
          </Link>{" "}
          sayfasına bakın.
        </p>

      </div>
    </div>
  );
}
