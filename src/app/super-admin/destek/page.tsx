"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, LifeBuoy } from "lucide-react";

type Row = {
  id: string;
  subject: string;
  body: string;
  status: string;
  superAdminReply: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  siteId: string;
  siteName: string;
  adminUserId: string;
  adminName: string;
  adminContact: string;
};

const statusLabel: Record<string, string> = {
  OPEN: "Açık",
  IN_PROGRESS: "İşlemde",
  RESOLVED: "Kapandı",
};

export default function SuperAdminDestekPage() {
  const [list, setList] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [msg, setMsg] = React.useState("");
  const [active, setActive] = React.useState<Row | null>(null);
  const [reply, setReply] = React.useState("");
  const [status, setStatus] = React.useState<"OPEN" | "IN_PROGRESS" | "RESOLVED">("OPEN");
  const [saving, setSaving] = React.useState(false);

  async function reload() {
    setErr("");
    const res = await fetch("/api/super-admin/support-tickets");
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(typeof j?.error === "string" ? j.error : "Liste alınamadı.");
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

  function openTicket(t: Row) {
    setActive(t);
    setReply(t.superAdminReply ?? "");
    setStatus(t.status as "OPEN" | "IN_PROGRESS" | "RESOLVED");
    setMsg("");
    setErr("");
  }

  async function saveTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;
    setSaving(true);
    setErr("");
    const res = await fetch(`/api/super-admin/support-tickets/${active.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, superAdminReply: reply }),
    });
    const j = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setErr(typeof j?.error === "string" ? j.error : "Kaydedilemedi.");
      return;
    }
    setMsg("Güncellendi.");
    setActive(null);
    await reload();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0b0f19] text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/super-admin" className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <LifeBuoy className="h-6 w-6 text-indigo-600 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">Yönetici destek talepleri</h1>
              <p className="text-xs text-zinc-500 truncate">
                {loading ? "Yükleniyor…" : `${list.length} talep`}
              </p>
            </div>
          </div>
          <Link
            href="/super-admin/kullanicilar"
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            Kullanıcılar
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {(err || msg) && (
          <div>
            {err && (
              <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 text-sm">
                {err}
              </div>
            )}
            {msg && !err && (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 text-sm">
                {msg}
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[820px]">
              <thead className="border-b border-zinc-100 dark:border-zinc-800 text-xs uppercase text-zinc-500 bg-zinc-50/80 dark:bg-zinc-950/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">Site</th>
                  <th className="py-3 px-4 font-semibold">Yönetici</th>
                  <th className="py-3 px-4 font-semibold">Konu</th>
                  <th className="py-3 px-4 font-semibold">Durum</th>
                  <th className="py-3 px-4 font-semibold text-right w-28">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id} className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <td className="py-3 px-4 font-medium">{t.siteName}</td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      <span className="block text-zinc-900 dark:text-zinc-50 font-medium">{t.adminName}</span>
                      <span className="text-xs">{t.adminContact}</span>
                    </td>
                    <td className="py-3 px-4 max-w-[240px] truncate" title={t.subject}>
                      {t.subject}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold uppercase">{statusLabel[t.status] ?? t.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openTicket(t)}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-xs"
                      >
                        Yönet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && list.length === 0 && (
            <p className="py-12 text-center text-zinc-500 text-sm">
              Bekleyen yönetici destek talebi yok.
            </p>
          )}
        </div>
      </main>

      {active && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold">{active.subject}</h2>
              <p className="text-xs text-zinc-500 mt-1">
                {active.siteName} · {active.adminName} ({active.adminContact})
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Mesaj</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{active.body}</p>
            </div>
            <form onSubmit={saveTicket} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase">Durum</label>
                <select
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                >
                  <option value="OPEN">Açık</option>
                  <option value="IN_PROGRESS">İşlemde</option>
                  <option value="RESOLVED">Kapandı</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase">
                  Yanıt (yöneticiye görünür)
                </label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950 min-h-[120px]"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  maxLength={8000}
                  placeholder="Çözüm notu veya yönlendirme…"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor…" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
