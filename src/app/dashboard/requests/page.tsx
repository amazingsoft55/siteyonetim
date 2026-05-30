"use client";

import * as React from "react";
import { Wrench, PlusCircle, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useAlert, useConfirm } from "@/components/ModalProvider";

interface RequestItem {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  status: "Bekliyor" | "İşlemde" | "Çözüldü";
}

export default function ResidentRequestsPage() {
  const showAlert = useAlert();
  const showConfirm = useConfirm();
  const [requests, setRequests] = React.useState<RequestItem[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("Arıza");
  const [description, setDescription] = React.useState("");
  const [loadErr, setLoadErr] = React.useState("");

  async function reload() {
    setLoadErr("");
    const res = await fetch("/api/requests", { credentials: "include" });
    const j: unknown = await res.json().catch(() => null);
    if (!res.ok || !Array.isArray(j)) {
      setLoadErr("Talepler yüklenemedi.");
      setRequests([]);
      return;
    }
    setRequests(j as RequestItem[]);
  }

  React.useEffect(() => {
    void reload();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const res = await fetch("/api/requests", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        description,
      }),
    });
    if (!res.ok) {
      await showAlert({ message: "Talep gönderilemedi.", variant: "error" });
      return;
    }

    setTitle("");
    setDescription("");
    setShowForm(false);
    await reload();
    await showAlert({ message: "Talebiniz yönetime iletildi.", variant: "success" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Bekliyor":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "İşlemde":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "Çözüldü":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      default:
        return null;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Bekliyor":
        return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30";
      case "İşlemde":
        return "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30";
      case "Çözüldü":
        return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30";
      default:
        return "";
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Taleplerim & Bildirimler</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Siteye ait arıza, bakım veya genel önerilerinizi buradan iletin.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center px-5 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-600/10 transition-colors"
          >
            <PlusCircle className="h-4.5 w-4.5 mr-2" /> Yeni Talep Aç
          </button>
        )}
      </div>

      {loadErr && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/25 p-4 text-sm text-amber-950 dark:text-amber-100">
          {loadErr}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm relative animate-in fade-in slide-in-from-top-4 duration-300">
          <button 
            onClick={() => setShowForm(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h3 className="text-xl font-bold mb-6 text-zinc-950 dark:text-zinc-50">Yeni Arıza / Destek Talebi</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Talep Başlığı</label>
                <input 
                  type="text" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-indigo-600 outline-none text-zinc-950 dark:text-zinc-50"
                  placeholder="Örn: Koridor Lambası Arızası" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Kategori</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-indigo-600 outline-none text-zinc-950 dark:text-zinc-50"
                >
                  <option value="Arıza">🛠️ Teknik / Arıza</option>
                  <option value="Temizlik">🧹 Temizlik</option>
                  <option value="Güvenlik">🔒 Güvenlik</option>
                  <option value="Diğer">📝 Diğer / Öneri</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Açıklama</label>
              <textarea 
                required 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-indigo-600 outline-none resize-none text-zinc-950 dark:text-zinc-50" 
                placeholder="Lütfen sorunun veya talebinizin detaylarını net bir şekilde yazın..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Vazgeç
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/10 transition-colors"
              >
                Talebi Gönder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Taleplerinizin Durumu</h3>

        {requests.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-8 text-center text-zinc-500">
            Henüz oluşturulmuş bir talebiniz bulunmamaktadır.
          </div>
        ) : (
          requests.map((req) => (
            <div 
              key={req.id} 
              className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 flex flex-col sm:flex-row justify-between gap-4 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-200"
            >
              <div className="flex gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-950 text-indigo-600 dark:text-indigo-400 p-3 rounded-2xl h-fit border border-zinc-100 dark:border-zinc-800/60">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-zinc-400 font-semibold">{req.id}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                      {req.category}
                    </span>
                    <span className="text-xs text-zinc-400">{req.date}</span>
                  </div>
                  <h4 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50 mt-1.5">{req.title}</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1 leading-relaxed">{req.description}</p>
                </div>
              </div>
              <div className="sm:self-center shrink-0">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusStyles(req.status)}`}>
                  {getStatusIcon(req.status)}
                  {req.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
