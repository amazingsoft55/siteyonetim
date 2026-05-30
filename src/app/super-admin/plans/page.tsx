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
  Puzzle,
  Pencil,
  X,
  Save,
} from "lucide-react";
import { useAlert } from "@/components/ModalProvider";
import { SuperAdminTopBar } from "@/components/SuperAdminTopBar";
import {
  PLAN_DETAILS,
  PLAN_FEATURES,
  FEATURE_LABELS,
  FEATURE_CATEGORIES,
  type PlanType,
  type FeatureKey,
} from "@/lib/features";
import { describeFailedResponse } from "@/lib/json-error";

const PLAN_ICONS: Record<PlanType, typeof Crown> = {
  starter: Star,
  professional: Crown,
  enterprise: Building2,
};

const PLAN_COLORS: Record<PlanType, string> = {
  starter: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
  professional: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30",
  enterprise: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
};

const FEATURE_ICONS: Record<string, typeof Users> = {
  site_management: Building2,
  user_management: Users,
  announcements: Megaphone,
  requests: Wrench,
  payments: CreditCard,
  payment_reports: BarChart3,
  email_notifications: Mail,
  push_notifications: Bell,
  basic_reports: BarChart3,
  advanced_reports: BarChart3,
  page_speed_insights: Globe,
  pwa_app: Smartphone,
  multi_site: Globe,
  support_tickets: Headphones,
  api_access: Lock,
  custom_integrations: Zap,
  dedicated_support: Headphones,
};

type PlatformFeature = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  active: boolean;
};

export default function SuperAdminPlansPage() {
  const showAlert = useAlert();
  const [platformFeatures, setPlatformFeatures] = React.useState<PlatformFeature[]>([]);
  const [editing, setEditing] = React.useState<PlanType | null>(null);
  const [selectedFeatures, setSelectedFeatures] = React.useState<Record<PlanType, string[]>>({
    starter: [],
    professional: [],
    enterprise: [],
  });
  const [saving, setSaving] = React.useState(false);

  const loadFeatures = React.useCallback(async () => {
    try {
      const res = await fetch("/api/super-admin/features", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPlatformFeatures(data);
      }
    } catch {
      /* silent */
    }
  }, []);

  React.useEffect(() => {
    void loadFeatures();
  }, [loadFeatures]);

  const toggleFeature = (plan: PlanType, featureId: string) => {
    setSelectedFeatures((prev) => {
      const current = prev[plan] || [];
      const has = current.includes(featureId);
      return {
        ...prev,
        [plan]: has ? current.filter((f) => f !== featureId) : [...current, featureId],
      };
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/super-admin/plans/${editing}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureIds: selectedFeatures[editing] }),
      });

      if (res.ok) {
        await showAlert({ message: "Paket güncellendi.", variant: "success" });
        setEditing(null);
      } else {
        const text = await res.text();
        await showAlert({ message: describeFailedResponse(res.status, text, "Güncellenemedi."), variant: "error" });
      }
    } catch {
      await showAlert({ message: "Kaydetme hatası.", variant: "error" });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SuperAdminTopBar
        title="Paket Yönetimi"
        subtitle="Her paket için hangi özellikler aktif olacağını düzenleyin"
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
        {/* Plan Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {(Object.keys(PLAN_DETAILS) as PlanType[]).map((planKey) => {
            const plan = PLAN_DETAILS[planKey];
            const features = PLAN_FEATURES[planKey];
            const PlanIcon = PLAN_ICONS[planKey];
            const color = PLAN_COLORS[planKey];
            const isEditing = editing === planKey;

            return (
              <div
                key={planKey}
                className={`flex flex-col rounded-2xl border-2 transition-all ${
                  isEditing
                    ? "border-indigo-500 shadow-lg"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                } bg-white dark:bg-zinc-900`}
              >
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-xl ${color}`}>
                      <PlanIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{plan.name}</h3>
                      <p className="text-xs text-zinc-500">
                        {plan.monthlyPrice} TL/ay · {plan.maxSites === Infinity ? "Sınırsız" : plan.maxSites} site
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {features.length} statik özellik
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(isEditing ? null : planKey);
                        setSelectedFeatures((prev) => ({
                          ...prev,
                          [planKey]: [...features],
                        }));
                      }}
                      className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Pencil className="h-3 w-3" />
                      {isEditing ? "Kapat" : "Düzenle"}
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-5">
                  <div className="space-y-1">
                    {features.slice(0, 8).map((f) => {
                      const FIcon = FEATURE_ICONS[f] || CheckCircle;
                      return (
                        <div key={f} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400">
                          <FIcon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          {FEATURE_LABELS[f]}
                        </div>
                      );
                    })}
                    {features.length > 8 && (
                      <p className="text-[10px] text-zinc-400 text-center pt-1">+{features.length - 8} daha</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Selection Panel */}
        {editing && (
          <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                  {PLAN_DETAILS[editing].name} — Özellik Seçimi
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Bu pakete hangi özellikler dahil olacak seçin</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {FEATURE_CATEGORIES.map((cat) => (
              <div key={cat.name} className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">{cat.name}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {cat.features.map((f) => {
                    const isSelected = selectedFeatures[editing]?.includes(f) ?? false;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFeature(editing, f)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                            : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {isSelected ? (
                          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-zinc-300 dark:border-zinc-600 shrink-0" />
                        )}
                        {FEATURE_LABELS[f]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feature Comparison */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Özellik Karşılaştırması</h2>
            <p className="text-xs text-zinc-500 mt-1">Hangi pakette hangi özellikler mevcut</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-3 px-4 text-xs font-bold uppercase text-zinc-500">Özellik</th>
                  {(Object.keys(PLAN_DETAILS) as PlanType[]).map((pk) => (
                    <th key={pk} className="py-3 px-4 text-center text-xs font-bold uppercase text-zinc-500">
                      {PLAN_DETAILS[pk].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_CATEGORIES.map((cat) => (
                  <React.Fragment key={cat.name}>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/30">
                      <td colSpan={4} className="py-2 px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {cat.name}
                      </td>
                    </tr>
                    {cat.features.map((f) => (
                      <tr key={f} className="border-b border-zinc-100 dark:border-zinc-800/50">
                        <td className="py-2 px-4 text-xs text-zinc-600 dark:text-zinc-400">{FEATURE_LABELS[f]}</td>
                        {(Object.keys(PLAN_DETAILS) as PlanType[]).map((pk) => (
                          <td key={pk} className="py-2 px-4 text-center">
                            {PLAN_FEATURES[pk].includes(f) ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="block h-4 w-4 rounded-full bg-zinc-200 dark:bg-zinc-700 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
