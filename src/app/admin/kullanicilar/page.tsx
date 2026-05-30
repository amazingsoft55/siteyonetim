"use client";

import * as React from "react";
import { readJsonError, readJsonNotice } from "@/lib/json-error";
import { Mail, Pencil, Trash2 } from "lucide-react";
import { useAlert, useConfirm } from "@/components/ModalProvider";

type UserRow = {
  id: string;
  name: string;
  emailOrPhone: string;
  role: string;
  siteId: string | null;
  apartmentNo: string | null;
  createdAt: string | null;
};

type Tab = "admins" | "residents";

function isEmail(v: string) {
  return v.includes("@") && v.includes(".");
}

export default function AdminResidentsAccountsPage() {
  const showAlert = useAlert();
  const showConfirm = useConfirm();
  const [tab, setTab] = React.useState<Tab>("admins");
  const [list, setList] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [msg, setMsg] = React.useState("");
  const [selfId, setSelfId] = React.useState("");

  const [nuName, setNuName] = React.useState("");
  const [nuLogin, setNuLogin] = React.useState("");
  const [nuPass, setNuPass] = React.useState("");
  const [nuApt, setNuApt] = React.useState("");

  const [editOpen, setEditOpen] = React.useState<UserRow | null>(null);
  const [edName, setEdName] = React.useState("");
  const [edLogin, setEdLogin] = React.useState("");
  const [edPass, setEdPass] = React.useState("");
  const [edApt, setEdApt] = React.useState("");
  const [edRole, setEdRole] = React.useState<"ADMIN" | "USER">("USER");
  const [edSaving, setEdSaving] = React.useState(false);
  const [resetBusy, setResetBusy] = React.useState<string | null>(null);

  async function reload() {
    setErr("");
    const [ur, ar] = await Promise.all([
      fetch("/api/admin/users", { credentials: "include" }),
      fetch("/api/admin/account", { credentials: "include" }),
    ]);
    if (!ur.ok) {
      const j: unknown = await ur.json().catch(() => null);
      setErr(readJsonError(j, "Liste alınamadı."));
      return;
    }
    if (ar.ok) {
      const acc = (await ar.json()) as { id?: string };
      if (acc.id) setSelfId(acc.id);
    }
    const j = (await ur.json()) as UserRow[];
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

  const admins = React.useMemo(() => list.filter((u) => u.role === "ADMIN"), [list]);
  const residents = React.useMemo(() => list.filter((u) => u.role === "USER"), [list]);
  const visible = tab === "admins" ? admins : residents;

  function openEdit(u: UserRow) {
    setEditOpen(u);
    setEdName(u.name);
    setEdLogin(u.emailOrPhone);
    setEdPass("");
    setEdApt(u.apartmentNo ?? "");
    setEdRole(u.role as "ADMIN" | "USER");
    setErr("");
    setMsg("");
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nuName.trim(),
        emailOrPhone: nuLogin.replace(/\s+/g, "").trim(),
        password: nuPass,
        role: tab === "admins" ? "ADMIN" : "USER",
        apartmentNo: tab === "residents" ? nuApt.trim() || undefined : undefined,
      }),
    });
    const j: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      setErr(readJsonError(j, "Oluşturulamadı."));
      return;
    }
    setMsg(tab === "admins" ? "Yönetici eklendi." : "Sakin eklendi.");
    setNuName("");
    setNuLogin("");
    setNuPass("");
    setNuApt("");
    await reload();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editOpen) return;
    if (edPass.trim() && edPass.trim().length < 6) {
      setErr("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    setEdSaving(true);
    setErr("");
    setMsg("");
    const payload: Record<string, unknown> = {
      name: edName.trim(),
      emailOrPhone: edLogin.replace(/\s+/g, "").trim(),
      role: edRole,
    };
    if (edPass.trim()) payload.password = edPass;
    if (edRole === "USER") payload.apartmentNo = edApt.trim().length === 0 ? null : edApt.trim();

    const res = await fetch(`/api/admin/users/${editOpen.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j: unknown = await res.json().catch(() => null);
    setEdSaving(false);
    if (!res.ok) {
      setErr(readJsonError(j, "Güncellenemedi."));
      return;
    }
    setMsg(readJsonNotice(j) ?? "Kaydedildi.");
    setEditOpen(null);
    await reload();
  }

  async function del(u: UserRow) {
    if (!await showConfirm({ message: `${u.name} silinsin mi?`, variant: "warning", confirmLabel: "Sil" })) return;
    setErr("");
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE", credentials: "include" });
    const j: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      setErr(readJsonError(j, "Silinemedi."));
      return;
    }
    setMsg("Silindi.");
    await reload();
  }

  async function sendReset(u: UserRow) {
    if (!isEmail(u.emailOrPhone)) {
      setErr("Şifre sıfırlama maili için hesapta geçerli e-posta olmalı.");
      return;
    }
    setResetBusy(u.id);
    setErr("");
    const res = await fetch(`/api/admin/users/${u.id}/send-reset`, {
      method: "POST",
      credentials: "include",
    });
    const j: unknown = await res.json().catch(() => null);
    setResetBusy(null);
    if (!res.ok) {
      setErr(readJsonError(j, "Mail gönderilemedi."));
      return;
    }
    const m =
      j && typeof j === "object" && "message" in j && typeof (j as { message: unknown }).message === "string" ?
        (j as { message: string }).message
      : "Sıfırlama maili gönderildi.";
    setMsg(m);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Yönetim kurulu & sakinler</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Yönetici kurulu üyesi ekleyin, bilgileri güncelleyin; sakin hesapları oluşturun ve şifre sıfırlama maili
          gönderin.
        </p>
      </div>

      {(err || msg) && (
        <div className="space-y-2">
          {err && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 text-sm">
              {err}
            </div>
          )}
          {msg && !err && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 text-sm">
              {msg}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 w-fit">
        <button
          type="button"
          onClick={() => setTab("admins")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "admins" ? "bg-white dark:bg-zinc-900 shadow text-rose-600" : "text-zinc-600 dark:text-zinc-400"}`}
        >
          Yönetici kurulu ({admins.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("residents")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "residents" ? "bg-white dark:bg-zinc-900 shadow text-rose-600" : "text-zinc-600 dark:text-zinc-400"}`}
        >
          Sakinler ({residents.length})
        </button>
      </div>

      <section className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-rose-100 dark:border-zinc-800 p-6 shadow-sm">
        <h2 className="font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          {tab === "admins" ? "Yeni yönetici" : "Yeni sakin"}
        </h2>
        <form onSubmit={create} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Ad soyad</label>
            <input
              className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-3"
              value={nuName}
              onChange={(e) => setNuName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">E‑posta veya telefon</label>
            <input
              className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-3"
              value={nuLogin}
              onChange={(e) => setNuLogin(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Şifre</label>
            <input
              type="password"
              className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-3"
              value={nuPass}
              onChange={(e) => setNuPass(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {tab === "residents" && (
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Daire (isteğe bağlı)</label>
              <input
                className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-3"
                value={nuApt}
                onChange={(e) => setNuApt(e.target.value)}
                placeholder="Örn: 5"
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-500 shadow-md shadow-rose-600/10"
            >
              {tab === "admins" ? "Yönetici ekle" : "Sakin ekle"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-rose-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-50">
            {tab === "admins" ? "Yönetici kurulu" : "Kayıtlı sakinler"}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">{loading ? "Yükleniyor…" : `${visible.length} hesap`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-950">
              <tr className="text-xs uppercase text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                <th className="py-3 px-4 font-semibold">İsim</th>
                <th className="py-3 px-4 font-semibold">Oturum</th>
                {tab === "residents" && <th className="py-3 px-4 font-semibold">Daire</th>}
                <th className="py-3 px-4 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-rose-50/30 dark:hover:bg-zinc-800/40"
                >
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-50">
                    {u.name}
                    {u.id === selfId && (
                      <span className="ml-2 text-[10px] font-bold text-rose-600">(siz)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{u.emailOrPhone}</td>
                  {tab === "residents" && <td className="py-3 px-4">{u.apartmentNo ?? "—"}</td>}
                  <td className="py-3 px-4 text-right space-x-1">
                    {isEmail(u.emailOrPhone) && (
                      <button
                        type="button"
                        disabled={resetBusy === u.id}
                        onClick={() => void sendReset(u)}
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-xs disabled:opacity-50"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {resetBusy === u.id ? "…" : "Şifre maili"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold hover:underline text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Düzenle
                    </button>
                    {u.id !== selfId && (
                      <button
                        type="button"
                        onClick={() => del(u)}
                        className="inline-flex items-center gap-1 text-zinc-500 hover:text-red-600 font-bold text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Sil
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={tab === "residents" ? 4 : 3} className="py-10 px-4 text-center text-zinc-500">
                    {tab === "admins" ? "Henüz yönetici eklenmemiş." : "Henüz sakin eklenmemiş."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Hesabı düzenle</h3>
            <p className="text-xs text-zinc-500 mt-1">{editOpen.name}</p>
            <form onSubmit={saveEdit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">İsim</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-white dark:bg-zinc-950"
                  value={edName}
                  onChange={(e) => setEdName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">E‑posta veya telefon</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-white dark:bg-zinc-950"
                  value={edLogin}
                  onChange={(e) => setEdLogin(e.target.value)}
                  required
                />
              </div>
              {editOpen.id !== selfId && (
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Rol</label>
                  <select
                    className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-white dark:bg-zinc-950"
                    value={edRole}
                    onChange={(e) => setEdRole(e.target.value === "ADMIN" ? "ADMIN" : "USER")}
                  >
                    <option value="ADMIN">Yönetici</option>
                    <option value="USER">Sakin</option>
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Yeni şifre (opsiyonel)</label>
                <input
                  type="password"
                  placeholder="Boşsa değişmez (en az 6 karakter)"
                  className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-white dark:bg-zinc-950"
                  value={edPass}
                  onChange={(e) => setEdPass(e.target.value)}
                />
              </div>
              {edRole === "USER" && (
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Daire</label>
                  <input
                    className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-white dark:bg-zinc-950"
                    value={edApt}
                    onChange={(e) => setEdApt(e.target.value)}
                  />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(null)}
                  className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-sm font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={edSaving}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 text-white text-sm font-bold disabled:opacity-60"
                >
                  {edSaving ? "…" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
