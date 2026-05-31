"use client";

import * as React from "react";
import { CheckCircle, X } from "lucide-react";
import {
  PLAN_DETAILS,
  FEATURE_LABELS,
  FEATURE_CATEGORIES,
  PLAN_FEATURES,
  type PlanType,
} from "@/lib/features";

export default function OzelliklerPage() {
  return (
    <div className="min-h-full bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-[#060a12] dark:via-[#0b0f19] dark:to-indigo-950/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Özellik Karşılaştırması
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Hangi pakette hangi özellikler mevcut
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-4 px-4 text-xs font-bold uppercase text-zinc-500 w-[40%]">Özellik</th>
                  {(Object.keys(PLAN_DETAILS) as PlanType[]).map((pk) => (
                    <th key={pk} className="py-4 px-4 text-center text-xs font-bold uppercase text-zinc-500">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">{PLAN_DETAILS[pk].name}</span>
                        <span className="text-[10px] text-zinc-400">{PLAN_DETAILS[pk].monthlyPrice} TL/ay</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_CATEGORIES.map((cat) => (
                  <React.Fragment key={cat.name}>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/30">
                      <td colSpan={4} className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {cat.name}
                      </td>
                    </tr>
                    {cat.features.map((f) => (
                      <tr key={f} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">{FEATURE_LABELS[f]}</td>
                        {(Object.keys(PLAN_DETAILS) as PlanType[]).map((pk) => (
                          <td key={pk} className="py-3 px-4 text-center">
                            {PLAN_FEATURES[pk].includes(f) ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-zinc-300 dark:text-zinc-600 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}

                {/* Limit satırları */}
                <tr className="bg-zinc-50 dark:bg-zinc-800/30">
                  <td colSpan={4} className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Limitler
                  </td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-3 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Maksimum Site</td>
                  {(Object.keys(PLAN_DETAILS) as PlanType[]).map((pk) => (
                    <td key={pk} className="py-3 px-4 text-center text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {PLAN_DETAILS[pk].maxSites === Infinity ? "∞" : PLAN_DETAILS[pk].maxSites}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-3 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Maksimum Kullanıcı</td>
                  {(Object.keys(PLAN_DETAILS) as PlanType[]).map((pk) => (
                    <td key={pk} className="py-3 px-4 text-center text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {PLAN_DETAILS[pk].maxUsers === Infinity ? "∞" : PLAN_DETAILS[pk].maxUsers}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Aylık Fiyat</td>
                  {(Object.keys(PLAN_DETAILS) as PlanType[]).map((pk) => (
                    <td key={pk} className="py-3 px-4 text-center">
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{PLAN_DETAILS[pk].monthlyPrice}</span>
                      <span className="text-xs text-zinc-500 ml-0.5">TL</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
