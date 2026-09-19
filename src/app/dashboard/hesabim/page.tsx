"use client";

import * as React from "react";
import Link from "next/link";
import { readJsonError } from "@/lib/json-error";
import { KeyRound, Mail, User, ShieldAlert, CheckCircle2, ArrowLeft } from "lucide-react";

type ResidentAccountInfo = {
  id: string;
  name: string;
  emailOrPhone: string;
  role: string;
  apartmentNo?: string | null;
  siteName?: string | null;
};

export default function ResidentAccountPage() {
  const [info, setInfo] = React.useState<ResidentAccountInfo | null>(null);
  const [name, setName] = React.useState("");
  const [login, setLogin] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [msg, setMsg] = React.useState("");

  // Hesap Silme
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [deleteErr, setDeleteErr] = React.useState("");

  const load = React.useCallback(async () => {
    setErr("");
    try {
      const res = await fetch("/api/admin/account", { credentials: "include" });
      const j: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setErr(readJsonError(j, "Hesap bilgisi alınamadı."));
        return;
      }
      const data = j as ResidentAccountInfo;
      setInfo(data);
      setName(data.name);
      setLogin(data.emailOrPhone);
    } catch {
      setErr("Sunucuya bağlanılamadı.");
    }
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
      if (newPass.length < 6) {
        setErr("Yeni şifre en az 6 karakter olmalıdır.");
        setSaving(false);
        return;
      }
      if (newPass !== confirmPass) {
        setErr("Yeni şifreler eşleşmiyor.");
        setSaving(false);
        return;
      }
      payload.newPassword = newPass;
      payload.confirmPassword = confirmPass;
    }

    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j: unknown = await res.json().catch(() => null);
      setSaving(false);

      if (!res.ok) {
        setErr(readJsonError(j, "Bilgiler kaydedilemedi."));
        return;
      }

      setMsg("Hesap bilgileriniz başarıyla güncellendi.");
      setNewPass("");
      setConfirmPass("");
      await load();
    } catch {
      setErr("Sunucuya bağlanılamadı.");
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      setDeleteErr("Lütfen mevcut şifrenizi girin.");
      return;
    }
    setDeleting(true);
    setDeleteErr("");

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = (await res.json().catch(() => null)) as { error?: string; ok?: boolean } | null;

      if (!res.ok) {
        setDeleteErr(data?.error || "Hesap silinemedi. Lütfen şifrenizi kontrol edin.");
        setDeleting(false);
        return;
      }

      // Başarılı silme -> Yerel depolamayı temizle ve giriş sayfasına yönlendir
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

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hesabım & Profil</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kişisel bilgilerinizi ve şifrenizi güncelleyin.</p>
        </div>
      </div>

      {(err || msg) && (
        <div className="space-y-2 animate-in fade-in">
          {err && (
            <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
              <span>{err}</span>
            </div>
          )}
          {msg && !err && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{msg}</span>
            </div>
          )}
        </div>
      )}

      {/* Profil Güncelleme Kartı */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-5">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              Ad Soyad
            </label>
            <input
              className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              E‑posta veya Telefon (Giriş Bilgisi)
            </label>
            <input
              className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Şifre Değiştir</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <KeyRound className="h-3 w-3" />
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 bg-slate-50 text-sm focus:bg-white transition"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Boş bırakırsanız değişmez"
                  minLength={6}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Yeni Şifre (Tekrar)</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 bg-slate-50 text-sm focus:bg-white transition"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || loading}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition disabled:opacity-50"
          >
            {saving ? "Kaydediliyor…" : "Bilgileri Güncelle"}
          </button>
        </form>
      </section>

      {/* Tehlikeli Bölge: Hesabı Kalıcı Olarak Sil */}
      <section className="rounded-3xl bg-red-50/70 border border-red-200/80 p-6 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-red-950 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              Hesabı Kalıcı Olarak Sil
            </h2>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              Hesabınızı sildiğinizde daire kaydınız, profiliniz ve mesajlarınız <strong>kalıcı olarak geri getirilemez şekilde silinir (KVKK uyumlu)</strong>.
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

      {/* Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Hesabı Kalıcı Olarak Sil</h3>
                <p className="text-xs text-slate-500">Bu işlem geri alınamaz.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Hesabınızı ve daire erişiminizi kalıcı olarak silmek istediğinizden emin misiniz? Onaylamak için lütfen <strong>mevcut şifrenizi</strong> girin:
            </p>

            {deleteErr && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
                {deleteErr}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase">Mevcut Şifreniz</label>
              <input
                type="password"
                className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-red-500 transition"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Mevcut şifrenizi yazın"
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteErr("");
                }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
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
    </div>
  );
}
