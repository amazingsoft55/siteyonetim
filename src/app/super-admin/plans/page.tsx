"use client";

import * as React from "react";
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
  TrendingUp,
  Gauge,
  Zap,
} from "lucide-react";
import {
  PLAN_DETAILS,
  FEATURE_LABELS,
  FEATURE_CATEGORIES,
  PLAN_FEATURES,
  type PlanType,
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

const FEATURE_ICONS: Record<string, typeof Users> = {
  site_management: Building2,
  user_management: Users,
  announcements: Megaphone,
  requests: Wrench,
  payments: CreditCard,
  payment_reports: BarChart3,
  email_notifications: Mail,
  push_notifications: Bell,
  basic_reports: TrendingUp,
  advanced_reports: Gauge,
  page_speed_insights: Zap,
  pwa_app: Smartphone,
  multi_site: Globe,
  support_tickets: Headphones,
  api_access: Lock,
  custom_integrations: Zap,
  dedicated_support: Headphones,
};

export default function SuperAdminPlansPage() {
  const [expanded, setExpanded] = React.useState<PlanType | null>(null);

  return (
    <div className="min-h-full bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-[#060a12] dark:via-[#0b0f19] dark:to-indigo-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Paket &amp; Özellikler
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Her paketin hangi özellikleri içerdiğini görüntüleyin.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {(Object.keys(PLAN_DETAILS) as PlanType[]).map((planKey) => {
            const plan = PLAN_DETAILS[planKey];
            const features = PLAN_FEATURES[planKey];
            const PlanIcon = PLAN_ICONS[planKey];
            const color = PLAN_COLORS[planKey];
            const isExpanded = expanded === planKey;

            return (
              <div
                key={planKey}
                className={`relative flex flex-col rounded-3xl border-2 transition-all duration-300 ${
                  isExpanded
                    ? "border-indigo-500 shadow-2xl shadow-indigo-500/10"
                    : "border-zinc-200/60 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-zinc-700 hover:shadow-lg"
                } bg-white dark:bg-zinc-900/80`}
              >
                <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                      <PlanIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{plan.name}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {plan.monthlyPrice} TL/ay &middot; {plan.maxSites === Infinity ? "Sınırsız" : plan.maxSites} site &middot; {plan.maxUsers === Infinity ? "Sınırsız" : plan.maxUsers} kullanıcı
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                      {features.length} özellik
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : planKey)}
                      className="ml-auto text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {isExpanded ? "Küçült" : "Tümünü Gör"}
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-6">
                  <div className="space-y-1.5">
                    {(isExpanded ? features : features.slice(0, 6)).map((f) => {
                      const FIcon = FEATURE_ICONS[f] || CheckCircle;
                      return (
                        <div key={f} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-700 dark:text-zinc-300">
                          <FIcon className="h-4 w-4 text-indigo-500 shrink-0" />
                          {FEATURE_LABELS[f]}
                        </div>
                      );
                    })}
                    {!isExpanded && features.length > 6 && (
                      <p className="text-xs text-zinc-400 text-center pt-2">
                        +{features.length - 6} özellik daha
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-50">Özellik Karşılaştırması</h2>
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
                      <tr key={f} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                        <td className="py-2.5 px-4 text-sm text-zinc-700 dark:text-zinc-300">{FEATURE_LABELS[f]}</td>
                        {(Object.keys(PLAN_DETAILS) as PlanType[]).map((pk) => (
                          <td key={pk} className="py-2.5 px-4 text-center">
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

        <div className="rounded-2xl border border-indigo-200/50 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 text-sm text-indigo-950 dark:text-indigo-100">
          <p className="font-bold mb-1">Paket Değişikliği</p>
          <p className="text-xs text-indigo-800 dark:text-indigo-200">
            Bir sitenin paketini değiştirmek için /super-admin/kullanicilar sayfasındaki dropdown kullanın.
          </p>
        </div>

      </div>
    </div>
  );
}
