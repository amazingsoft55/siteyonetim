"use client";

import * as React from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Search,
  Calendar,
  Receipt,
  Download,
  Trash2,
  Filter,
  CheckCircle2,
  DollarSign,
  Building,
  RefreshCw,
} from "lucide-react";
import { useAlert, useConfirm } from "@/components/ModalProvider";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  title: string;
  description?: string | null;
  amount: number;
  date: string;
  paymentMethod: string;
  receiptNo?: string | null;
  createdAt: string;
};

type Summary = {
  totalPaidDues: number;
  totalManualIncome: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
};

const EXPENSE_CATEGORIES = [
  "Ortak Elektrik Faturası",
  "Ortak Su Faturası",
  "Asansör Bakım & Muayene",
  "Temizlik & Hijyen Giderleri",
  "Personel / Görevli Maaşı & SGK",
  "Güvenlik & Kamera Sistemi",
  "Tesisat & Onarım",
  "Bahçe & Peyzaj",
  "Yönetim & Muhasebe Masrafı",
  "Diğer Giderler",
];

const INCOME_CATEGORIES = [
  "Ek Aidat / Demirbaş Payı",
  "Ortak Alan Kira Geliri",
  "Baz İstasyonu / Reklam Geliri",
  "Gecikme Zammı / Tazminat",
  "Bağış & Diğer Gelirler",
];

