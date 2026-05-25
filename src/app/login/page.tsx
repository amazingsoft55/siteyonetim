"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, User } from "lucide-react";
import Image from "next/image";
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [usernameOrPhone, setUsernameOrPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

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
        const rec = data !== null && typeof data === "object" ? data as { error?: unknown } : {};
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

  // Seed ile aynı demo hesapları: /api/seed (user-1 sakini, admin-1 yöneticisi)
  const fillDemoResident = () => {
    setUsernameOrPhone("5555555555");
    setPassword("123456");
    setErrorMsg("");
  };

  const fillDemoAdmin = () => {
    setUsernameOrPhone("admin");
    setPassword("admin123");
    setErrorMsg("");
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

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 text-sm rounded-xl bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/50 animate-in fade-in duration-200">
            {errorMsg}
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
                placeholder="Örn: 555 555 55 55 veya admin"
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

        {/* Demo Fast Login Helpers */}
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-center text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
            Hızlı Demo Girişi
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={fillDemoResident}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40 transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              Test Sakini
            </button>
            <button
              onClick={fillDemoAdmin}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100/50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Test Yöneticisi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
