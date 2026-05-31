"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle,
  CreditCard,
  Crown,
  Star,
  Building2,
  Users,
  Megaphone,
  Wrench,
  Bell,
  Mail,
  BarChart3,
  Smartphone,
  Globe,
  Headphones,
  Lock,
  Zap,
  ArrowLeft,
  Plus,
  Pencil,
  X,
  Save,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Flame,
} from "lucide-react";
import { useAlert } from "@/components/ModalProvider";
import { SuperAdminTopBar } from "@/components/SuperAdminTopBar";
import {
  FEATURE_LABELS,
  FEATURE_CATEGORIES,
  type FeatureKey,
} from "@/lib/features";
import { describeFailedResponse } from "@/lib/json-error";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  period: string;
  featureIds: string[];
  highlight: boolean;
  badge: string | null;
  cta: string;
  sortOrder: number;
  active: boolean;
};

type PlatformFeature = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  active: boolean;
};

const emptyPlan: Omit<Plan, "id" | "featureIds"> = {
  name: "",
  description: "",
  price: 0,
  originalPrice: null,
  period: "/ay",
  highlight: false,
  badge: null,
  cta: "Hemen Başla",
  sortOrder: 0,
  active: true,
};

export default function SuperAdminPlansPage() {
  const showAlert = useAlert();
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [platformFeatures, setPlatformFeatures] = React.useState<PlatformFeature[]>([]);
  const [editing, setEditing] = React.useState<(Plan & { featureIds: string[] }) | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [loadErr, setLoadErr] = React.useState("");

  const loadData = React.useCallback(async () => {
    setLoadErr("");
    try {
      const [plansRes, featuresRes] = await Promise.all([
        fetch("/api/super-admin/plans", { credentials: "include" }),
        fetch("/api/super-admin/features", { credentials: "include" }),
      ]);

      if (plansRes.ok) {
        const data = await plansRes.json();
        if (Array.isArray(data)) setPlans(data);
      }

      if (featuresRes.ok) {
        const data = await featuresRes.json();
        if (Array.isArray(data)) setPlatformFeatures(data);
      }
    } catch {
      setLoadErr("Veriler yüklenemedi.");
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name || editing.price <= 0) {
      setLoadErr("Paket adı ve fiyat zorunludur.");
      return;
    }

    setSaving(true);
    setLoadErr("");
    try {
      let res: Response;
      if (isCreating) {
        res = await fetch("/api/super-admin/plans", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
      } else {
        res = await fetch(`/api/super-admin/plans/${editing.id}`, {
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
      await loadData();
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
      if (res.ok) await loadData();
    } catch {
      /* silent */
    }
  };

  const toggleFeature = (featureId: string) => {
    if (!editing) return;
    const has = editing.featureIds.includes(featureId);
    setEditing({
      ...editing,
      featureIds: has
        ? editing.featureIds.filter((f) => f !== featureId)
        : [...editing.featureIds, featureId],
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SuperAdminTopBar
        title="Fiyatlandırma Yönetimi"
        subtitle="Paketleri oluşturun, düzenleyin, silin"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {loadErr && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-950 dark:text-amber-100">
            {loadErr}
          </div>
        )}

        {/* Yeni paket butonu */}
        {!editing && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Paketler</h2>
              <p className="text-xs text-zinc-500 mt-1">{plans.length} paket mevcut</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditing({ ...emptyPlan, id: "", featureIds: [] });
                setIsCreating(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 shadow-md"
            >
              <Plus className="h-4 w-4" />
              Yeni Paket
            </button>
          </div>
        )}

        {/* Düzenleme formu */}
        {editing && (
          <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                {isCreating ? "Yeni Paket Oluştur" : "Paketi Düzenle"}
              </h3>
              <button
                type="button"
                onClick={() => { setEditing(null); setIsCreating(false); }}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  onChange={(e) => setEditing({ ...editing, description: e.target.value || null })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  placeholder="Küçük siteler için ideal"
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
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Orijinal Fiyat</label>
                <input
                  type="number"
                  value={editing.originalPrice ?? ""}
                  onChange={(e) => setEditing({ ...editing, originalPrice: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  min={0}
                  placeholder="İndirim için"
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
                  placeholder="En Popüler"
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
                <Flame className="h-4 w-4 text-amber-500" />
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

            {/* Özellik seçimi */}
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-3 block">
                Bu Paketteki Özellikler ({editing.featureIds.length} seçili)
              </label>
              {FEATURE_CATEGORIES.map((cat) => (
                <div key={cat.name} className="mb-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">{cat.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {cat.features.map((f) => {
                      const feature = platformFeatures.find((pf) => pf.name === FEATURE_LABELS[f]);
                      const featureId = feature?.id || f;
                      const isSelected = editing.featureIds.includes(featureId);
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            if (feature?.id) toggleFeature(feature.id);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                              : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle className="h-3 w-3 shrink-0" />
                          ) : (
                            <span className="h-3 w-3 rounded-full border-2 border-zinc-300 dark:border-zinc-600 shrink-0" />
                          )}
                          {FEATURE_LABELS[f]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(null); setIsCreating(false); }}
                className="px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
              className={`flex flex-col rounded-2xl border-2 transition-all ${
                plan.highlight
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              } ${!plan.active ? "opacity-50" : ""}`}
            >
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{plan.name}</h3>
                      {plan.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-xs text-zinc-500 mt-1">{plan.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(plan);
                        setIsCreating(false);
                      }}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Pencil className="h-4 w-4 text-zinc-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(plan.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{plan.price}</span>
                  <span className="text-sm text-zinc-500">TL{plan.period}</span>
                  {plan.originalPrice && (
                    <span className="text-sm text-zinc-400 line-through">{plan.originalPrice} TL</span>
                  )}
                </div>
              </div>

              <div className="flex-1 p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  {plan.featureIds.length} özellik
                </p>
                <div className="space-y-1">
                  {plan.featureIds.slice(0, 6).map((fid) => {
                    const feat = platformFeatures.find((pf) => pf.id === fid);
                    return (
                      <div key={fid} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                        {feat?.name || fid}
                      </div>
                    );
                  })}
                  {plan.featureIds.length > 6 && (
                    <p className="text-[10px] text-zinc-400">+{plan.featureIds.length - 6} daha</p>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                <span className={`text-xs font-bold ${plan.active ? "text-emerald-600" : "text-zinc-400"}`}>
                  {plan.active ? "Aktif" : "Pasif"}
                </span>
              </div>
            </div>
          ))}

          {plans.length === 0 && !editing && (
            <div className="col-span-full text-center py-16 text-zinc-500">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
              <p className="font-medium">Henüz paket yok</p>
              <p className="text-sm mt-1">"Yeni Paket" butonuyla başlayın.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
