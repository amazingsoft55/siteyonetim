"use client";

import * as React from "react";
import { Building2, Users, CreditCard, Shield, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SuperAdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    // Cookie silme işlemi API üzerinden yapılabilir ya da basitçe:
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0b0f19] text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight">Super Admin Paneli</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="p-6 bg-white dark:bg-zinc-900/50 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Toplam Site</p>
                <p className="text-2xl font-bold">1</p>
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
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900/50 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Aktif Abonelikler</p>
                <p className="text-2xl font-bold">Aktif</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/50 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 p-6">
          <h2 className="text-lg font-bold mb-4">Sistemdeki Siteler</h2>
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
                <tr className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="py-3 px-4 font-medium">Gül Apartmanı</td>
                  <td className="py-3 px-4 text-zinc-500">Çankaya, Ankara</td>
                  <td className="py-3 px-4 text-zinc-500">2024-05-24</td>
                  <td className="py-3 px-4">
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Yönet</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
