"use client";

import * as React from "react";

type Row = {
  id: string;
  subject: string;
  body: string;
  status: string;
  superAdminReply: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const statusLabel: Record<string, string> = {
  OPEN: "Açık",
  IN_PROGRESS: "İşlemde",
  RESOLVED: "Kapandı",
};

export default function AdminDestekPage() {
  const [list, setList] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [msg, setMsg] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);

  async function reload() {
    setErr("");
    const res = await fetch("/api/admin/support-tickets");
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(typeof j?.error === "string" ? j.error : "Liste alınamadı.");
      setList([]);
      return;
    }
    const j = (await res.json()) as Row[];
    setList(Array.isArray(j) ? j : []);
  }

  React.useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);
      await reload();
      if (ok) setLoading(false);
    })();
    return () => {
      ok = false;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setErr("");
    setMsg("");
    const res = await fetch("/api/admin/support-tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
    });
    const j = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setErr(typeof j?.error === "string" ? j.error : "Gönderilemedi.");
      return;
    }
    setMsg("Destek talebiniz platform yöneticilerine iletildi.");
    setSubject("");
    setBody("");
    await reload();
  }

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Platform destek talebi</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
          Site yöneticisi olarak teknik sorun, fatura, üyelik veya platform kullanımı hakkında doğrudan süper
          yöneticiye talep açabilirsiniz. Talepler yalnızca yetkili ekibimiz tarafından görüntülenir.
        </p>
      </div>

      {(err || msg) && (
        <div>
          {err && (
            <div className="p-3 rounded-2xl bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900 text-sm">
              {err}
            </div>
          )}
          {msg && !err && (
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900 text-sm">
              {msg}
            </div>
          )}
        </div>
      )}

      <section className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-rose-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
        <h2 className="font-bold text-zinc-900 dark:text-zinc-50 mb-4">Yeni talep oluştur</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Konu</label>
            <input
              required
              minLength={3}
              maxLength={200}
              className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-3"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Kısa başlık"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Açıklama</label>
            <textarea
              required
              minLength={10}
              maxLength={8000}
              rows={6}
              className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 resize-y min-h-[140px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Sorununuzu veya isteğinizi ayrıntılı yazın."
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-3 rounded-2xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-500 disabled:opacity-60 shadow-md shadow-rose-600/10"
          >
            {sending ? "Gönderiliyor…" : "Talebi gönder"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-rose-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Talepleriniz</h2>
          <p className="text-xs text-zinc-500 mt-1">{loading ? "Yükleniyor…" : `${list.length} kayıt`}</p>
        </div>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {list.map((t) => (
            <li key={t.id} className="p-6 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">{t.subject}</p>
                <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {statusLabel[t.status] ?? t.status}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{t.body}</p>
              {t.superAdminReply && (
                <div className="mt-3 p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide mb-1">
                    Platform yanıtı
                  </p>
                  <p className="text-sm text-indigo-900 dark:text-indigo-100 whitespace-pre-wrap">
                    {t.superAdminReply}
                  </p>
                </div>
              )}
              <p className="text-[11px] text-zinc-400">
                {t.createdAt && `Oluşturma: ${t.createdAt}`}
                {t.updatedAt && t.updatedAt !== t.createdAt && ` · Güncelleme: ${t.updatedAt}`}
              </p>
            </li>
          ))}
          {!loading && list.length === 0 && (
            <li className="py-14 px-6 text-center text-zinc-500 text-sm">
              Henüz talep oluşturmadınız.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
