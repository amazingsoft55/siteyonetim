"use client";

import * as React from "react";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { FeatureKey } from "@/lib/features";
import { PLAN_DETAILS } from "@/lib/features";

type PlanInfo = {
  plan: string;
  features: { key: string; label: string; enabled: boolean }[];
};

type FeatureGateProps = {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

const FeatureGateContext = React.createContext<PlanInfo | null>(null);

export function FeatureGateProvider({ children }: { children: React.ReactNode }) {
  const [planInfo, setPlanInfo] = React.useState<PlanInfo | null>(null);

  React.useEffect(() => {
    fetch("/api/site/plan", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.plan) {
          setPlanInfo(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <FeatureGateContext.Provider value={planInfo}>
      {children}
    </FeatureGateContext.Provider>
  );
}

export function useSitePlan() {
  return React.useContext(FeatureGateContext);
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const planInfo = React.useContext(FeatureGateContext);

  if (!planInfo) {
    return <>{children}</>;
  }

  const hasAccess = planInfo.features.some((f) => f.key === feature && f.enabled);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      <div className="blur-[2px] pointer-events-none opacity-50">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl">
        <div className="text-center p-6">
          <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <Lock className="h-6 w-6 text-zinc-400" />
          </div>
          <p className="font-bold text-zinc-900 dark:text-zinc-50 mb-1">
            Bu özellik {PLAN_DETAILS[planInfo.plan as keyof typeof PLAN_DETAILS]?.name ?? planInfo.plan} paketinde mevcut
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
            Paketinizi yükselterek bu özelliğe erişebilirsiniz.
          </p>
          <Link
            href="/destek"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Paket yükselt <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
