"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { browserApiUrl, getStoredApiBase, setStoredApiBase, getBrowserApiBase } from "@/lib/browser-api-base";
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [usernameOrPhone, setUsernameOrPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [apiOriginDraft, setApiOriginDraft] = React.useState("");
  const [showApiOrigin, setShowApiOrigin] = React.useState(false);
  const [apiSaveNote, setApiSaveNote] = React.useState("");

  React.useEffect(() => {
    setApiOriginDraft(getStoredApiBase());
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
      const response = await fetch(browserApiUrl("/api/auth/login"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernameOrPhone: usernameOrPhone.replace(/\s+/g, ""),
          password,
        }),
      });

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        setErrorMsg(
          "Sunucudan geçerli bir yanıt alınamadı. API adresini kontrol edin veya aynı origin üzerinden deneyin.",
        );
        setLoading(false);
        return;
      }

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
        mustChangePassword?: boolean;
        user: { role: string; id: string; name: string; siteId?: string | null; apartmentNo?: string | null };
      };

      if (!ok?.user || typeof ok.user.role !== "string") {
        setErrorMsg("Geçersiz sunucu yanıtı.");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(ok.user));

      if (ok.mustChangePassword === true) {
        router.push("/sifre-belirle");
        setLoading(false);
        return;
      }

      if (ok.user.role === "SUPER_ADMIN") {
        router.push("/super-admin");
      } else if (ok.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      setLoading(false);
    } catch (error) {
      const isNetwork = error instanceof TypeError && /fetch|network|Failed to fetch/i.test(error.message);
      const base = getBrowserApiBase();
      setErrorMsg(
        isNetwork ?
          `Sunucuya ulaşılamadı (ağ). Köke istek: ${base || "(göreli — mevcut sekme)"}. NEXT_PUBLIC_SITE_URL veya giriş altındaki özel API adresini kontrol edin.`
        : "İstek tamamlanamadı.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-zinc-900/80 dark:backdrop-blur-md p-8 rounded-3xl shadow-xl border border-zinc-200/50 dark:border-zinc-800/80">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center relative text-center">

          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl mb-4 shadow-md transition-all transform hover:scale-105 shadow-indigo-600/20"
          >
            <SiteLogo width={72} height={72} rounded className="rounded-2xl" alt="Site Yönetimi logosu" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Siteniz Yönetimde
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sisteme giriş yapın
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 text-sm rounded-xl bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/50 animate-in fade-in duration-200">
            <p>{errorMsg}</p>
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
            <Link
              href="/sifremi-unuttum"
              className="font-semibold hover:underline text-indigo-600 dark:text-indigo-400"
            >
              Şifremi unuttum (süper admin)
            </Link>
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

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowApiOrigin((v) => !v)}
            className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 w-full text-center py-1 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {showApiOrigin ? "▼ Sunucu adresi (gelişmiş)" : "▸ Sunucu adresi (mobil / farklı domain)"}
          </button>
          {showApiOrigin && (
            <div className="mt-2 space-y-2 px-1">
              <p className="text-[10px] text-zinc-500 leading-snug">
                Boş bırakırsanız tarayıcı adres çubuğundaki siteye göreli istek atılır (önerilir). Uygulama farklı bir
                etki alanında açılıyorsa buraya kök yazın, örn: <code className="text-[10px]">https://siteyonetim.xxx.workers.dev</code>
              </p>
              <input
                type="url"
                placeholder="https://..."
                value={apiOriginDraft}
                onChange={(e) => setApiOriginDraft(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-2 px-3 text-xs bg-zinc-50 dark:bg-zinc-950"
              />
              <button
                type="button"
                onClick={() => {
                  setStoredApiBase(apiOriginDraft);
                  setApiSaveNote("Kaydedildi.");
                  void setTimeout(() => setApiSaveNote(""), 3000);
                }}
                className="w-full py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-xs font-bold"
              >
                API kökünü kaydet
              </button>
              {apiSaveNote ? <p className="text-[10px] text-emerald-600 font-semibold text-center">{apiSaveNote}</p> : null}
            </div>
          )}
        </div>

        <p className="pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Platforma giriş, size atanmış kullanıcı hesabıyla yapılır. Ürün veya satış için{" "}
          <Link href="/destek" className="font-bold text-indigo-600 dark:text-indigo-400 underline">
            destek
          </Link>{" "}
          sayfamızı kullanın.
        </p>

      </div>
    </div>
  );
}
