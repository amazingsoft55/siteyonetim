"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { readJsonError } from "@/lib/json-error";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";

type AccountInfo = {
  id: string;
  name: string;
  emailOrPhone: string;
  accountChangesCount: number;
  requiresVerificationForCredentials: boolean;
  canReceiveEmailCode: boolean;
  freeChangeRemaining: boolean;
};

export default function SuperAdminAccountPage() {
  const router = useRouter();
  const [info, setInfo] = React.useState<AccountInfo | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const [name, setName] = React.useState("");
  const [login, setLogin] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [code, setCode] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [sendingCode, setSendingCode] = React.useState(false);
  const [codeSentTo, setCodeSentTo] = React.useState("");

  const load = React.useCallback(async () => {
    setErr("");
    const res = await fetch("/api/super-admin/account", { credentials: "include" });
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
    const res = await fetch("/api/super-admin/account/send-code", {
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

    const res = await fetch("/api/super-admin/account", {
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

  async function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
    router.push("/login");
  }

  const needsCode = info?.requiresVerificationForCredentials === true;

  return (
    <div className="min-h-full bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-[#060a12] dark:via-[#0b0f19] dark:to-indigo-950/10">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {(err || msg) && (
          <div className="space-y-2">
            {err && (
              <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">
                {err}
              </div>
            )}
            {msg && !err && (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900">
                {msg}
              </div>
            )}
          </div>
        )}

        {info?.freeChangeRemaining && (
          <div className="flex gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-sm text-indigo-900 dark:text-indigo-200">
            <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <p>
              <strong>İlk değişiklik ücretsiz:</strong> E-posta veya şifrenizi bir kez doğrulama kodu
              olmadan güncelleyebilirsiniz. Sonraki değişikliklerde mevcut e-posta adresinize kod
              gönderilir.
            </p>
          </div>
        )}

        <section className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 shadow-sm">
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Ad soyad</label>
              <input
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                E-posta veya telefon (giriş)
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                  <KeyRound className="h-3.5 w-3.5" />
                  Yeni şifre
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Boş bırakırsanız değişmez"
                  minLength={6}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Yeni şifre (tekrar)
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {needsCode && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/20 p-4 space-y-3">
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
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    6 haneli kod
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 tracking-[0.3em] text-center font-mono"
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
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-60"
            >
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
