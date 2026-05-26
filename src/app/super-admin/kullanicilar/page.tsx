"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, LogOut, Trash2, Pencil } from "lucide-react";

type SiteRow = {
  id: string;
  name: string;
  address: string | null;
  createdAt: string | null;
};

type UserRow = {
  id: string;
  name: string;
  emailOrPhone: string;
  role: string;
  siteId: string | null;
  apartmentNo: string | null;
  createdAt: string | null;
};

function roleLabel(r: string) {
  if (r === "SUPER_ADMIN") return "Süper yönetici";
  if (r === "ADMIN") return "Yönetici";
  return "Sakin";
}

export default function SuperAdminUsersPage() {
  const router = useRouter();
  const [sites, setSites] = React.useState<SiteRow[]>([]);
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const [newSiteName, setNewSiteName] = React.useState("");
  const [newSiteAddr, setNewSiteAddr] = React.useState("");

  const [nuName, setNuName] = React.useState("");
  const [nuLogin, setNuLogin] = React.useState("");
  const [nuPass, setNuPass] = React.useState("");
  const [nuRole, setNuRole] = React.useState<"ADMIN" | "USER">("ADMIN");
  const [nuSite, setNuSite] = React.useState("");
  const [nuApt, setNuApt] = React.useState("");

  const [editOpen, setEditOpen] = React.useState<UserRow | null>(null);
  const [edName, setEdName] = React.useState("");
  const [edLogin, setEdLogin] = React.useState("");
  const [edPass, setEdPass] = React.useState("");
  const [edRole, setEdRole] = React.useState<"SUPER_ADMIN" | "ADMIN" | "USER">("ADMIN");
  const [edSite, setEdSite] = React.useState("");
  const [edApt, setEdApt] = React.useState("");
  const [edSaving, setEdSaving] = React.useState(false);

  async function reload() {
    setErr("");
    const [sr, ur] = await Promise.all([
      fetch("/api/super-admin/sites"),
      fetch("/api/super-admin/users"),
    ]);
    if (!sr.ok) {
      const j = await sr.json().catch(() => ({}));
      setErr(typeof j?.error === "string" ? j.error : "Siteler alınamadı.");
      return;
    }
    if (!ur.ok) {
      const j = await ur.json().catch(() => ({}));
      setErr(typeof j?.error === "string" ? j.error : "Kullanıcılar alınamadı.");
      return;
    }
    const sJson = (await sr.json()) as SiteRow[];
    const uJson = (await ur.json()) as UserRow[];
    setSites(Array.isArray(sJson) ? sJson : []);
    setUsers(Array.isArray(uJson) ? uJson : []);
    if (!nuSite && sJson?.[0]?.id) setNuSite(sJson[0].id);
  }

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      await reload();
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const siteNameOf = React.useCallback(
    (id: string | null) => sites.find((s) => s.id === id)?.name ?? "—",
    [sites],
  );

  function openEdit(u: UserRow) {
    setEditOpen(u);
    setEdName(u.name);
    setEdLogin(u.emailOrPhone);
    setEdPass("");
    setEdRole(u.role as "SUPER_ADMIN" | "ADMIN" | "USER");
    setEdSite(u.siteId ?? "");
    setEdApt(u.apartmentNo ?? "");
    setErr("");
    setMsg("");
  }

  async function createSite(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const res = await fetch("/api/super-admin/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newSiteName.trim(),
        address: newSiteAddr.trim() || undefined,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(typeof j?.error === "string" ? j.error : "Site oluşturulamadı.");
      return;
    }
    setMsg("Site eklendi.");
    setNewSiteName("");
    setNewSiteAddr("");
    await reload();
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!nuSite) {
      setErr("Önce en az bir site oluşturun.");
      return;
    }
    const res = await fetch("/api/super-admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nuName.trim(),
        emailOrPhone: nuLogin.replace(/\s+/g, "").trim(),
        password: nuPass,
        role: nuRole,
        siteId: nuSite,
        apartmentNo: nuApt.trim() || undefined,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(typeof j?.error === "string" ? j.error : "Kullanıcı oluşturulamadı.");
      return;
    }
    void j;
    setMsg("Kullanıcı eklendi.");
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
    if (edRole !== "SUPER_ADMIN") payload.siteId = edSite || null;
    else payload.siteId = null;
    payload.apartmentNo =
      edApt.trim().length === 0 ? null : edApt.trim();

    const res = await fetch(`/api/super-admin/users/${editOpen.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json().catch(() => ({}));
    setEdSaving(false);
    if (!res.ok) {
      setErr(typeof j?.error === "string" ? j.error : "Kayıt güncellenemedi.");
      return;
    }
    if (typeof j?.notice === "string") setMsg(j.notice);
    else setMsg("Güncellendi.");
    setEditOpen(null);
    await reload();
  }

  async function deleteUser(u: UserRow) {
    if (
      !window.confirm(
        `${u.name} silinsin mi? İlgili talep ve ödeme kayıtları da kaldırılır.`,
      )
    )
      return;
    setErr("");
    setMsg("");
    const res = await fetch(`/api/super-admin/users/${u.id}`, { method: "DELETE" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(typeof j?.error === "string" ? j.error : "Silinemedi.");
      return;
    }
    setMsg("Silindi.");
    await reload();
  }

  async function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
    router.push("/login");
  }

  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0b0f19] text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/super-admin"
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
              aria-label="Panele dön"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Shield className="h-6 w-6 text-indigo-600 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight truncate">Siteler & kullanıcılar</h1>
              <p className="text-xs text-zinc-500 truncate">
                {loading ? "Yükleniyor…" : `${sites.length} site · ${adminCount} yönetici · ${users.length} toplam hesap`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Çıkış
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
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

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 shadow-sm">
            <h2 className="font-bold mb-4">Yeni site</h2>
            <form onSubmit={createSite} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Site adı
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  required
                  placeholder="Örn: Yasemin Sitesi"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Adres (isteğe bağlı)
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                  value={newSiteAddr}
                  onChange={(e) => setNewSiteAddr(e.target.value)}
                  placeholder="İlçe, şehir"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold"
              >
                Site ekle
              </button>
            </form>
          </section>

          <section className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 shadow-sm">
            <h2 className="font-bold mb-4">Yeni yönetici veya sakin</h2>
            <form onSubmit={createUser} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Ad soyad
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                    value={nuName}
                    onChange={(e) => setNuName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    E‑posta veya telefon
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                    value={nuLogin}
                    onChange={(e) => setNuLogin(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Şifre
                  </label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                    value={nuPass}
                    onChange={(e) => setNuPass(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Rol
                  </label>
                  <select
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                    value={nuRole}
                    onChange={(e) =>
                      setNuRole(e.target.value === "USER" ? "USER" : "ADMIN")
                    }
                  >
                    <option value="ADMIN">Yönetici</option>
                    <option value="USER">Sakin</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Site
                  </label>
                  <select
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                    value={nuSite}
                    onChange={(e) => setNuSite(e.target.value)}
                    disabled={sites.length === 0}
                    required
                  >
                    <option value="">
                      {sites.length === 0 ? "Önce site ekleyin" : "Site seçin"}
                    </option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Daire (isteğe bağlı)
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2"
                    value={nuApt}
                    onChange={(e) => setNuApt(e.target.value)}
                    placeholder="Örn: 12"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={sites.length === 0}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white text-sm font-bold disabled:opacity-50"
              >
                Kullanıcı oluştur
              </button>
            </form>
          </section>
        </div>

        <section className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 shadow-sm overflow-x-auto">
          <h2 className="font-bold mb-4">Tüm kullanıcılar</h2>
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-xs uppercase text-zinc-500">
                <th className="py-2 pr-2">İsim</th>
                <th className="py-2 pr-2">Oturum</th>
                <th className="py-2 pr-2">Rol</th>
                <th className="py-2 pr-2">Site</th>
                <th className="py-2 pr-2">Daire</th>
                <th className="py-2 pl-2 text-right w-36">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800 text-sm">
                  <td className="py-2.5 pr-2 font-medium">{u.name}</td>
                  <td className="py-2.5 pr-2 text-zinc-600 dark:text-zinc-400">{u.emailOrPhone}</td>
                  <td className="py-2.5 pr-2">{roleLabel(u.role)}</td>
                  <td className="py-2.5 pr-2">{siteNameOf(u.siteId)}</td>
                  <td className="py-2.5 pr-2">{u.apartmentNo ?? "—"}</td>
                  <td className="py-2.5 pl-2 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteUser(u)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    Henüz kullanıcı yok. Seed ile süper admin gelir.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {editOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 p-4">
            <div
              role="dialog"
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-bold text-lg mb-1">Kullanıcı düzenle</h3>
              <p className="text-xs text-zinc-500 mb-4">{editOpen.emailOrPhone}</p>
              <form onSubmit={saveEdit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase">İsim</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950"
                    value={edName}
                    onChange={(e) => setEdName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase">
                    Yeni oturum (e‑posta/telefon)
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950"
                    value={edLogin}
                    onChange={(e) => setEdLogin(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase">
                    Yeni şifre (boş bırakırsanız değişmez)
                  </label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950"
                    value={edPass}
                    onChange={(e) => setEdPass(e.target.value)}
                    placeholder="Boşsa değişmez (en az 6 karakter)"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Rol</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950"
                    value={edRole}
                    onChange={(e) =>
                      setEdRole(e.target.value as "SUPER_ADMIN" | "ADMIN" | "USER")
                    }
                  >
                    <option value="SUPER_ADMIN">Süper yönetici</option>
                    <option value="ADMIN">Yönetici</option>
                    <option value="USER">Sakin</option>
                  </select>
                </div>
                {edRole !== "SUPER_ADMIN" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase">
                        Site
                      </label>
                      <select
                        className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950"
                        value={edSite}
                        onChange={(e) => setEdSite(e.target.value)}
                        required
                      >
                        {sites.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase">
                        Daire
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950"
                        value={edApt}
                        onChange={(e) => setEdApt(e.target.value)}
                        placeholder="Örn: 12"
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditOpen(null)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-bold"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={edSaving}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-60"
                  >
                    {edSaving ? "Kaydediliyor…" : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
