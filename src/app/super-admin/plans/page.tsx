"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Trash2,
  Save,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Star,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { SuperAdminTopBar } from "@/components/SuperAdminTopBar";
import { describeFailedResponse } from "@/lib/json-error";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  period: string;
  features: string[];
  highlight: boolean;
  badge: string | null;
  cta: string;
  sortOrder: number;
  active: boolean;
};

const emptyPlan: Omit<Plan, "id"> = {
  name: "",
  description: "",
  price: 0,
  originalPrice: null,
  period: "/ay",
  features: [],
  highlight: false,
  badge: null,
  cta: "Hemen Başla",
  sortOrder: 0,
  active: true,
};

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [loadErr, setLoadErr] = React.useState("");
  const [editing, setEditing] = React.useState<Plan | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [featureInput, setFeatureInput] = React.useState("");

  const loadPlans = React.useCallback(async () => {
    setLoadErr("");
    try {
      const res = await fetch("/api/super-admin/plans", { credentials: "include" });
      const text = await res.text();
      if (!res.ok) {
        setLoadErr(describeFailedResponse(res.status, text, "Paketler yüklenemedi."));
        return;
      }
      const json = JSON.parse(text) as Plan[];
      setPlans(json);
    } catch {
      setLoadErr("Paketler yüklenemedi.");
    }
  }, []);

  React.useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name || editing.price <= 0) {
      setLoadErr("Paket adı ve fiyat zorunludur.");
      return;
    }

    setSaving(true);
    setLoadErr("");
    try {
      const payload = {
        ...editing,
        features: JSON.stringify(editing.features),
      };

      let res: Response;
      if (isCreating) {
        res = await fetch("/api/super-admin/plans", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/super-admin/plans/${editing.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const text = await res.text();
        setLoadErr(describeFailedResponse(res.status, text, "Kaydedilemedi."));
        return;
      }

      setEditing(null);
      setIsCreating(false);
      await loadPlans();
    } catch {
      setLoadErr("Kaydetme hatası.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu paketi silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/super-admin/plans/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        setLoadErr(describeFailedResponse(res.status, text, "Silinemedi."));
        return;
      }
      await loadPlans();
    } catch {
      setLoadErr("Silme hatası.");
    }
  };

  const toggleActive = async (plan: Plan) => {
    try {
      const res = await fetch(`/api/super-admin/plans/${plan.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !plan.active }),
      });
      if (res.ok) await loadPlans();
    } catch {
      /* silent */
    }
  };

  const addFeature = () => {
    if (!featureInput.trim() || !editing) return;
    setEditing({ ...editing, features: [...editing.features, featureInput.trim()] });
    setFeatureInput("");
  };

  const removeFeature = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, features: editing.features.filter((_, i) => i !== idx) });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 via-zinc-50 to-white dark:from-[#060a12] dark:via-[#0b0f19] dark:to-zinc-950 text-zinc-900 dark:text-zinc-100">
      <SuperAdminTopBar
        title="Paket Yönetimi"
        subtitle="Fiyatlandırma paketlerini düzenleyin"
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

        {/* Yeni paket butonu */}
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setEditing({ ...emptyPlan, id: "" });
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 shadow-md"
          >
            <Plus className="h-4 w-4" />
            Yeni Paket Ekle
          </button>
        )}

        {/* Düzenleme formu */}
        {editing && (
          <div className="rounded-3xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{isCreating ? "Yeni Paket" : "Paketi Düzenle"}</h3>
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setIsCreating(false);
                }}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Paket Adı *</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  placeholder="Örn: Başlangıç"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Açıklama</label>
                <input
                  type="text"
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  placeholder="Örn: Küçük siteler için ideal"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Fiyat (TL) *</label>
                <input
                  type="number"
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Orijinal Fiyat (TL)</label>
                <input
                  type="number"
                  value={editing.originalPrice ?? ""}
                  onChange={(e) => setEditing({ ...editing, originalPrice: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  min={0}
                  placeholder="İndirim göstermek için"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Dönem</label>
                <input
                  type="text"
                  value={editing.period}
                  onChange={(e) => setEditing({ ...editing, period: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  placeholder="/ay"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">CTA Butonu</label>
                <input
                  type="text"
                  value={editing.cta}
                  onChange={(e) => setEditing({ ...editing, cta: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  placeholder="Hemen Başla"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Badge</label>
                <input
                  type="text"
                  value={editing.badge ?? ""}
                  onChange={(e) => setEditing({ ...editing, badge: e.target.value || null })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  placeholder="Örn: En Popüler"
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

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.highlight}
                  onChange={(e) => setEditing({ ...editing, highlight: e.target.checked })}
                  className="rounded border-zinc-300 dark:border-zinc-600"
                />
                <Star className="h-4 w-4 text-amber-500" />
                Öne çıkarılmış
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="rounded border-zinc-300 dark:border-zinc-600"
                />
                Aktif
              </label>
            </div>

            {/* Özellikler */}
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-2 block">Özellikler</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  placeholder="Yeni özellik ekle..."
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  Ekle
                </button>
              </div>
              <div className="space-y-2">
                {editing.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                    <GripVertical className="h-4 w-4 text-zinc-400" />
                    <span className="flex-1 text-sm">{f}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {editing.features.length === 0 && (
                  <p className="text-xs text-zinc-400">Henüz özellik eklenmedi.</p>
                )}
              </div>
            </div>

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
                onClick={() => {
                  setEditing(null);
                  setIsCreating(false);
                }}
                className="px-6 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Paket listesi */}
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col p-5 rounded-2xl border-2 transition-all ${
                plan.highlight
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              } ${!plan.active ? "opacity-50" : ""}`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-4 px-3 py-0.5 text-[10px] font-bold text-white bg-indigo-600 rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-xs text-zinc-500 mt-0.5">{plan.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(plan)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title={plan.active ? "Pasifleştir" : "Aktifleştir"}
                >
                  {plan.active ? (
                    <Eye className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-zinc-400" />
                  )}
                </button>
              </div>

              <div className="mb-3">
                <span className="text-3xl font-extrabold">{plan.price}</span>
                <span className="text-sm text-zinc-500 ml-1">TL{plan.period}</span>
                {plan.originalPrice && (
                  <div className="text-xs text-zinc-400 line-through">{plan.originalPrice} TL</div>
                )}
              </div>

              <ul className="space-y-1.5 mb-4 flex-1">
                {plan.features.slice(0, 5).map((f, i) => (
                  <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
                {plan.features.length > 5 && (
                  <li className="text-xs text-zinc-400">+{plan.features.length - 5} özellik daha</li>
                )}
              </ul>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(plan);
                    setIsCreating(false);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(plan.id)}
                  className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {plans.length === 0 && !editing && (
            <div className="col-span-full text-center py-16 text-zinc-500">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
              <p className="font-medium">Henüz paket yok</p>
              <p className="text-sm mt-1">Yukarıdaki &quot;Yeni Paket Ekle&quot; butonuyla başlayın.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
