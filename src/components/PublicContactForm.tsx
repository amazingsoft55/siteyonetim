"use client";

import * as React from "react";
import Link from "next/link";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

export function PublicContactForm({
  defaultSource = "iletisim",
  headline = "Mesaj gönderin",
}: {
  defaultSource?: "iletisim" | "destek";
  headline?: string;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [source, setSource] = React.useState<"iletisim" | "destek">(defaultSource);
  const [company, setCompany] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState<string | null>(null);
  const [err, setErr] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setDone(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, body, source, company }),
      });
      const j: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        let msg = "Gönderilemedi.";
        if (j && typeof j === "object" && "error" in j && typeof (j as { error?: unknown }).error === "string") {
          msg = (j as { error: string }).error;
        }
        setErr(msg);
        return;
      }
      const okMsg =
        j && typeof j === "object" && "message" in j && typeof (j as { message?: unknown }).message === "string" ?
          (j as { message: string }).message
        : "Mesajınız alındı.";
      setDone(okMsg);
      setSubject("");
      setBody("");
    } catch {
      setErr("Ağ hatası. Bağlantınızı kontrol edin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-2xl font-bold mb-2">{headline}</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Mesajınız doğrudan platform yönetim ekibine iletilir. Yanıtlar kayıtlı e-postanıza iletilir.{" "}
        <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 underline">
          Site girişi
        </Link>{" "}
        farklıdır (sitelerin sakini/yöneticisi için).
      </p>

      {done && (
        <div className="mb-6 flex gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200/80 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{done}</p>
        </div>
      )}
      {err && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900 text-sm text-red-800 dark:text-red-200">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="hidden" aria-hidden="true">
          <label>Bir şirket adı seçmeyin (robot)</label>
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tür</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as typeof source)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2.5 px-4 focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="iletisim">Genel iletişim</option>
            <option value="destek">Teknik / ürün desteği</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad soyad</label>
          <input
            required
            type="text"
            maxLength={160}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2.5 px-4 focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-posta</label>
          <input
            required
            type="email"
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2.5 px-4 focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefon (isteğe bağlı)</label>
          <input
            type="tel"
            maxLength={48}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2.5 px-4 focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Konu</label>
          <input
            required
            type="text"
            maxLength={220}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2.5 px-4 focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mesaj</label>
          <textarea
            required
            rows={5}
            maxLength={8000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2.5 px-4 focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors inline-flex items-center justify-center gap-2"
        >
          {submitting ?
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gönderiliyor…
            </>
          : <>
              <Send className="h-4 w-4" />
              Gönder
            </>
          }
        </button>
      </form>
    </div>
  );
}
