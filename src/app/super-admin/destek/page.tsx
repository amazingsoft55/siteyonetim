"use client";

import * as React from "react";
import Link from "next/link";
import { readJsonError } from "@/lib/json-error";
import { SuperAdminTopBar } from "@/components/SuperAdminTopBar";
import { Globe, Building2 } from "lucide-react";

type AdminTicketRow = {
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

type PublicRow = {
  id: string;
  source: string;
  name: string;
  email: string;
  phone: string | null;
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

export default function SuperAdminDestekPage() {
  const [adminList, setAdminList] = React.useState<AdminTicketRow[]>([]);
  const [pubList, setPubList] = React.useState<PublicRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [msg, setMsg] = React.useState("");
  const [tab, setTab] = React.useState<"public" | "admin">("public");

  const [adminActive, setAdminActive] = React.useState<AdminTicketRow | null>(null);
  const [adminReply, setAdminReply] = React.useState("");
  const [adminStatus, setAdminStatus] = React.useState<"OPEN" | "IN_PROGRESS" | "RESOLVED">("OPEN");
  const [adminSaving, setAdminSaving] = React.useState(false);

  const [pubActive, setPubActive] = React.useState<PublicRow | null>(null);
  const [pubReply, setPubReply] = React.useState("");
  const [pubStatus, setPubStatus] = React.useState<"OPEN" | "IN_PROGRESS" | "RESOLVED">("OPEN");
  const [pubSaving, setPubSaving] = React.useState(false);

  async function reload() {
    setErr("");
    const cred = { credentials: "include" as const };
    const [r1, r2] = await Promise.all([
      fetch("/api/super-admin/support-tickets", cred),
      fetch("/api/super-admin/public-contact", cred),
    ]);

    if (!r1.ok) {
      const j: unknown = await r1.json().catch(() => null);
      setErr(readJsonError(j, "Site yöneticisi talepleri okunamadı."));
      setAdminList([]);
      setPubList([]);
      return;
    }

    const adminJson = (await r1.json()) as unknown;
    const adminData = Array.isArray(adminJson) ? (adminJson as AdminTicketRow[]) : [];

    if (!r2.ok) {
      const j: unknown = await r2.json().catch(() => null);
      setErr(
        readJsonError(
          j,
          "İletişim mesajları okunamadı. Şemada `platform_public_contact` tablosu için `npm run db:apply` çalıştırın.",
        ),
      );
      setAdminList(adminData);
      setPubList([]);
      return;
    }

    const pubJson = (await r2.json()) as unknown;
    const pubData = Array.isArray(pubJson) ? (pubJson as PublicRow[]) : [];

    setAdminList(adminData);
    setPubList(pubData);
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

  function openAdminTicket(t: AdminTicketRow) {
    setAdminActive(t);
    setAdminReply(t.superAdminReply ?? "");
    setAdminStatus(t.status as typeof adminStatus);
    setPubActive(null);
    setErr("");
    setMsg("");
  }

  function openPublicRow(t: PublicRow) {
    setPubActive(t);
    setPubReply(t.superAdminReply ?? "");
    setPubStatus(t.status as typeof pubStatus);
    setAdminActive(null);
    setErr("");
    setMsg("");
  }

  async function saveAdminTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!adminActive) return;
    setAdminSaving(true);
    setErr("");
    const res = await fetch(`/api/super-admin/support-tickets/${adminActive.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: adminStatus, superAdminReply: adminReply }),
    });
    const j: unknown = await res.json().catch(() => null);
    setAdminSaving(false);
    if (!res.ok) {
      setErr(readJsonError(j, "Kaydedilemedi."));
      return;
    }
    setMsg("Kayıt güncellendi.");
    setAdminActive(null);
    await reload();
  }

  async function savePublicTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!pubActive) return;
    setPubSaving(true);
    setErr("");
    const res = await fetch(`/api/super-admin/public-contact/${pubActive.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: pubStatus, superAdminReply: pubReply }),
    });
    const j: unknown = await res.json().catch(() => null);
    setPubSaving(false);
    if (!res.ok) {
      setErr(readJsonError(j, "Kaydedilemedi."));
      return;
    }
    setMsg("Ziyaretçi kaydı güncellendi.");
    setPubActive(null);
    await reload();
  }

  const openPub = pubList.filter((x) => x.status === "OPEN").length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0b0f19] text-zinc-900 dark:text-zinc-100">
      <SuperAdminTopBar
        backHref="/super-admin"
        title="Destek merkezi"
        subtitle={
          loading ?
            "Yükleniyor…"
          : `${pubList.length} iletişim · ${adminList.length} site yöneticisi talebi`
        }
        actions={
          <Link href="/super-admin/kullanicilar" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
            Kullanıcılar
          </Link>
        }
      />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {(err || msg) && (
          <div>
            {err && (
              <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 text-sm space-y-2">
                <p>{err}</p>
                <button type="button" onClick={() => void reload()} className="text-xs font-bold underline">
                  Yenile
                </button>
              </div>
            )}
            {msg && !err && (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 text-sm">
                {msg}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("public")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold border transition-colors ${
              tab === "public" ?
                "bg-indigo-600 text-white border-indigo-600"
              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            }`}
          >
            <Globe className="h-4 w-4" />
            İletişim &amp; destek (ziyaretçi)
            {openPub > 0 ?
              <span className="text-[10px] rounded-full bg-white/20 px-2 py-0.5">{openPub} açık</span>
            : null}
          </button>
          <button
            type="button"
            onClick={() => setTab("admin")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold border transition-colors ${
              tab === "admin" ?
                "bg-indigo-600 text-white border-indigo-600"
              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Site yöneticileri
          </button>
        </div>

        {tab === "public" && (
          <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[720px]">
                <thead className="border-b border-zinc-100 dark:border-zinc-800 text-xs uppercase text-zinc-500 bg-zinc-50/80 dark:bg-zinc-950/50">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Kaynak</th>
                    <th className="py-3 px-4 font-semibold">Gönderen</th>
                    <th className="py-3 px-4 font-semibold">Konu</th>
                    <th className="py-3 px-4 font-semibold">Durum</th>
                    <th className="py-3 px-4 font-semibold text-right w-28">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {pubList.map((t) => (
                    <tr key={t.id} className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                      <td className="py-3 px-4 capitalize text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {t.source === "destek" ? "Destek formu" : "İletişim"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="block font-medium text-zinc-900 dark:text-zinc-50">{t.name}</span>
                        <span className="text-xs text-zinc-500">{t.email}</span>
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
                          onClick={() => openPublicRow(t)}
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
            {!loading && pubList.length === 0 && (
              <p className="py-12 text-center text-zinc-500 text-sm px-4">
                Henüz iletişim veya genel destek mesajı yok. Varsa tablo şema güncellenmemiş olabilir (
                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">platform_public_contact</code>).
              </p>
            )}
          </div>
        )}

        {tab === "admin" && (
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
                  {adminList.map((t) => (
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
                          onClick={() => openAdminTicket(t)}
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
            {!loading && adminList.length === 0 && (
              <p className="py-12 text-center text-zinc-500 text-sm">
                Bekleyen site yöneticisi talebi yok.
              </p>
            )}
          </div>
        )}
      </main>

      {adminActive && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold">{adminActive.subject}</h2>
              <p className="text-xs text-zinc-500 mt-1">
                {adminActive.siteName} · {adminActive.adminName} ({adminActive.adminContact})
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Mesaj</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{adminActive.body}</p>
            </div>
            <form onSubmit={saveAdminTicket} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase">Durum</label>
                <select
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950"
                  value={adminStatus}
                  onChange={(e) => setAdminStatus(e.target.value as typeof adminStatus)}
                >
                  <option value="OPEN">Açık</option>
                  <option value="IN_PROGRESS">İşlemde</option>
                  <option value="RESOLVED">Kapandı</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase">Yanıt (yöneticiye görünür)</label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950 min-h-[120px]"
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  maxLength={8000}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setAdminActive(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-bold">
                  Vazgeç
                </button>
                <button type="submit" disabled={adminSaving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-60">
                  {adminSaving ? "Kaydediliyor…" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pubActive && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                Ziyaretçi · {pubActive.source === "destek" ? "Destek formu" : "İletişim"}
              </span>
              <h2 className="text-lg font-bold mt-1">{pubActive.subject}</h2>
              <p className="text-xs text-zinc-500 mt-1">
                {pubActive.name} · {pubActive.email}
                {pubActive.phone ? ` · ${pubActive.phone}` : ""}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Mesaj</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{pubActive.body}</p>
            </div>
            <form onSubmit={savePublicTicket} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase">Durum</label>
                <select
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950"
                  value={pubStatus}
                  onChange={(e) => setPubStatus(e.target.value as typeof pubStatus)}
                >
                  <option value="OPEN">Açık</option>
                  <option value="IN_PROGRESS">İşlemde</option>
                  <option value="RESOLVED">Kapandı</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase">İç not / yanıt yazısı (kayıt için)</label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950 min-h-[120px]"
                  value={pubReply}
                  onChange={(e) => setPubReply(e.target.value)}
                  maxLength={8000}
                  placeholder="Çözüm notu… (otomatik e-posta gönderilmez)"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setPubActive(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-bold">
                  Vazgeç
                </button>
                <button type="submit" disabled={pubSaving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-60">
                  {pubSaving ? "Kaydediliyor…" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