export default function AdminFinansPage() {
  const showAlert = useAlert();
  const showConfirm = useConfirm();

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [summary, setSummary] = React.useState<Summary>({
    totalPaidDues: 0,
    totalManualIncome: 0,
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  // Filtreler
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");

  // Modal Durumu
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [submitting, setSubmitting] = React.useState(false);

  // Form State
  const [formCategory, setFormCategory] = React.useState(EXPENSE_CATEGORIES[0]);
  const [formTitle, setFormTitle] = React.useState("");
  const [formAmount, setFormAmount] = React.useState("");
  const [formDate, setFormDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [formDesc, setFormDesc] = React.useState("");
  const [formMethod, setFormMethod] = React.useState<"BANK" | "CASH" | "CARD">("BANK");
  const [formReceiptNo, setFormReceiptNo] = React.useState("");

  async function loadData() {
    setErr("");
    try {
      const res = await fetch("/api/admin/finans", { credentials: "include" });
      if (!res.ok) {
        const t = await res.text();
        setErr(`Veri alınamadı (${res.status}).`);
        return;
      }
      const data = (await res.json()) as { transactions?: Transaction[]; summary?: Summary };
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch {
      setErr("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  const openAddModal = (type: "INCOME" | "EXPENSE") => {
    setModalType(type);
    setFormCategory(type === "EXPENSE" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    setFormTitle("");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormDesc("");
    setFormMethod("BANK");
    setFormReceiptNo("");
    setModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAmount || Number(formAmount) <= 0) {
      await showAlert({ title: "Uyarı", message: "Lütfen geçerli bir başlık ve tutar girin.", variant: "warning" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/finans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: modalType,
          category: formCategory,
          title: formTitle.trim(),
          amount: Number(formAmount),
          date: formDate,
          description: formDesc.trim(),
          paymentMethod: formMethod,
          receiptNo: formReceiptNo.trim(),
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        await showAlert({ title: "Hata", message: data?.error || "Kayıt eklenemedi.", variant: "error" });
        setSubmitting(false);
        return;
      }

      await showAlert({
        title: "Başarılı",
        message: data?.message || "Kayıt başarıyla eklendi.",
        variant: "success",
      });

      setModalOpen(false);
      await loadData();
    } catch {
      await showAlert({ title: "Hata", message: "Sunucu hatası oluştu.", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await showConfirm({
      title: "Kaydı Sil",
      message: `"${title}" başlıklı işlemi silmek istediğinize emin misiniz?`,
      variant: "warning",
      confirmLabel: "Evet, Sil",
      cancelLabel: "Vazgeç",
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/finans/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        await showAlert({ title: "Hata", message: "Silinemedi.", variant: "error" });
        return;
      }
      await showAlert({ title: "Başarılı", message: "Kayıt silindi.", variant: "success" });
      await loadData();
    } catch {
      await showAlert({ title: "Hata", message: "Sunucu hatası oluştu.", variant: "error" });
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
      (t.receiptNo && t.receiptNo.toLowerCase().includes(search.toLowerCase()));

    const matchType = typeFilter === "ALL" || t.type === typeFilter;
    const matchCategory = categoryFilter === "ALL" || t.category === categoryFilter;

    return matchSearch && matchType && matchCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Finans &amp; Kasa Yönetimi
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Site aidat tahsilatları, fatura ödemeleri ve genel gider kasa defteri
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => openAddModal("INCOME")}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Gelir Ekle
          </button>
          <button
            type="button"
            onClick={() => openAddModal("EXPENSE")}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Minus className="h-4 w-4" />
            Gider Ekle
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            title="Rapor Çıktısı Al"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {err && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {err}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net Kasa Bakiyesi */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Net Kasa &amp; Banka</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${summary.netBalance >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
            {summary.netBalance.toLocaleString("tr-TR")} ₺
          </p>
          <span className="text-[11px] text-slate-600 font-medium mt-1 block">
            Tüm gelir ve gider farkı
          </span>
        </div>

        {/* Toplam Gelir */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Toplam Gelir</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            +{summary.totalIncome.toLocaleString("tr-TR")} ₺
          </p>
          <span className="text-[11px] text-slate-600 font-medium mt-1 block">
            {summary.totalPaidDues.toLocaleString("tr-TR")} ₺ Aidat Tahsilatı dahil
          </span>
        </div>

        {/* Toplam Gider */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Toplam Gider</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600">
            -{summary.totalExpense.toLocaleString("tr-TR")} ₺
          </p>
          <span className="text-[11px] text-slate-600 font-medium mt-1 block">
            Fatura, bakım ve personel giderleri
          </span>
        </div>

        {/* Tahsilat Sayısı */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Kayıt Sayısı</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {transactions.length} İşlem
          </p>
          <span className="text-[11px] text-slate-600 font-medium mt-1 block">
            Kayıtlı kasa hareketi
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="Başlık, açıklama veya kategori ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "ALL" | "INCOME" | "EXPENSE")}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
          >
            <option value="ALL">Tüm Hareketler</option>
            <option value="INCOME">Sadece Gelirler</option>
            <option value="EXPENSE">Sadece Giderler</option>
          </select>
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
          >
            <option value="ALL">Tüm Kategoriler</option>
            {[...new Set(transactions.map((t) => t.category))].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Tarih</th>
                <th className="py-4 px-6">Tür / Kategori</th>
                <th className="py-4 px-6">Açıklama</th>
                <th className="py-4 px-6">Ödeme Yöntemi</th>
                <th className="py-4 px-6 text-right">Tutar</th>
                <th className="py-4 px-6 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Veriler yükleniyor...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Henüz kayıtlı bir gelir veya gider hareketi bulunmuyor.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-600 font-semibold">
                      {item.date}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            item.type === "INCOME"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {item.type === "INCOME" ? "GELİR" : "GİDER"}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{item.category}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900 block">{item.title}</span>
                      {item.description && (
                        <span className="text-xs text-slate-500 block mt-0.5">{item.description}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {item.paymentMethod === "BANK"
                        ? "Banka Havalesi / EFT"
                        : item.paymentMethod === "CARD"
                        ? "Kredi Kartı / POS"
                        : "Nakit Kasa"}
                      {item.receiptNo && (
                        <span className="block text-[11px] font-mono text-slate-400">Fatura: {item.receiptNo}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`font-black text-sm ${
                          item.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {item.type === "INCOME" ? "+" : "-"}
                        {item.amount.toLocaleString("tr-TR")} ₺
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gelir / Gider Ekleme Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => !submitting && setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    modalType === "INCOME" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {modalType === "INCOME" ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {modalType === "INCOME" ? "Yeni Gelir Kaydı Ekle" : "Yeni Gider Kaydı Ekle"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kategori
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                >
                  {(modalType === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  İşlem Başlığı / Açıklaması *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    modalType === "EXPENSE"
                      ? "Örn: Eylül 2026 Asansör Bakım Ücreti"
                      : "Örn: Dış Cephe Reklam Kira Geliri"
                  }
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tutar (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tarih
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ödeme Yöntemi
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as "BANK" | "CASH" | "CARD")}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  >
                    <option value="BANK">Banka Transferi / EFT</option>
                    <option value="CASH">Nakit Kasa</option>
                    <option value="CARD">Kredi Kartı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fatura / Makbuz No
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: FT-2026-081"
                    value={formReceiptNo}
                    onChange={(e) => setFormReceiptNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ek Not / Açıklama
                </label>
                <textarea
                  rows={2}
                  placeholder="Detaylar veya servis notu..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-all cursor-pointer ${
                    modalType === "INCOME" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {submitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
