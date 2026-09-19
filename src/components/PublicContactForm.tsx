"use client";

import { useState } from "react";
import { getPublicSiteUrl } from "@/lib/site-url";

type Props = {
  defaultSource?: string;
  headline?: string;
};

export function PublicContactForm({ defaultSource = "iletisim", headline = "Mesaj gönderin" }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, source: defaultSource }),
      });
      if (!res.ok) throw new Error("Hata");
      setStatus("ok");
      setName(""); setEmail(""); setPhone(""); setMessage("");
    } catch {
      setStatus("err");
    }
  };

  if (status === "ok") {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center">
        <p className="text-emerald-700 dark:text-emerald-300 font-bold text-lg">Mesajınız gönderildi!</p>
        <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-2">En kısa sürede size dönüş yapacağız.</p>
        <button onClick={() => setStatus("idle")} className="mt-4 text-emerald-600 dark:text-emerald-400 text-sm font-semibold underline">Yeni mesaj gönder</button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{headline}</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="text" placeholder="Adınız Soyadınız" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        <input type="email" placeholder="E-posta adresiniz" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        <input type="tel" placeholder="Telefon (isteğe bağlı)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        <textarea placeholder="Mesajınız…" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
        {status === "err" && <p className="text-red-500 text-sm">Bir hata oluştu, tekrar deneyin.</p>}
        <button type="submit" disabled={status === "sending"} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition disabled:opacity-50">
          {status === "sending" ? "Gönderiliyor…" : "Gönder"}
        </button>
      </form>
    </div>
  );
}
