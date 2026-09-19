"use client";

import * as React from "react";
import Link from "next/link";
import { readJsonError } from "@/lib/json-error";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";

import { useRouter } from "next/navigation";

type AccountInfo = {
  id: string;
  name: string;
  emailOrPhone: string;
  accountChangesCount: number;
  requiresVerificationForCredentials: boolean;
  canReceiveEmailCode: boolean;
  freeChangeRemaining: boolean;
};

export default function AdminAccountPage() {
  const router = useRouter();
  const [info, setInfo] = React.useState<AccountInfo | null>(null);
  const [name, setName] = React.useState("");
  const [login, setLogin] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [sendingCode, setSendingCode] = React.useState(false);
  const [codeSentTo, setCodeSentTo] = React.useState("");
  const [err, setErr] = React.useState("");
  const [msg, setMsg] = React.useState("");

  // E-posta Test State
  const [testEmailRecipient, setTestEmailRecipient] = React.useState("");
  const [testingEmail, setTestingEmail] = React.useState(false);
  const [testEmailResult, setTestEmailResult] = React.useState<{ ok: boolean; message?: string; error?: string } | null>(null);

  async function handleSendTestEmail(type: "default" | "support") {
    const target = (testEmailRecipient || login).trim();
    if (!target || !target.includes("@")) {
      setTestEmailResult({ ok: false, error: "Lütfen geçerli bir e-posta adresi girin." });
      return;
    }

    setTestingEmail(true);
    setTestEmailResult(null);

    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: target, type }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string; error?: string } | null;

      if (!res.ok || !data?.ok) {
        setTestEmailResult({
          ok: false,
          error: data?.error || "E-posta gönderimi başarısız oldu. Lütfen Resend ayarlarınızı kontrol edin.",
        });
      } else {
        setTestEmailResult({
          ok: true,
          message: data.message || "Test e-postası başarıyla gönderildi!",
        });
      }
    } catch {
      setTestEmailResult({ ok: false, error: "Sunucuya bağlanırken bir hata oluştu." });
    } finally {
      setTestingEmail(false);
    }
  }

  // Hesap Silme State
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState("");
  const [deleteSiteAlso, setDeleteSiteAlso] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteErr, setDeleteErr] = React.useState("");

  async function handleDeleteAccount() {
    if (!deletePassword) {
      setDeleteErr("Lütfen şifrenizi girin.");
      return;
    }
    setDeleting(true);
    setDeleteErr("");

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          deleteSiteAlso,
        }),
      });

      const data = (await res.json().catch(() => null)) as { error?: string; ok?: boolean } | null;

      if (!res.ok) {
        setDeleteErr(data?.error || "Hesap silinemedi. Lütfen şifrenizi kontrol edin.");
        setDeleting(false);
        return;
      }

      // Başarılı silme -> Yerel depolamayı tamamen temizle ve Giriş sayfasına zorla yönlendir
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
      window.location.replace("/login?deleted=1");
    } catch {
      setDeleteErr("Sunucuya bağlanırken bir hata oluştu.");
      setDeleting(false);
    }
  }

  const load = React.useCallback(async () => {
    setErr("");
    const res = await fetch("/api/admin/account", { credentials: "include" });
    const j: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      setErr(readJsonError(j, "Hesap bilgisi alınamadı."));
      setInfo(null);
      return;
    }
    const data = j as AccountInfo;
    setInfo(data);
    setName(data.name);
    setLogin(data.emailOrPhone);
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      await load();
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  async function sendCode() {
    setSendingCode(true);
    setErr("");
    setMsg("");
    const res = await fetch("/api/admin/account/send-code", {
      method: "POST",
      credentials: "include",
    });
    const j: unknown = await res.json().catch(() => null);
    setSendingCode(false);
    if (!res.ok) {
      setErr(readJsonError(j, "Kod gönderilemedi."));
      return;
    }
    const sentTo =
      j && typeof j === "object" && "sentTo" in j && typeof (j as { sentTo: unknown }).sentTo === "string" ?
        (j as { sentTo: string }).sentTo
      : "e-posta adresiniz";
    setCodeSentTo(sentTo);
    setMsg(`${sentTo} adresine 6 haneli doğrulama kodu gönderildi (15 dk geçerli).`);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setMsg("");

    const payload: Record<string, string> = {
      name: name.trim(),
      emailOrPhone: login.replace(/\s+/g, "").trim(),
    };
    if (newPass.trim()) {
      payload.newPassword = newPass;
      payload.confirmPassword = confirmPass;
    }
    if (code.trim()) payload.verificationCode = code.trim();

    const res = await fetch("/api/admin/account", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j: unknown = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok) {
      setErr(readJsonError(j, "Kaydedilemedi."));
      return;
    }

    const notice =
      j && typeof j === "object" && "notice" in j && typeof (j as { notice: unknown }).notice === "string" ?
        (j as { notice: string }).notice
      : "Kaydedildi.";
    setMsg(notice);
    setNewPass("");
    setConfirmPass("");
    setCode("");
    setCodeSentTo("");
    await load();
  }

  const needsCode = info?.requiresVerificationForCredentials === true;

  return (
    <div className="max-w-lg mx-auto p-6 sm:p-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Hesabım</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          E-posta, şifre ve profil bilgilerinizi güncelleyin.
        </p>
      </div>

      {(err || msg) && (
        <div className="space-y-2">
          {err && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm dark:bg-red-950/30 dark:text-red-400">
              {err}
            </div>
          )}
          {msg && !err && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm dark:bg-emerald-950/30 dark:text-emerald-300">
              {msg}
            </div>
          )}
        </div>
      )}

      {info?.freeChangeRemaining && (
        <div className="flex gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-sm text-rose-900 dark:text-rose-200">
          <ShieldCheck className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <p>
            <strong>İlk değişiklik ücretsiz:</strong> E-posta veya şifrenizi bir kez doğrulama kodu olmadan
            güncelleyebilirsiniz. Sonraki değişikliklerde mevcut e-posta adresinize kod gönderilir.
          </p>
        </div>
      )}

      <section className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-rose-100 dark:border-zinc-800 p-6 shadow-sm">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">Ad soyad</label>
            <input
              className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-zinc-50 dark:bg-zinc-950"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              E‑posta veya telefon (giriş)
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-zinc-50 dark:bg-zinc-950"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5" />
                Yeni şifre
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-zinc-50 dark:bg-zinc-950"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Boş bırakırsanız değişmez"
                minLength={6}
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Yeni şifre (tekrar)</label>
              <input
                type="password"
                className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-zinc-50 dark:bg-zinc-950"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {needsCode && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/20 p-4 space-y-3">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                E-posta veya şifre değişikliği için mevcut e-posta adresinize doğrulama kodu gerekir.
              </p>
              <button
                type="button"
                onClick={sendCode}
                disabled={sendingCode || !info?.canReceiveEmailCode}
                className="w-full py-2 rounded-xl border border-amber-300 dark:border-amber-800 text-sm font-bold text-amber-900 dark:text-amber-100 disabled:opacity-50"
              >
                {sendingCode ? "Gönderiliyor…" : "Doğrulama kodu gönder"}
              </button>
              {!info?.canReceiveEmailCode && (
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Hesabınızda geçerli bir e-posta yok. Önce e-posta formatında bir giriş tanımlayın.
                </p>
              )}
              {codeSentTo && (
                <p className="text-xs text-emerald-700 dark:text-emerald-400">Kod gönderildi: {codeSentTo}</p>
              )}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">6 haneli kod</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-zinc-50 dark:bg-zinc-950 tracking-[0.3em] text-center font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || loading}
            className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm disabled:opacity-60 transition"
          >
            {saving ? "Kaydediliyor…" : "Bilgileri Kaydet"}
          </button>
        </form>
      </section>

      {/* E-posta Altyapısı Canlı Test & Teşhis */}
      <section className="rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
            📧 E-posta Altyapısı Canlı Testi
          </h2>
          <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">
            Bildirim (Hoş geldin, duyurular) veya Destek (şifre sıfırlama, biletler) e-posta kanallarınızın çalışıp çalışmadığını anlık olarak test edin.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase">Test E-posta Alıcısı</label>
            <input
              type="email"
              className="mt-1 w-full rounded-2xl border border-indigo-200 dark:border-indigo-800 px-4 py-2.5 bg-white dark:bg-zinc-950 text-sm"
              value={testEmailRecipient || login}
              onChange={(e) => setTestEmailRecipient(e.target.value)}
              placeholder="ornek@domain.com"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSendTestEmail("default")}
              disabled={testingEmail}
              className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 shadow-sm"
            >
              {testingEmail ? "Gönderiliyor…" : "🔔 Bildirim Kanalını Test Et"}
            </button>
            <button
              type="button"
              onClick={() => handleSendTestEmail("support")}
              disabled={testingEmail}
              className="flex-1 py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition disabled:opacity-50 shadow-sm"
            >
              {testingEmail ? "Gönderiliyor…" : "🛡️ Destek Kanalını Test Et"}
            </button>
          </div>

          {testEmailResult && (
            <div
              className={`p-3 rounded-2xl text-xs font-medium border animate-in fade-in ${
                testEmailResult.ok
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400"
              }`}
            >
              {testEmailResult.ok ? testEmailResult.message : testEmailResult.error}
            </div>
          )}
        </div>
      </section>

      {/* Tehlikeli Bölge: Hesabı Kalıcı Olarak Sil */}
      <section className="rounded-3xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-red-900 dark:text-red-200 flex items-center gap-2">
              ⚠️ Tehlikeli Bölge
            </h2>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
              Hesabınızı sildiğinizde profiliniz, bildirimleriniz ve size ait tüm veriler <strong>kalıcı olarak geri getirilemez şekilde silinir (KVKK uyumlu)</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="shrink-0 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm"
          >
            Hesabı Sil
          </button>
        </div>
      </section>

      {/* Hesap Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-200 dark:border-red-900 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 font-bold text-xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">Hesabı Kalıcı Olarak Sil</h3>
                <p className="text-xs text-zinc-500">Bu işlem geri alınamaz.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Hesabınızı ve tüm verilerinizi kalıcı olarak silmek istediğinizden emin misiniz? Onaylamak için lütfen <strong>mevcut şifrenizi</strong> girin:
            </p>

            {deleteErr && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs dark:bg-red-950/30 dark:text-red-400">
                {deleteErr}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Mevcut Şifreniz</label>
              <input
                type="password"
                className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-zinc-50 dark:bg-zinc-950 text-sm"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Mevcut şifrenizi yazın"
                autoFocus
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                checked={deleteSiteAlso}
                onChange={(e) => setDeleteSiteAlso(e.target.checked)}
              />
              <span>Yöneticisi olduğum siteyi ve siteye ait tüm duyuru/aidat verilerini de kalıcı olarak sil.</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteErr("");
                }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-50 transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-50 transition"
              >
                {deleting ? "Siliniyor…" : "Evet, Kalıcı Olarak Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-500 text-center">
        Şifrenizi unuttuysanız çıkış yapıp giriş sayfasından{" "}
        <Link href="/sifremi-unuttum" className="font-bold text-rose-600 underline">
          şifre sıfırlama
        </Link>{" "}
        kullanın (kayıtlı e-posta gerekir).
      </p>
    </div>
  );
}
