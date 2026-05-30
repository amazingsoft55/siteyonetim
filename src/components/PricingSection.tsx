"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard, CheckCircle, Flame, TrendingUp, Percent,
  Timer, ShieldCheck, Heart, Zap,
} from "lucide-react";

type Plan = {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  period: string;
  description: string | null;
  highlight: boolean;
  badge: string | null;
  features: string[];
  cta: string;
  sortOrder: number;
};

export function PricingSection() {
  const [annual, setAnnual] = React.useState(false);
  const [plans, setPlans] = React.useState<Plan[]>([]);

  React.useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPlans(data);
      })
      .catch(() => {});
  }, []);

  if (plans.length === 0) return null;

  return (
    <section id="fiyatlandirma" className="py-28 px-6 bg-white dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 mb-6">
            <Percent className="h-4 w-4" />
            %50&apos;e Varan İndirim!
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
            <CreditCard className="h-3.5 w-3.5" /> Fiyatlandırma
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Piyasadaki en uygun fiyatlar
          </h2>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto">
            Rakiplerinizden çok daha ucuz. Aynı kalite, çok daha az maliyet.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                !annual
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-md"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Aylık
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                annual
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-md"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Yıllık
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500 text-white rounded-full">
                %40 TASARRUF
              </span>
            </button>
          </div>
        </div>

        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300">Diğer platformlar: 2.000 - 5.000 TL/ay</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Bizim fiyatlarımız:{" "}
                  <span className="font-extrabold text-lg">
                    {annual ? Math.round(plans[0]?.price * 0.6) : plans[0]?.price} TL&apos;den başlıyor!
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-sm">
              <Flame className="h-4 w-4" />
              %85 Tasarruf Edin!
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan) => {
            const price = annual ? Math.round(plan.price * 0.6) : plan.price;
            const original = plan.originalPrice
              ? annual ? Math.round(plan.originalPrice * 0.6) : plan.originalPrice
              : null;
            const savings = original ? Math.round((1 - price / original) * 100) : 0;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-8 rounded-3xl border-2 transition-all duration-300 ${
                  plan.highlight
                    ? "bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/30 dark:to-zinc-900 border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-[1.02]"
                    : "bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-zinc-700 hover:shadow-lg"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full shadow-lg">
                    {plan.badge}
                  </span>
                )}

                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{plan.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{plan.description}</p>

                <div className="mt-6 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-zinc-900 dark:text-zinc-50">{price}</span>
                    <span className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">TL{plan.period}</span>
                  </div>
                  {original && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm text-zinc-400 line-through">{original} TL{plan.period}</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                        %{savings} İNDİRİM
                      </span>
                    </div>
                  )}
                  {annual && (
                    <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      Yıllık toplam: {price * 12} TL (aylık {price} TL)
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/destek"
                  className={`block w-full text-center py-3.5 rounded-2xl font-bold text-sm transition-all ${
                    plan.highlight
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/20"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-indigo-500" />
            14 gün para iade garantisi
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Kredi kartı gerekmez
          </span>
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            Taahhüt yok, istediğin zaman iptal et
          </span>
        </div>
      </div>
    </section>
  );
}
