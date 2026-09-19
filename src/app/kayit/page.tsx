"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteLogo } from "@/components/SiteLogo";
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
  ShieldCheck,
  Clock,
  Sparkles,
  HelpCircle,
} from "lucide-react";

type SiteOption = {
  id: string;
  name: string;
  address?: string | null;
};

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = React.useState<"RESIDENT" | "MANAGER">("RESIDENT");
  const [name, setName] = React.useState("");
  const [emailOrPhone, setEmailOrPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const [siteId, setSiteId] = React.useState("");
  const [newSiteName, setNewSiteName] = React.useState("");
  const [apartmentNo, setApartmentNo] = React.useState("");
  const [termsAccepted, setTermsAccepted] = React.useState(true);

  const [sites, setSites] = React.useState<SiteOption[]>([]);
  const [sitesLoading, setSitesLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [successData, setSuccessData] = React.useState<{ message: string } | null>(null);

  React.useEffect(() => {
    async function loadSites() {
      try {
        const res = await fetch("/api/public/sites");
        if (res.ok) {
          const data = (await res.json()) as SiteOption[];
          if (Array.isArray(data)) {
            setSites(data);
            if (data.length > 0) {
              setSiteId(data[0].id);
            }
          }
        }
      } catch {
        // Sessiz devam
      } finally {
        setSitesLoading(false);
      }
    }
    loadSites();
  }, []);

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
          siteId: accountType === "RESIDENT" ? siteId : undefined,
          newSiteName: accountType === "MANAGER" ? newSiteName.trim() : undefined,
          apartmentNo: accountType === "RESIDENT" ? apartmentNo.trim() : undefined,
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
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200/80 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mb-3 border border-amber-200/60">
              <Clock className="h-3.5 w-3.5" />
              YÖNETİCİ ONAYI BEKLENİYOR
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
              Başvurunuz Başarıyla Alındı!
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {successData.message}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 mb-8 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 shrink-0">1. Aşama:</span>
                <span>Site yöneticiniz hesabınızı ve daire bilginizi kontrol edecektir.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 shrink-0">2. Aşama:</span>
                <span>Onay verildiği an <strong>{emailOrPhone}</strong> adresinize giriş bağlantısı gönderilecektir.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 shrink-0">3. Aşama:</span>
                <span>Gelen e-postadaki butona tıklayarak veya şifrenizle doğrudan giriş yapabileceksiniz.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm"
              >
                Giriş Sayfasına Dön
              </Link>
              <Link
                href="/"
                className="py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Ana Sayfa
              </Link>
            </div>
          </div>
        ) : (
          /* Kayıt Formu */
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-slate-200/80">
            
            {/* Başlık & Tip Seçici */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
                <Building2 className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Yeni Hesap Oluşturun
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
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
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium animate-in fade-in">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
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
                  Onaylandığında bilgilendirme bu adrese iletilecektir.
                </p>
              </div>

              {/* Daire Sakini ise: Site & Daire Seçimi */}
              {accountType === "RESIDENT" ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Site / Apartman
                    </label>
                    {sites.length > 0 ? (
                      <select
                        value={siteId}
                        onChange={(e) => setSiteId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all bg-slate-50/50"
                      >
                        {sites.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Site adı"
                        value={siteId}
                        onChange={(e) => setSiteId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-slate-50/50"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Daire / Kapı No
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Örn: 4 veya B-12"
                        value={apartmentNo}
                        onChange={(e) => setApartmentNo(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Yönetici ise: Yeni Site Adı */
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all bg-slate-50/50"
                    />
                  </div>
                </div>
              )}

              {/* Şifre ve Tekrar */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Şifre <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all bg-slate-50/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Şifre Tekrar <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all bg-slate-50/50"
                    />
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
                    <Link href="/kullanim-sartlari" className="text-indigo-600 underline font-medium">Kullanım Şartları</Link>
                    {" "}ve{" "}
                    <Link href="/gizlilik-politikasi" className="text-indigo-600 underline font-medium">Gizlilik Politikası</Link>
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
