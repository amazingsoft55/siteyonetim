"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, Users, UserRound, Shield, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type SiteRow = { id: string; name: string; address: string | null; createdAt: string | null };
type UserRow = { role: string };

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [sites, setSites] = React.useState<SiteRow[]>([]);
  const [userRows, setUserRows] = React.useState<UserRow[]>([]);
  const [loadErr, setLoadErr] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadErr("");
      const [sr, ur] = await Promise.all([
        fetch("/api/super-admin/sites"),
        fetch("/api/super-admin/users"),
      ]);
      if (!mounted) return;
      if (!sr.ok || !ur.ok) {
        const j = (sr.ok ? await ur.json().catch(() => ({})) : await sr.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        setLoadErr(typeof j.error === "string" ? j.error : "Veriler yüklenemedi.");
        return;
      }
      const sJson = (await sr.json()) as SiteRow[];
      const uJson = (await ur.json()) as UserRow[];
      setSites(Array.isArray(sJson) ? sJson : []);
      setUserRows(Array.isArray(uJson) ? uJson : []);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const adminCount = userRows.filter((u) => u.role === "ADMIN").length;
  const userCount = userRows.length;

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0b0f19] text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-indigo-600 shrink-0" />
            <h1 className="text-xl font-bold tracking-tight">Super Admin Paneli</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <Link
              href="/super-admin/kullanicilar"
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
            >
              Siteler & kullanıcılar
            </Link>
            <Link
              href="/super-admin/destek"
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
            >
              Yönetici destek
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors whitespace-nowrap"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loadErr && (
          <div className="mb-6 space-y-2">
            <div className="p-4 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-900 text-sm">
              {loadErr}
            </div>
            <Link
              href="/kurulum"
              className="inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Veritabanı ve yerel kurulum rehberi →
            </Link>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="p-6 bg-white dark:bg-zinc-900/50 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Toplam Site</p>
                <p className="text-2xl font-bold">{sites.length}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900/50 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Yöneticiler</p>
                <p className="text-2xl font-bold">{adminCount}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900/50 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Toplam Hesap</p>
                <p className="text-2xl font-bold">{userCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/50 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold">Sistemdeki Siteler</h2>
            <Link
              href="/super-admin/kullanicilar"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Site ve kullanıcı yönetimine git →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-3 px-4 text-sm font-medium text-zinc-500">Site Adı</th>
                  <th className="py-3 px-4 text-sm font-medium text-zinc-500">Adres</th>
                  <th className="py-3 px-4 text-sm font-medium text-zinc-500">Kayıt Tarihi</th>
                  <th className="py-3 px-4 text-sm font-medium text-zinc-500">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                  >
                    <td className="py-3 px-4 font-medium">{s.name}</td>
                    <td className="py-3 px-4 text-zinc-500">{s.address ?? "—"}</td>
                    <td className="py-3 px-4 text-zinc-500">{s.createdAt ?? "—"}</td>
                    <td className="py-3 px-4">
                      <Link
                        href="/super-admin/kullanicilar"
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        Yönet
                      </Link>
                    </td>
                  </tr>
                ))}
                {sites.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-zinc-500">
                      Kayıtlı site yok. Üst menüden yönetim sayfasına giderek site oluşturun.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
