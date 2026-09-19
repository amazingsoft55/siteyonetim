"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Wrench,
  Shield,
  Plus,
  ArrowRight,
  Clock,
  MessagesSquare,
  Vote,
  Sparkles,
  ChevronRight,
  Send,
  Building2,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  category?: string;
  isNew?: boolean;
}

interface PaymentRow {
  id: string;
  period: string;
  amount: number;
  date: string;
  status: string;
  type: string;
}

interface RequestItem {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  status: "Bekliyor" | "İşlemde" | "Çözüldü";
}

interface CommunityChannel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
}

const STATUS_STYLES: Record<string, string> = {
  Bekliyor: "bg-amber-100 text-amber-800 border-amber-200",
  İşlemde: "bg-blue-100 text-blue-800 border-blue-200",
  Çözüldü: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [balance, setBalance] = React.useState(0);
  const [residentName, setResidentName] = React.useState("");
  const [apartmentNo, setApartmentNo] = React.useState("");
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [activeRequests, setActiveRequests] = React.useState<RequestItem[]>([]);
  const [channels, setChannels] = React.useState<CommunityChannel[]>([]);
  const [paidCount, setPaidCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.name) setResidentName(u.name);
        if (u?.apartmentNo) setApartmentNo(u.apartmentNo);
      }
    } catch {}

    let cancelled = false;
    (async () => {
      const opts = { credentials: "include" as const };
      try {
        const [annRes, reqRes, payRes, chanRes] = await Promise.all([
          fetch("/api/announcements", opts),
          fetch("/api/requests", opts),
          fetch("/api/payments", opts),
          fetch("/api/community/channels", opts),
        ]);

        if (!cancelled && annRes.ok) {
          const j = await annRes.json();
          setAnnouncements(Array.isArray(j) ? j.slice(0, 2) : []);
        }

        if (!cancelled && reqRes.ok) {
          const j = await reqRes.json();
          const allReq = Array.isArray(j) ? (j as RequestItem[]) : [];
          setActiveRequests(allReq.filter((r) => r.status !== "Çözüldü"));
        }

        if (!cancelled && payRes.ok) {
          const plist = await payRes.json();
          if (Array.isArray(plist)) {
            const unpaid = plist
              .filter((p) => p.status === "Bekliyor")
              .reduce((a, p) => a + Number(p.amount), 0);
            const paid = plist.filter((p) => p.status !== "Bekliyor").length;
            setBalance(Number.isFinite(unpaid) ? Math.round(unpaid * 100) / 100 : 0);
            setPaidCount(paid);
            setTotalCount(plist.length);
          }
        }

        if (!cancelled && chanRes.ok) {
          const c = await chanRes.json();
          if (Array.isArray(c)) setChannels(c.slice(0, 4));
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";

  if (loading) {
    return (
      <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-16">
        <div className="h-8 w-64 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
          <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto pb-16">
      {/* ══════ HERO WELCOME ══════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {greeting}{residentName ? `, ${residentName}` : ""} 👋
          </h2>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">
            {apartmentNo ? `Daire ${apartmentNo} • ` : ""}Apartman dijital yaşam portalınıza hoş geldiniz.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Canlı Komşuluk Ağı
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5 text-indigo-600" /> KVKK Korumalı
          </div>
        </div>
      </div>

      {/* ══════ KILLER FEATURE: KOMŞULUK AĞI & SOHBET VİTRİNİ ══════ */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 opacity-10" aria-hidden>
          <MessagesSquare className="h-64 w-64" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            Numaranız Gizli • Güvenli Komşuluk Sohbeti
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Komşularınızla İletişime Geçin, Yardımlaşın ve Bina Kararlarına Katılın
          </h3>

          <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
            WhatsApp karmaşasına ve telefon numarası ifşasına gerek kalmadan; duyuruları takip edin,
            merdiven/matkap ödünç isteyin, ikinci el eşya paylaşın ve bina anketlerinde oy kullanın.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/topluluk"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <MessagesSquare className="h-4 w-4" /> Komşu Sohbetine Katıl
            </Link>

            <Link
              href="/dashboard/topluluk"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all"
            >
              <Vote className="h-4 w-4 text-amber-300" /> Aktif Oylamaları Gör
            </Link>
          </div>
        </div>

        {/* Hızlı Kanal Butonları */}
        {channels.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
            {channels.map((ch) => (
              <Link
                key={ch.id}
                href="/dashboard/topluluk"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:text-white"
              >
                <span className="truncate">{ch.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ══════ İKİNCİ SIRADA: AİDAT VE TALEPLER ══════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aidat Kartı */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Aidat & Ortak Gider
              </span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <CreditCard className="h-4 w-4" />
              </span>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-black text-slate-900 tabular-nums">
                ₺{balance.toLocaleString("tr-TR")}
              </span>
              <p className="text-xs text-slate-500 mt-2">
                {balance > 0
                  ? "Ödenmemiş aidat bakiyeniz bulunmaktadır."
                  : "Ödenmemiş aidat borcunuz bulunmuyor."}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/dashboard/payment"
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Building2 className="h-4 w-4" /> Banka IBAN Bilgisi & Havale Rehberi
            </Link>

            <Link
              href="/dashboard/payments"
              className="flex items-center justify-center gap-1.5 w-full py-2.5 text-slate-600 hover:text-indigo-600 font-semibold text-xs"
            >
              Geçmiş Ödemeleri Görüntüle <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Aktif Talepler Kartı */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Wrench className="h-4.5 w-4.5 text-amber-500" /> Arıza & Taleplerim
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {activeRequests.length} açık
              </span>
            </div>

            {activeRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                Devam eden arıza veya talebiniz bulunmuyor.
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeRequests.slice(0, 2).map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border text-xs ${
                      STATUS_STYLES[req.status] ?? STATUS_STYLES["Bekliyor"]
                    }`}
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold truncate">{req.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-white/80 rounded font-semibold">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-80 line-clamp-1 mt-0.5">{req.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/dashboard/requests"
            className="mt-4 w-full py-3.5 px-4 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Yeni Arıza Bildirimi Yap
          </Link>
        </div>
      </div>

      {/* ══════ RESMİ DUYURULAR ══════ */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-600" /> Yönetimden Duyurular
          </h3>
          <Link
            href="/dashboard/announcements"
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            Tümünü Gör <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl">
              <Megaphone className="h-6 w-6 mx-auto mb-2 text-slate-300" />
              Yayınlanmış resmi duyuru bulunmuyor.
            </div>
          ) : (
            announcements.map((ann) => (
              <Link
                href="/dashboard/announcements"
                key={ann.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs transition-all flex justify-between items-start gap-4 block"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {ann.title}
                    </h4>
                    {ann.isNew && (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold bg-rose-100 text-rose-700 rounded-full">
                        YENİ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{ann.content}</p>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3" /> {ann.date}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
