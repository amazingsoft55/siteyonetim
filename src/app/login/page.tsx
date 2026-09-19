"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, UserPlus, ShieldAlert, LogIn } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { browserApiUrl, getStoredApiBase, setStoredApiBase, getBrowserApiBase } from "@/lib/browser-api-base";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [usernameOrPhone, setUsernameOrPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [isPendingNotice, setIsPendingNotice] = React.useState(false);
  const [apiOriginDraft, setApiOriginDraft] = React.useState("");
  const [showApiOrigin, setShowApiOrigin] = React.useState(false);
  const [apiSaveNote, setApiSaveNote] = React.useState("");
  const [authChecked, setAuthChecked] = React.useState(false);

  React.useEffect(() => {
    setApiOriginDraft(getStoredApiBase());
  }, []);

  React.useEffect(() => {
    let active = true;

    const timer = setTimeout(() => {
      if (active) setAuthChecked(true);
    }, 1000);

    async function verifySession() {
      try {
        const response = await fetch(browserApiUrl("/api/auth/me"), {
          credentials: "include",
        });
        if (!active) return;

        if (response.ok) {
          const data = (await response.json()) as {
            authenticated?: boolean;
            user?: {
              id: string;
              role: string;
              name: string;
              siteId?: string | null;
              apartmentNo?: string | null;
              mustChangePassword?: boolean;
            };
          };

          if (data?.authenticated && data.user?.role) {
            localStorage.setItem("user", JSON.stringify(data.user));
            if (data.user.mustChangePassword) {
              router.push("/sifre-belirle");
              return;
            }
            if (data.user.role === "SUPER_ADMIN") {
              router.push("/super-admin");
            } else if (data.user.role === "ADMIN") {
              router.push("/admin");
            } else {
              router.push("/dashboard");
            }
            return;
          }
        }
        localStorage.removeItem("user");
        setAuthChecked(true);
      } catch {
        if (active) {
          localStorage.removeItem("user");
          setAuthChecked(true);
        }
      } finally {
        clearTimeout(timer);
      }
    }

    verifySession();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrPhone || !password) {
      setErrorMsg("Lütfen tüm alanları doldurun.");
      setIsPendingNotice(false);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setIsPendingNotice(false);

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
          "Sunucudan geçerli bir yanıt alınamadı. API adresini kontrol edin.",
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
        if (errText.includes("onayında") || errText.includes("onay")) {
          setIsPendingNotice(true);
        }
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
          `Sunucuya ulaşılamadı. ${base || "(mevcut adres)"}`
        : "İstek tamamlanamadı.",
      );
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-4 px-4">
        <div className="animate-pulse text-slate-500 text-sm font-medium">Yükleniyor...</div>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("user");
            setAuthChecked(true);
          }}
          className="text-xs text-indigo-600 hover:underline cursor-pointer"
        >
          Giriş formunu aç
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/60 px-4 py-12 transition-colors">
      <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-lg border border-slate-200/80">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center relative text-center">
          <Link href="/" className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4 shadow-sm ring-1 ring-slate-200 bg-white hover:scale-105 transition-transform">
            <SiteLogo width={52} height={52} rounded className="rounded-xl" alt="Site Yönetimi logosu" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Sisteme Giriş Yapın
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Site sakini veya yönetici hesabınızla erişin
          </p>
        </div>

        {errorMsg && (
          <div
            className={`p-4 text-sm rounded-2xl border animate-in fade-in duration-200 ${
              isPendingNotice
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Kullanıcı Adı, E-Posta veya Telefon
              </label>
              <input
                type="text"
                required
                value={usernameOrPhone}
                onChange={(e) => setUsernameOrPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none bg-slate-50/50 text-sm transition-all"
                placeholder="ornek@domain.com veya telefon no"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Şifre
                </label>
                <Link
                  href="/sifremi-unuttum"
                  className="text-xs font-semibold hover:underline text-indigo-600"
                >
                  Şifremi unuttum?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none bg-slate-50/50 text-sm transition-all"
                placeholder="••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2 bg-indigo-600 cursor-pointer"
          >
            {loading ? (
              <span>Giriş Yapılıyor...</span>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Giriş Yap</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Kayıt Ol Linki */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
          <div className="text-xs text-indigo-950">
            <span className="font-bold block text-slate-900">Hesabınız yok mu?</span>
            <span className="text-slate-600">Sakin veya yönetici hesabı oluşturun.</span>
          </div>
          <Link
            href="/kayit"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all shrink-0"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Hesap Aç
          </Link>
        </div>

        {/* Sunucu Adresi (Mobil & Gelişmiş) */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowApiOrigin((v) => !v)}
            className="text-[11px] font-semibold text-slate-600 w-full text-center py-1 hover:text-indigo-600 cursor-pointer"
          >
            {showApiOrigin ? "▼ Sunucu adresi (gelişmiş)" : "▸ Sunucu adresi (mobil / özel kök)"}
          </button>
          {showApiOrigin && (
            <div className="mt-2 space-y-2 px-1">
              <p className="text-[10px] text-slate-500 leading-snug">
                Varsayılan olarak mevcut tarayıcı adresine istek atılır. Mobil uygulamalar veya farklı domainler için kök adresi tanımlayabilirsiniz.
              </p>
              <input
                type="url"
                placeholder="https://..."
                value={apiOriginDraft}
                onChange={(e) => setApiOriginDraft(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs bg-slate-50"
              />
              <button
                type="button"
                onClick={() => {
                  setStoredApiBase(apiOriginDraft);
                  setApiSaveNote("Kaydedildi.");
                  void setTimeout(() => setApiSaveNote(""), 3000);
                }}
                className="w-full py-2 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold"
              >
                Kaydet
              </button>
              {apiSaveNote ? <p className="text-[10px] text-emerald-600 font-semibold text-center">{apiSaveNote}</p> : null}
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
            &larr; Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
