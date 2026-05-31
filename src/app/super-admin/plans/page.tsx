"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Crown,
  Star,
  Building2,
  X,
  ChevronDown,
  Search,
  Save,
} from "lucide-react";
import { useAlert, useConfirm } from "@/components/ModalProvider";
import {
  PLAN_DETAILS,
  FEATURE_LABELS,
  FEATURE_CATEGORIES,
  PLAN_FEATURES,
  type PlanType,
  type FeatureKey,
} from "@/lib/features";

const PLAN_ICONS: Record<PlanType, typeof Crown> = {
  starter: Star,
  professional: Crown,
  enterprise: Building2,
};

const PLAN_COLORS: Record<PlanType, string> = {
  starter: "from-emerald-500 to-teal-500",
  professional: "from-indigo-500 to-violet-500",
  enterprise: "from-amber-500 to-orange-500",
};

type PlanData = {
  id: PlanType;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxSites: number;
  maxUsers: number;
  features: (FeatureKey | string)[];
};

const INITIAL_PLANS: PlanData[] = [
  {
    id: "starter",
    name: PLAN_DETAILS.starter.name,
    monthlyPrice: PLAN_DETAILS.starter.monthlyPrice,
    yearlyPrice: PLAN_DETAILS.starter.yearlyPrice,
    maxSites: PLAN_DETAILS.starter.maxSites,
    maxUsers: PLAN_DETAILS.starter.maxUsers,
    features: [...PLAN_FEATURES.starter],
  },
  {
    id: "professional",
    name: PLAN_DETAILS.professional.name,
    monthlyPrice: PLAN_DETAILS.professional.monthlyPrice,
    yearlyPrice: PLAN_DETAILS.professional.yearlyPrice,
    maxSites: PLAN_DETAILS.professional.maxSites,
    maxUsers: PLAN_DETAILS.professional.maxUsers,
    features: [...PLAN_FEATURES.professional],
  },
  {
    id: "enterprise",
    name: PLAN_DETAILS.enterprise.name,
    monthlyPrice: PLAN_DETAILS.enterprise.monthlyPrice,
    yearlyPrice: PLAN_DETAILS.enterprise.yearlyPrice,
    maxSites: PLAN_DETAILS.enterprise.maxSites,
    maxUsers: PLAN_DETAILS.enterprise.maxUsers,
    features: [...PLAN_FEATURES.enterprise],
  },
];

