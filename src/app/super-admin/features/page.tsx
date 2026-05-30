"use client";

import * as React from "react";
import Link from "next/link";
import {
  Puzzle,
  Plus,
  Trash2,
  Save,
  X,
  Pencil,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { SuperAdminTopBar } from "@/components/SuperAdminTopBar";
import { describeFailedResponse } from "@/lib/json-error";

type Feature = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  active: boolean;
  sortOrder: number;
};

const defaultCategories = [
  "Aidat Yönetimi",
  "Duyuru Sistemi",
  "Talep Yönetimi",
  "Raporlama",
  "Bildirimler",
  "Güvenlik",
  "Mobil",
  "Destek",
];

export default function SuperAdminFeaturesPage() {
  const [features, setFeatures] = React.useState<Feature[]>([]);
  const [loadErr, setLoadErr] = React.useState("");
  const [editing, setEditing] = React.useState<Feature | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const loadFeatures = React.useCallback(async () => {
    setLoadErr("");
    try {
      const res = await fetch("/api/super-admin/features", { credentials: "include" });
      const text = await res.text();
      if (!res.ok) {
        setLoadErr(describeFailedResponse(res.status, text, "Özellikler yüklenemedi."));
        return;
      }
      const json = JSON.parse(text) as Feature[];
      setFeatures(json);
    } catch {
      setLoadErr("Özellikler yüklenemedi.");
    }
  }, []);

  React.useEffect(() => {
    void loadFeatures();
  }, [loadFeatures]);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name) {
      setLoadErr("Özellik adı zorunludur.");
      return;
    }

    setSaving(true);
    setLoadErr("");
    try {
      let res: Response;
      if (isCreating) {
        res = await fetch("/api/super-admin/features", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
      } else {
        res = await fetch(`/api/super-admin/features/${editing.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
      }

      if (!res.ok) {
        const text = await res.text();
        setLoadErr(describeFailedResponse(res.status, text, "Kaydedilemedi."));
        return;
      }

      setEditing(null);
      setIsCreating(false);
      await loadFeatures();
    } catch {
      setLoadErr("Kaydetme hatası.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu özelliği silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/super-admin/features/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        setLoadErr(describeFailedResponse(res.status, text, "Silinemedi."));
        return;
      }
      await loadFeatures();
    } catch {
      setLoadErr("Silme hatası.");
    }
  };

  const toggleActive = async (feature: Feature) => {
    try {
      const res = await fetch(`/api/super-admin/features/${feature.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !feature.active }),
      });
      if (res.ok) await loadFeatures();
    } catch {
      /* silent */
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 via-zinc-50 to-white dark:from-[#060a12] dark:via-[#0b0f19] dark:to-zinc-950 text-zinc-900 dark:text-zinc-100">
      <SuperAdminTopBar
        title="Özellik Yönetimi"
        subtitle="Platformun sunduğu özellikleri yönetin"
        actions={
          <Link
            href="/super-admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        }
      />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {loadErr && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-950 dark:text-amber-100">
            {loadErr}
          </div>
        )}

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setEditing({ id: "", name: "", description: null, icon: null, category: "genel", active: true, sortOrder: 0 });
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 shadow-md"
          >
            <Plus className="h-4 w-4" />
            Yeni Özellik Ekle
          </button>
        )}

        {editing && (
          <div className="rounded-3xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{isCreating ? "Yeni Özellik" : "Özelliği Düzenle"}</h3>
              <button
                type="button"
                onClick={() => { setEditing(null); setIsCreating(false); }}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Özellik Adı *</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  placeholder="Örn: Aidat Takibi"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Kategori</label>
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                >
                  <option value="genel">Genel</option>
                  {defaultCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Açıklama</label>
                <input
                  type="text"
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value || null })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  placeholder="Kısa açıklama"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">İkon</label>
                <input
                  type="text"
                  value={editing.icon ?? ""}
                  onChange={(e) => setEditing({ ...editing, icon: e.target.value || null })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  placeholder="Örn: CreditCard"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Sıra</label>
                <input
                  type="number"
                  value={editing.sortOrder}
                  onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  min={0}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                className="rounded border-zinc-300 dark:border-zinc-600"
              />
              Aktif
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(null); setIsCreating(false); }}
                className="px-6 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`flex flex-col p-4 rounded-2xl border-2 transition-all ${
                feature.active
                  ? "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Puzzle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{feature.name}</h3>
                    <span className="text-[10px] text-zinc-500">{feature.category}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(feature)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {feature.active ? (
                    <Eye className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-zinc-400" />
                  )}
                </button>
              </div>

              {feature.description && (
                <p className="text-xs text-zinc-500 mb-3">{feature.description}</p>
              )}

              <div className="flex gap-2 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(feature);
                    setIsCreating(false);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  <Pencil className="h-3 w-3" />
                  Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(feature.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}

          {features.length === 0 && !editing && (
            <div className="col-span-full text-center py-16 text-zinc-500">
              <Puzzle className="h-12 w-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
              <p className="font-medium">Henüz özellik yok</p>
              <p className="text-sm mt-1">Yukarıdaki &quot;Yeni Özellik Ekle&quot; butonuyla başlayın.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
