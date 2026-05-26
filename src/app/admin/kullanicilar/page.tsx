"use client";

import * as React from "react";
import { readJsonError, readJsonNotice } from "@/lib/json-error";
import { Pencil, Trash2 } from "lucide-react";

type UserRow = {
  id: string;
  name: string;
  emailOrPhone: string;
  role: string;
  siteId: string | null;
  apartmentNo: string | null;
  createdAt: string | null;
};

export default function AdminResidentsAccountsPage() {
  const [list, setList] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const [nuName, setNuName] = React.useState("");
  const [nuLogin, setNuLogin] = React.useState("");
  const [nuPass, setNuPass] = React.useState("");
  const [nuApt, setNuApt] = React.useState("");

  const [editOpen, setEditOpen] = React.useState<UserRow | null>(null);
  const [edName, setEdName] = React.useState("");
  const [edLogin, setEdLogin] = React.useState("");
  const [edPass, setEdPass] = React.useState("");
  const [edApt, setEdApt] = React.useState("");
  const [edSaving, setEdSaving] = React.useState(false);

  async function reload() {
    setErr("");
    const res = await fetch("/api/admin/users");
    if (!res.ok) {
      const j: unknown = await res.json().catch(() => null);
      setErr(readJsonError(j, "Liste alınamadı."));
      return;
    }
    const j = (await res.json()) as UserRow[];
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

  function openEdit(u: UserRow) {
    setEditOpen(u);
    setEdName(u.name);
    setEdLogin(u.emailOrPhone);
    setEdPass("");
    setEdApt(u.apartmentNo ?? "");
    setErr("");
    setMsg("");
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nuName.trim(),
        emailOrPhone: nuLogin.replace(/\s+/g, "").trim(),
        password: nuPass,
        apartmentNo: nuApt.trim() || undefined,
      }),
    });
    const j: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      setErr(readJsonError(j, "Oluşturulamadı."));
      return;
    }
    void j;
    setMsg("Sakin hesabı eklendi.");
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
      apartmentNo: edApt.trim().length === 0 ? null : edApt.trim(),
    };
    if (edPass.trim()) payload.password = edPass;

    const res = await fetch(`/api/admin/users/${editOpen.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j: unknown = await res.json().catch(() => null);
    setEdSaving(false);
    if (!res.ok) {
      setErr(readJsonError(j, "Güncellenemedi."));
      return;
    }
    const n = readJsonNotice(j);
    if (n) setMsg(n);
    else setMsg("Kaydedildi.");
    setEditOpen(null);
    await reload();
  }

  async function del(u: UserRow) {
    if (!window.confirm(`${u.name} silinsin mi?`)) return;
    setErr("");
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const j: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      setErr(readJsonError(j, "Silinemedi."));
      return;
    }
    void j;
    setMsg("Silindi.");
    await reload();
  }

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Sakin hesapları</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Bu siteye bağlı kullanıcıları oluşturun; oturum adı veya şifreyi gerektiğinde güncelleyin.
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

      <section className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-rose-100 dark:border-zinc-800 p-6 shadow-sm">
        <h2 className="font-bold text-zinc-900 dark:text-zinc-50 mb-4">Yeni sakin</h2>
        <form onSubmit={create} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
              Ad soyad
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-3"
              value={nuName}
              onChange={(e) => setNuName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
              E‑posta veya telefon
            </label>
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
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
              Daire (isteğe bağlı)
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-3"
              value={nuApt}
              onChange={(e) => setNuApt(e.target.value)}
              placeholder="Örn: 5"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-500 shadow-md shadow-rose-600/10"
            >
              Sakin ekle
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-rose-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Kayıtlı sakinler</h2>
          <p className="text-xs text-zinc-500 mt-1">
            {loading ? "Yükleniyor…" : `${list.length} hesap`}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-950">
              <tr className="text-xs uppercase text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                <th className="py-3 px-4 font-semibold">İsim</th>
                <th className="py-3 px-4 font-semibold">Oturum</th>
                <th className="py-3 px-4 font-semibold">Daire</th>
                <th className="py-3 px-4 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-rose-50/30 dark:hover:bg-zinc-800/40"
                >
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-50">
                    {u.name}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{u.emailOrPhone}</td>
                  <td className="py-3 px-4">{u.apartmentNo ?? "—"}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold hover:underline text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => del(u)}
                      className="inline-flex items-center gap-1 text-zinc-500 hover:text-red-600 font-bold text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 px-4 text-center text-zinc-500">
                    Henüz sakin eklenmemiş.
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
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Sakini düzenle</h3>
            <p className="text-xs text-zinc-500 mt-1">{editOpen.name}</p>
            <form onSubmit={saveEdit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
                  İsim
                </label>
                <input
                  className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-white dark:bg-zinc-950"
                  value={edName}
                  onChange={(e) => setEdName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
                  E‑posta veya telefon
                </label>
                <input
                  className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-white dark:bg-zinc-950"
                  value={edLogin}
                  onChange={(e) => setEdLogin(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
                  Yeni şifre (opsiyonel)
                </label>
                <input
                  type="password"
                  placeholder="Boşsa değişmez (en az 6 karakter)"
                  className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-white dark:bg-zinc-950"
                  value={edPass}
                  onChange={(e) => setEdPass(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
                  Daire
                </label>
                <input
                  className="mt-1 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 bg-white dark:bg-zinc-950"
                  value={edApt}
                  onChange={(e) => setEdApt(e.target.value)}
                />
              </div>
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