function FeatureSelector({
  selected,
  onToggle,
  onAddCustom,
  onRemove,
}: {
  selected: (FeatureKey | string)[];
  onToggle: (f: FeatureKey) => void;
  onAddCustom: (text: string) => void;
  onRemove: (f: FeatureKey | string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [customInput, setCustomInput] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return Object.entries(FEATURE_LABELS);
    const q = search.toLowerCase();
    return Object.entries(FEATURE_LABELS).filter(([, label]) =>
      label.toLowerCase().includes(q)
    );
  }, [search]);

  const handleAddCustom = () => {
    if (!customInput.trim()) return;
    onAddCustom(customInput.trim());
    setCustomInput("");
  };

  const featureLabel = (f: FeatureKey | string): string => {
    return f in FEATURE_LABELS ? FEATURE_LABELS[f as FeatureKey] : f;
  };

  return (
    <div className="space-y-3">
      {/* Selected features as tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium"
            >
              {featureLabel(f)}
              <button type="button" onClick={() => onRemove(f)} className="hover:text-red-500 ml-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors text-sm"
      >
        <span className="text-zinc-600 dark:text-zinc-400">
          Listeden seçim yap veya özel özellik ekle
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden space-y-3 p-3">
          {/* Arama */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Özellik ara..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm"
              autoFocus
            />
          </div>

          {/* Listeden seçim */}
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filtered.map(([key, label]) => {
              const featureKey = key as FeatureKey;
              const active = selected.includes(featureKey);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onToggle(featureKey)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                    active
                      ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <div className={`h-5 w-5 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                    active ? "bg-indigo-500 border-indigo-500" : "border-zinc-300 dark:border-zinc-600"
                  }`}>
                    {active && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <span className="flex-1 text-left font-medium">{label}</span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-zinc-400 text-center py-2">Sonuç bulunamadı</p>
            )}
          </div>

          {/* Serbest yazma alanı */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
              Özel Özellik Ekle
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustom(); } }}
                placeholder="Örn: 7/24 teknik destek"
                className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleAddCustom}
                disabled={!customInput.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-40"
              >
                Ekle
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminPlansPage() {
  const showAlert = useAlert();
  const showConfirm = useConfirm();
  const [plans, setPlans] = React.useState<PlanData[]>(INITIAL_PLANS);
  const [editing, setEditing] = React.useState<PlanData | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  const emptyPlan: PlanData = {
    id: "" as PlanType,
    name: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxSites: 1,
    maxUsers: 50,
    features: [],
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name || editing.monthlyPrice <= 0) {
      await showAlert({ message: "Paket adı ve fiyat zorunludur.", variant: "error" });
      return;
    }

    // kaydet (simüle)
    if (isCreating) {
      const newPlan: PlanData = {
        ...editing,
        id: editing.name.toLowerCase().replace(/\s+/g, "-") as PlanType,
      };
      setPlans([...plans, newPlan]);
    } else {
      setPlans(plans.map((p) => (p.id === editing.id ? editing : p)));
    }

    setEditing(null);
    setIsCreating(false);
    await showAlert({
      message: isCreating ? `"${editing.name}" paketi oluşturuldu.` : `"${editing.name}" paketi güncellendi.`,
      variant: "success",
    });
  };

  const handleDelete = async (plan: PlanData) => {
    if (!(await showConfirm({
      message: `"${plan.name}" paketi silinsin mi?`,
      variant: "warning",
      confirmLabel: "Sil",
    }))) return;

    setPlans(plans.filter((p) => p.id !== plan.id));
    await showAlert({ message: `"${plan.name}" silindi.`, variant: "success" });
  };

  const toggleFeature = (f: FeatureKey) => {
    if (!editing) return;
    const has = editing.features.includes(f);
    setEditing({
      ...editing,
      features: has ? editing.features.filter((x) => x !== f) : [...editing.features, f],
    });
  };

  const addCustomFeature = (text: string) => {
    if (!editing || !text.trim()) return;
    if (editing.features.includes(text.trim())) return;
    setEditing({ ...editing, features: [...editing.features, text.trim()] });
  };

  const removeFeature = (f: FeatureKey | string) => {
    if (!editing) return;
    setEditing({ ...editing, features: editing.features.filter((x) => x !== f) });
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-[#060a12] dark:via-[#0b0f19] dark:to-indigo-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              Paket Yönetimi
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              Paket ekleyin, düzenleyin, silin. Özellikleri listeden seçin.
            </p>
          </div>
          {!editing && (
            <button
              type="button"
              onClick={() => { setEditing({ ...emptyPlan }); setIsCreating(true); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
            >
              <Plus className="h-4 w-4" /> Yeni Paket
            </button>
          )}
        </div>

        {/* Editing Form */}
        {editing && (
          <div className="rounded-3xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                {isCreating ? "Yeni Paket Oluştur" : "Paketi Düzenle"}
              </h3>
              <button
                type="button"
                onClick={() => { setEditing(null); setIsCreating(false); }}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5 text-zinc-400" />
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
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Aylık Fiyat (TL) *</label>
                <input
                  type="number"
                  value={editing.monthlyPrice}
                  onChange={(e) => setEditing({ ...editing, monthlyPrice: Number(e.target.value) })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Yıllık Fiyat (TL/ay)</label>
                <input
                  type="number"
                  value={editing.yearlyPrice}
                  onChange={(e) => setEditing({ ...editing, yearlyPrice: Number(e.target.value) })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  min={0}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-500 mb-1 block">Max Site</label>
                  <input
                    type="number"
                    value={editing.maxSites}
                    onChange={(e) => setEditing({ ...editing, maxSites: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 mb-1 block">Max Kullanıcı</label>
                  <input
                    type="number"
                    value={editing.maxUsers}
                    onChange={(e) => setEditing({ ...editing, maxUsers: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                    min={1}
                  />
                </div>
              </div>
            </div>

            {/* Feature Selector */}
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-2 block">Paket Özellikleri</label>
              <FeatureSelector
                selected={editing.features}
                onToggle={toggleFeature}
                onAddCustom={addCustomFeature}
                onRemove={removeFeature}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 shadow-md"
              >
                <Save className="h-4 w-4" /> Kaydet
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

        {/* Plan Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const colors: Record<string, string> = {
              starter: "from-emerald-500 to-teal-500",
              professional: "from-indigo-500 to-violet-500",
              enterprise: "from-amber-500 to-orange-500",
            };
            const color = colors[plan.id] || "from-zinc-500 to-zinc-600";
            const Icon = plan.id === "starter" ? Star : plan.id === "professional" ? Crown : Building2;

            return (
              <div
                key={plan.id}
                className="relative flex flex-col rounded-3xl border-2 border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:shadow-lg transition-all"
              >
                <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{plan.name}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {plan.monthlyPrice} TL/ay &middot; {plan.maxSites === Infinity ? "∞" : plan.maxSites} site &middot; {plan.maxUsers === Infinity ? "∞" : plan.maxUsers} kullanıcı
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                      {plan.features.length} özellik
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditing(plan); setIsCreating(false); }}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(plan)}
                        className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6">
                  <div className="space-y-1.5">
                    {plan.features.slice(0, 8).map((f) => (
                      <div key={f} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-700 dark:text-zinc-300">
                        <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                        {f in FEATURE_LABELS ? FEATURE_LABELS[f as FeatureKey] : f}
                      </div>
                    ))}
                    {plan.features.length > 8 && (
                      <p className="text-xs text-zinc-400 text-center pt-2">
                        +{plan.features.length - 8} özellik daha
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
