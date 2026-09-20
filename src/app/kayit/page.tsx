"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Building2,
  User,
  Mail,
  Lock,
  Home,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

type VerifiedSite = {
  id: string;
  name: string;
  address?: string | null;
  inviteCode: string;
  apartmentNo?: string | null;
};

function RegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCode = searchParams.get("kod") || searchParams.get("code") || "";
  const initialDaire = searchParams.get("daire") || searchParams.get("apt") || "";

  const [accountType, setAccountType] = React.useState<"RESIDENT" | "MANAGER">("RESIDENT");
  const [name, setName] = React.useState("");
  const [emailOrPhone, setEmailOrPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const [showPasswordConfirm, setShowPasswordConfirm] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(true);

  // Sakin için: Katılım Kodu & Daire
  const [inviteCode, setInviteCode] = React.useState(initialCode);
  const [apartmentNo, setApartmentNo] = React.useState(initialDaire);
  const [verifyingCode, setVerifyingCode] = React.useState(false);
  const [verifiedSite, setVerifiedSite] = React.useState<VerifiedSite | null>(null);
  const [codeError, setCodeError] = React.useState("");

  // Yönetici için: Yeni Site Adı
  const [newSiteName, setNewSiteName] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [successData, setSuccessData] = React.useState<{ message: string } | null>(null);

  // Katılım Kodunu Doğrulama Fonksiyonu
  const verifyCode = React.useCallback(async (codeToVerify: string) => {
    const clean = codeToVerify.trim();
    if (!clean || clean.length < 3) {
      setVerifiedSite(null);
      setCodeError("");
      return;
    }

    setVerifyingCode(true);
    setCodeError("");

    try {
      const res = await fetch(`/api/public/sites/verify-code?code=${encodeURIComponent(clean)}`);
      const data = (await res.json()) as { ok?: boolean; valid?: boolean; site?: VerifiedSite; error?: string };

      if (res.ok && data.valid && data.site) {
        setVerifiedSite(data.site);
        setCodeError("");
        if (data.site.apartmentNo && !apartmentNo) {
          setApartmentNo(data.site.apartmentNo);
        }
      } else {
        setVerifiedSite(null);
        setCodeError(data?.error || "Geçersiz katılım kodu. Yöneticinizin verdiği kodu kontrol edin.");
      }
    } catch {
      setVerifiedSite(null);
      setCodeError("Kod kontrol edilirken bağlantı hatası oluştu.");
    } finally {
      setVerifyingCode(false);
    }
  }, [apartmentNo]);

  // URL'den kod geldiyse ilk yüklemede otomatik doğrula
  React.useEffect(() => {
    if (initialCode) {
      void verifyCode(initialCode);
    }
  }, [initialCode, verifyCode]);

  // Kod değiştiğinde 400ms debounce ile doğrula
  React.useEffect(() => {
    if (!inviteCode.trim() || inviteCode === initialCode) return;
    const timer = setTimeout(() => {
      void verifyCode(inviteCode);
    }, 450);
    return () => clearTimeout(timer);
  }, [inviteCode, initialCode, verifyCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Lütfen adınızı ve soyadınızı girin.");
      return;
    }
    if (!emailOrPhone.trim()) {
      setErrorMsg("Lütfen geçerli bir e-posta veya telefon numarası girin.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Şifreniz en az 6 karakter olmalıdır.");
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMsg("Girdiğiniz şifreler birbiriyle eşleşmiyor.");
      return;
    }
    if (!termsAccepted) {
      setErrorMsg("Devam etmek için kullanım şartlarını kabul etmelisiniz.");
      return;
    }

    if (accountType === "RESIDENT") {
      if (!inviteCode.trim()) {
        setErrorMsg("Lütfen yöneticinizin size verdiği Site Katılım Kodunu girin.");
        return;
      }
      if (!apartmentNo.trim()) {
        setErrorMsg("Lütfen daire / kapı numaranızı belirtin.");
        return;
      }
    }

    if (accountType === "MANAGER" && !newSiteName.trim()) {
      setErrorMsg("Lütfen yöneteceğiniz site / apartman adını belirtin.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          emailOrPhone: emailOrPhone.trim().toLowerCase(),
          password,
          accountType,
          inviteCode: accountType === "RESIDENT" ? inviteCode.trim() : undefined,
          siteId: accountType === "RESIDENT" && verifiedSite ? verifiedSite.id : undefined,
          apartmentNo: accountType === "RESIDENT" ? apartmentNo.trim() : undefined,
          newSiteName: accountType === "MANAGER" ? newSiteName.trim() : undefined,
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setErrorMsg(data?.error || "Kayıt işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin.");
        setSubmitting(false);
        return;
      }

      setSuccessData({
        message: data?.message || "Kaydınız başarıyla oluşturuldu.",
      });
      setSubmitting(false);
    } catch {
      setErrorMsg("Sunucuya bağlanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 sm:py-16 w-full flex items-center justify-center">
        {successData ? (
          /* Başarılı Kayıt Bildirim Kartı */
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {accountType === "MANAGER" ? "SİTE VE YÖNETİCİ HESABI AKTİF" : "KAYDINIZ TAMAMLANDI"}
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
              Hesabınız Başarıyla Oluşturuldu!
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {successData.message}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 mb-8 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 shrink-0">1. Adım:</span>
                <span>
                  {accountType === "MANAGER"
                    ? "Yönetici panelinize giriş yaparak sitenizi ve sakinlerinizi yönetmeye başlayabilirsiniz."
                    : "Belirlediğiniz şifre ile sisteme hemen giriş yapabilirsiniz."}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 shrink-0">2. Adım:</span>
                <span>
                  {accountType === "MANAGER"
                    ? "Panelinizdeki özel 'Site Katılım Kodu'nu apartman sakinlerinizle paylaşın."
                    : "Topluluk sohbetine katılabilir, anketleri oylayabilir ve duyuruları takip edebilirsiniz."}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm text-center"
              >
                Giriş Sayfasına Git
              </Link>
              <Link
                href="/"
                className="py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all text-center"
              >
                Ana Sayfa
              </Link>
            </div>
          </div>
        ) : (
          /* Kayıt Formu */
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80">
            {/* Başlık & Rol Seçici */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-3 shadow-xs">
                <Building2 className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Yeni Hesap Oluşturun
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                Apartman ve site yönetim sistemine dakikalar içinde katılın
              </p>

              {/* Rol Değiştirme Butonları */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl mt-6">
                <button
                  type="button"
                  onClick={() => setAccountType("RESIDENT")}
                  className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    accountType === "RESIDENT"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Daire Sakiniyim
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("MANAGER")}
                  className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    accountType === "MANAGER"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Site Yöneticisiyim
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium animate-in fade-in flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Daire Sakini İse: Site Katılım Kodu */}
              {accountType === "RESIDENT" ? (
                <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Site Katılım Kodu (Davet Kodu) <span className="text-rose-500">*</span>
                      </label>
                      {verifyingCode && (
                        <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Kontrol ediliyor...
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Örn: LALE-8421 veya LALE-8421-D12"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono font-bold tracking-wide outline-none transition-all ${
                          verifiedSite
                            ? "border-emerald-500 bg-emerald-50/40 text-emerald-950 focus:ring-2 focus:ring-emerald-200"
                            : codeError
                            ? "border-rose-400 bg-rose-50/40 text-rose-950 focus:ring-2 focus:ring-rose-200"
                            : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Doğrulandıysa Otomatik Site Bilgisi Rozeti */}
                  {verifiedSite ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 animate-in fade-in">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-950">
                          Site: {verifiedSite.name}
                        </p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          {verifiedSite.address || "Sistemde kayıtlı site"} &bull; Kod: {verifiedSite.inviteCode}
                        </p>
                      </div>
                    </div>
                  ) : codeError ? (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{codeError}</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      💡 Site yöneticinizin WhatsApp veya panodan paylaştığı katılım kodunu girin. Site adı otomatik eşleşecektir.
                    </p>
                  )}

                  {/* Daire / Kapı No */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Daire / Kapı No <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Örn: Daire 8 veya Blok A - No 14"
                        value={apartmentNo}
                        onChange={(e) => setApartmentNo(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* 2. Yönetici İse: Yeni Site Adı */
                <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Yöneteceğiniz Site / Apartman Adı <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Örn: Güneş Sitesi veya Huzur Apt."
                      value={newSiteName}
                      onChange={(e) => setNewSiteName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-indigo-700 pt-1">
                    ✨ Kayıt sonrasında sakinlerinize vereceğiniz <strong>Site Katılım Kodu</strong> otomatik üretilecektir.
                  </p>
                </div>
              )}

              {/* Ad Soyad */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ad Soyad <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Örn: Ahmet Yılmaz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              {/* E-posta veya Telefon */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-Posta Adresi veya Telefon <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="ornek@domain.com veya 0532..."
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all bg-slate-50/50"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Onay ve şifre sıfırlama bildirimleri bu adrese iletilecektir.
                </p>
              </div>

              {/* Şifre ve Tekrar */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Şifre <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                      tabIndex={-1}
                      aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                      title={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Şifre Tekrar <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      required
                      placeholder="••••••"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                      tabIndex={-1}
                      aria-label={showPasswordConfirm ? "Şifreyi gizle" : "Şifreyi göster"}
                      title={showPasswordConfirm ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* KVKK ve Şartlar */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    <Link href="/kullanim-sartlari" className="text-indigo-600 underline font-medium">
                      Kullanım Şartları
                    </Link>{" "}
                    ve{" "}
                    <Link href="/gizlilik-politikasi" className="text-indigo-600 underline font-medium">
                      Gizlilik Politikası
                    </Link>
                    &apos;nı okudum, kabul ediyorum.
                  </span>
                </label>
              </div>

              {/* Gönder Butonu */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {submitting ? (
                  <span>Hesap Oluşturuluyor...</span>
                ) : (
                  <>
                    <span>Kaydı Tamamla</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-4 text-center text-xs text-slate-500">
                Zaten bir hesabınız var mı?{" "}
                <Link href="/login" className="font-bold text-indigo-600 hover:underline">
                  Giriş Yapın
                </Link>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Yükleniyor...</div>}>
      <RegisterFormInner />
    </React.Suspense>
  );
}
