"use client";

import Link from "next/link";
import * as React from "react";
import { Search, ArrowRight, RefreshCw, Plus, CreditCard, X, CheckCircle } from "lucide-react";
import { useAlert } from "@/components/ModalProvider";

type Resident = {
  id: string;
  name: string;
  blok: string;
  daire: string;
  borc: number;
  durum: string;
};

type PaymentForm = {
  userId: string;
  amount: string;
  period: string;
  type: string;
  markPaid: boolean;
};

const PERIOD_OPTIONS = (() => {
  const now = new Date();
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  const result: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${months[d.getMonth()]} ${d.getFullYear()}`);
  }
  return result;
})();

const PAYMENT_TYPES = ["Aidat", "Ek Aidat", "Bakım", "Su", "Elektrik", "Diğer"];

export default function ResidentsPage() {
  const showAlert = useAlert();
  const [residents, setResidents] = React.useState<Resident[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedBlok, setSelectedBlok] = React.useState("Hepsi");
  const [selectedStatus, setSelectedStatus] = React.useState("Hepsi");
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  // Aidat oluşturma modal
  const [modalOpen, setModalOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<PaymentForm>({
    userId: "",
    amount: "",
    period: PERIOD_OPTIONS[0],
    type: "Aidat",
    markPaid: false,
  });

  // Toplu seçim
  const [selectedUsers, setSelectedUsers] = React.useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = React.useState(false);

  async function reload() {
    setErr("");
    const res = await fetch("/api/admin/residents", { credentials: "include" });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      setErr(`Veri alınamadı (${res.status}). ${t.slice(0, 240)}`);
      setResidents([]);
      return;
    }
    const data = (await res.json()) as Resident[];
    setResidents(Array.isArray(data) ? data : []);
  }

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      await reload();
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const filteredResidents = residents.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.daire.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchBlok = selectedBlok === "Hepsi" || r.blok === selectedBlok;
    const matchStatus = selectedStatus === "Hepsi" || r.durum === selectedStatus;
    return matchSearch && matchBlok && matchStatus;
  });

  function openModal(userId?: string) {
    if (userId) {
      setBulkMode(false);
      setSelectedUsers(new Set([userId]));
      setForm((f) => ({ ...f, userId, amount: "" }));
    } else if (selectedUsers.size > 0) {
      setBulkMode(true);
      setForm((f) => ({ ...f, userId: "", amount: "" }));
    } else {
      setBulkMode(true);
      setSelectedUsers(new Set(filteredResidents.map((r) => r.id)));
      setForm((f) => ({ ...f, userId: "", amount: "" }));
    }
    setModalOpen(true);
  }

  function toggleUser(id: string) {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedUsers.size === filteredResidents.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredResidents.map((r) => r.id)));
    }
  }

  async function handleSubmit() {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      await showAlert({ message: "Geçerli bir tutar girin.", variant: "error" });
      return;
    }
    if (!form.period) {
      await showAlert({ message: "Dönem seçin.", variant: "error" });
      return;
    }

    const targets = bulkMode ? [...selectedUsers] : [form.userId];
    if (targets.length === 0) {
      await showAlert({ message: "En az bir sakin seçin.", variant: "error" });
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const uid of targets) {
      try {
        const res = await fetch("/api/payments", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: uid,
            amount,
            period: form.period,
            type: form.type,
            markPaid: form.markPaid,
          }),
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    setSubmitting(false);
    setModalOpen(false);

    if (failCount === 0) {
      await showAlert({
        title: "Başarılı",
        message: `${successCount} sakin için aidat kaydı oluşturuldu.`,
        variant: "success",
      });
    } else {
      await showAlert({
        title: "Kısmi Başarı",
        message: `${successCount} başarılı, ${failCount} başarısız.`,
        variant: failCount > 0 ? "warning" : "success",
      });
    }

    setSelectedUsers(new Set());
    await reload();
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="rounded-3xl border border-indigo-200/70 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-zinc-950 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Sakin bakiyesi
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-xl leading-relaxed">
            Aidat borçlarını görüntüleyin, yeni aidat kaydı oluşturun ve tahsilat durumunu takip edin.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            type="button"
            onClick={() => openModal()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/25"
          >
            <Plus className="h-4 w-4" />
            Yeni Aidat Oluştur
          </button>
          <Link
            href="/admin/kullanicilar"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-700/25"
          >
            Kullanıcı Ekle
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await reload();
              setLoading(false);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-3 text-sm font-bold text-zinc-800 dark:text-zinc-100"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-950 dark:text-rose-100">
          {err}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-5 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="İsim veya daire ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-950 dark:text-zinc-50"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
        </div>
        <div>
          <select
            value={selectedBlok}
            onChange={(e) => setSelectedBlok(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-950 dark:text-zinc-50 appearance-none"
          >
            <option value="Hepsi">Tüm bloklar</option>
            {[...new Set(residents.map((r) => r.blok).filter(Boolean))].map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-950 dark:text-zinc-50 appearance-none"
          >
            <option value="Hepsi">Tüm durumlar</option>
            <option value="Düzenli">Düzenli</option>
            <option value="Borçlu">Borçlu</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200/60 dark:border-zinc-800/80 text-zinc-500 font-semibold">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredResidents.length && filteredResidents.length > 0}
                    onChange={toggleAll}
                    className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-4">Sakin</th>
                <th className="px-6 py-4">Blok & kapı</th>
                <th className="px-6 py-4 text-right">Ödenmemiş (₺)</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    Yükleniyor…
                  </td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                    Gösterilecek sakin kullanıcı yok veya filtrelere takıldı.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((res) => (
                  <tr key={res.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(res.id)}
                        onChange={() => toggleUser(res.id)}
                        className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs uppercase">
                          {res.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span>{res.name}</span>
                      </div>
                      <span className="block text-[10px] font-mono text-zinc-400 mt-1">{res.id.slice(0, 8)}…</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-semibold">
                      {res.blok} · {res.daire}
                    </td>
                    <td className="px-6 py-4 text-right font-black">
                      {res.borc > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">{res.borc.toLocaleString("tr-TR")} ₺</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">Borçsuz</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          res.durum === "Düzenli"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {res.durum}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openModal(res.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Aidat Ekle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Toplu aidat butonu */}
        {selectedUsers.size > 0 && (
          <div className="px-6 py-4 border-t border-zinc-200/60 dark:border-zinc-800/80 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between">
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              {selectedUsers.size} sakin seçildi
            </span>
            <button
              type="button"
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-md"
            >
              <Plus className="h-4 w-4" />
              Seçilenlere Aidat Oluştur
            </button>
          </div>
        )}
      </div>

      {/* Aidat Oluşturma Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !submitting && setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                {bulkMode ? `${selectedUsers.size} Sakine Aidat Oluştur` : "Aidat Oluştur"}
              </h3>
              <button
                type="button"
                onClick={() => !submitting && setModalOpen(false)}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {/* Seçili sakinler (toplu modda) */}
            {bulkMode && selectedUsers.size > 0 && (
              <div className="flex flex-wrap gap-2">
                {[...selectedUsers].map((uid) => {
                  const r = residents.find((x) => x.id === uid);
                  return (
                    <span
                      key={uid}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold"
                    >
                      {r?.name || uid.slice(0, 8)}
                      <button type="button" onClick={() => toggleUser(uid)} className="hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Tutar */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Tutar (₺)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Örn: 500"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-950 dark:text-zinc-50"
              />
            </div>

            {/* Dönem */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Dönem</label>
              <select
                value={form.period}
                onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-950 dark:text-zinc-50 appearance-none"
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Tür */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Tür</label>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      form.type === t
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Durum */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, markPaid: !f.markPaid }))}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  form.markPaid ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    form.markPaid ? "translate-x-5" : ""
                  }`}
                />
              </button>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {form.markPaid ? "Ödendi olarak işaretle" : "Borç olarak ekle"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {form.markPaid ? "Ödeme yapılmış olarak kaydedilir" : "Sakinin borç listesine eklenir"}
                </p>
              </div>
            </div>

            {/* Onay */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 disabled:opacity-60 transition-all"
            >
              {submitting ? (
                <>Oluşturuluyor…</>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {bulkMode ? `${selectedUsers.size} Sakine Aidat Oluştur` : "Aidat Oluştur"}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
