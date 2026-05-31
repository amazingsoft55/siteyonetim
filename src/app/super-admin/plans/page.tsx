"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle,
  CreditCard,
  Plus,
  Pencil,
  X,
  Save,
  Trash2,
  ArrowLeft,
  Flame,
  Search,
  Puzzle,
} from "lucide-react";
import { useAlert } from "@/components/ModalProvider";
import { SuperAdminTopBar } from "@/components/SuperAdminTopBar";
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

const emptyPlan = {
  name: "",
  description: "",
  price: 0,
  originalPrice: null as number | null,
  period: "/ay",
  featureIds: [] as string[],
  highlight: false,
  badge: null as string | null,
  cta: "Hemen Başla",
  sortOrder: 0,
  active: true,
};

export default function SuperAdminPlansPage() {
  const showAlert = useAlert();
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [allFeatures, setAllFeatures] = React.useState<PlatformFeature[]>([]);
  const [editing, setEditing] = React.useState<(typeof emptyPlan & { id?: string }) | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [loadErr, setLoadErr] = React.useState("");
  const [featureModalOpen, setFeatureModalOpen] = React.useState(false);
  const [featureSearch, setFeatureSearch] = React.useState("");

  const loadData = React.useCallback(async () => {
    setLoadErr("");
    try {
      const [plansRes, featuresRes] = await Promise.all([
        fetch("/api/super-admin/plans", { credentials: "include" }),
        fetch("/api/super-admin/features", { credentials: "include" }),
      ]);
      if (plansRes.ok) {
        const d = await plansRes.json();
        if (Array.isArray(d)) setPlans(d);
      }
      if (featuresRes.ok) {
        const d = await featuresRes.json();
        if (Array.isArray(d)) setAllFeatures(d);
      }
    } catch {
      setLoadErr("Veriler yüklenemedi.");
    }
  }, []);

  React.useEffect(() => { void loadData(); }, [loadData]);

  const openFeatureModal = () => {
    setFeatureSearch("");
    setFeatureModalOpen(true);
  };

  const toggleFeature = (featureId: string) => {
    if (!editing) return;
    const has = editing.featureIds.includes(featureId);
    setEditing({
      ...editing,
      featureIds: has ? editing.featureIds.filter((f) => f !== featureId) : [...editing.featureIds, featureId],
    });
  };

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
      const res = await fetch(`/api/super-admin/plans/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) await loadData();
    } catch { /* */ }
  };

  const filteredFeatures = allFeatures.filter((f) =>
    f.name.toLowerCase().includes(featureSearch.toLowerCase()) ||
    f.category.toLowerCase().includes(featureSearch.toLowerCase())
  );

  const groupedFeatures = filteredFeatures.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {} as Record<string, PlatformFeature[]>);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SuperAdminTopBar
        title="Fiyatlandırma Yönetimi"
        subtitle="Paketleri oluşturun, düzenleyin, silin"
        actions={
          <Link href="/super-admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {loadErr && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-950 dark:text-amber-100">{loadErr}</div>
        )}

        {/* Üst bar */}
        {!editing && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Paketler</h2>
              <p className="text-xs text-zinc-500 mt-1">{plans.length} paket mevcut</p>
            </div>
            <button
              type="button"
              onClick={() => { setEditing({ ...emptyPlan }); setIsCreating(true); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" /> Yeni Paket
            </button>
          </div>
        )}

        {/* Düzenleme formu */}
        {editing && (
          <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{isCreating ? "Yeni Paket" : "Düzenle"}</h3>
              <button type="button" onClick={() => { setEditing(null); setIsCreating(false); }} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Paket Adı *</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm" placeholder="Başlangıç" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Açıklama</label>
                <input type="text" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value || null })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm" placeholder="Küçük siteler için" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Fiyat (TL) *</label>
                <input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm" min={0} />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Orijinal Fiyat</label>
                <input type="number" value={editing.originalPrice ?? ""} onChange={(e) => setEditing({ ...editing, originalPrice: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm" min={0} placeholder="İndirim" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Dönem</label>
                <input type="text" value={editing.period} onChange={(e) => setEditing({ ...editing, period: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm" placeholder="/ay" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">CTA Butonu</label>
                <input type="text" value={editing.cta} onChange={(e) => setEditing({ ...editing, cta: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm" placeholder="Hemen Başla" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Badge</label>
                <input type="text" value={editing.badge ?? ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value || null })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm" placeholder="En Popüler" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Sıra</label>
                <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm" min={0} />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editing.highlight} onChange={(e) => setEditing({ ...editing, highlight: e.target.checked })}
                  className="rounded border-zinc-300 dark:border-zinc-600" />
                <Flame className="h-4 w-4 text-amber-500" /> Öne çıkarılmış
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="rounded border-zinc-300 dark:border-zinc-600" />
                Aktif
              </label>
            </div>

            {/* Özellik seçimi butonu */}
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-2 block">Paket Özellikleri</label>
              <button
                type="button"
                onClick={openFeatureModal}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors text-sm"
              >
                <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Puzzle className="h-4 w-4" />
                  {editing.featureIds.length > 0
                    ? `${editing.featureIds.length} özellik seçildi`
                    : "Özellik seçmek için tıklayın"}
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Değiştir</span>
              </button>

              {/* Seçili özelliklerin kısa listesi */}
              {editing.featureIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {editing.featureIds.map((fid) => {
                    const feat = allFeatures.find((f) => f.id === fid);
                    return (
                      <span key={fid} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium">
                        {feat?.name || fid}
                        <button type="button" onClick={() => toggleFeature(fid)} className="hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button type="button" onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 disabled:opacity-50">
                <Save className="h-4 w-4" /> {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button type="button" onClick={() => { setEditing(null); setIsCreating(false); }}
                className="px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700">
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Paket kartları */}
        {!editing && (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className={`flex flex-col rounded-2xl border-2 transition-all ${
                plan.highlight ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              } ${!plan.active ? "opacity-50" : ""}`}>
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{plan.name}</h3>
                        {plan.badge && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">{plan.badge}</span>}
                      </div>
                      {plan.description && <p className="text-xs text-zinc-500 mt-1">{plan.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => { setEditing(plan); setIsCreating(false); }}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"><Pencil className="h-4 w-4 text-zinc-500" /></button>
                      <button type="button" onClick={() => handleDelete(plan.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4 text-red-500" /></button>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{plan.price}</span>
                    <span className="text-sm text-zinc-500">TL{plan.period}</span>
                    {plan.originalPrice && <span className="text-sm text-zinc-400 line-through">{plan.originalPrice} TL</span>}
                  </div>
                </div>
                <div className="flex-1 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">{plan.featureIds.length} özellik</p>
                  <div className="space-y-1">
                    {plan.featureIds.slice(0, 6).map((fid) => {
                      const feat = allFeatures.find((f) => f.id === fid);
                      return (
                        <div key={fid} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" /> {feat?.name || fid}
                        </div>
                      );
                    })}
                    {plan.featureIds.length > 6 && <p className="text-[10px] text-zinc-400">+{plan.featureIds.length - 6} daha</p>}
                  </div>
                </div>
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                  <span className={`text-xs font-bold ${plan.active ? "text-emerald-600" : "text-zinc-400"}`}>{plan.active ? "Aktif" : "Pasif"}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ÖZELLİK SEÇİM MODAL'I */}
        {featureModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFeatureModalOpen(false)} />
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Puzzle className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Özellik Seç</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{editing?.featureIds.length ?? 0} seçili</span>
                  <button type="button" onClick={() => setFeatureModalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="h-5 w-5" /></button>
                </div>
              </div>

              {/* Arama */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={featureSearch}
                    onChange={(e) => setFeatureSearch(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 py-2.5 pl-10 pr-3 text-sm"
                    placeholder="Özellik ara..."
                    autoFocus
                  />
                </div>
              </div>

              {/* Özellik listesi */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(groupedFeatures).map(([category, features]) => (
                  <div key={category}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">{category}</h4>
                    <div className="space-y-1">
                      {features.map((feature) => {
                        const isSelected = editing?.featureIds.includes(feature.id) ?? false;
                        return (
                          <button
                            key={feature.id}
                            type="button"
                            onClick={() => toggleFeature(feature.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                              isSelected
                                ? "bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-300 dark:border-indigo-700"
                                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-indigo-600 text-white" : "border-2 border-zinc-300 dark:border-zinc-600"
                            }`}>
                              {isSelected && <CheckCircle className="h-3.5 w-3.5" />}
                            </div>
                            <div className="text-left min-w-0">
                              <p className={`font-medium ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-700 dark:text-zinc-300"}`}>
                                {feature.name}
                              </p>
                              {feature.description && (
                                <p className="text-[11px] text-zinc-500 truncate">{feature.description}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {filteredFeatures.length === 0 && (
                  <p className="text-center text-zinc-500 text-sm py-8">Özellik bulunamadı</p>
                )}
              </div>

              {/* Modal footer */}
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFeatureModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500"
                >
                  Tamam ({editing?.featureIds.length ?? 0} özellik seçildi)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
