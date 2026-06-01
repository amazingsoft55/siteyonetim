"use client";

import * as React from "react";
import { Wrench, Clock, AlertCircle, CheckCircle2, XCircle, Filter, Search, X, ImageIcon } from "lucide-react";
import { useAlert, useConfirm } from "@/components/ModalProvider";

interface RequestItem {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  status: "Bekliyor" | "İşlemde" | "Çözüldü" | "Reddedildi";
  resolutionNote?: string | null;
  resolutionImageUrl?: string | null;
  rejectedNote?: string | null;
  rejectedImageUrl?: string | null;
}

export default function AdminRequestsPage() {
  const showAlert = useAlert();
  const showConfirm = useConfirm();
  const [requests, setRequests] = React.useState<RequestItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("Hepsi");
  const [loadErr, setLoadErr] = React.useState("");

  // Modal state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<"Çözüldü" | "Reddedildi">("Çözüldü");
  const [modalRequestId, setModalRequestId] = React.useState("");
  const [modalNote, setModalNote] = React.useState("");
  const [modalImageUrl, setModalImageUrl] = React.useState<string | null>(null);
  const [modalUploading, setModalUploading] = React.useState(false);
  const [modalSubmitting, setModalSubmitting] = React.useState(false);
  const modalFileRef = React.useRef<HTMLInputElement>(null);

  async function loadRequests() {
    setLoadErr("");
    const res = await fetch("/api/requests", { credentials: "include" });
    const raw: unknown = await res.json().catch(() => null);
    if (!res.ok || !Array.isArray(raw)) {
      setLoadErr("Talepler veritabanından okunamıyor.");
      setRequests([]);
      return;
    }
    setRequests(raw as RequestItem[]);
  }

  React.useEffect(() => {
    void loadRequests();
  }, []);

  const openModal = (id: string, type: "Çözüldü" | "Reddedildi") => {
    setModalRequestId(id);
    setModalType(type);
    setModalNote("");
    setModalImageUrl(null);
    setModalOpen(true);
  };

  const handleModalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      void showAlert({ message: "Görsel en fazla 2MB olabilir.", variant: "error" });
      return;
    }
    setModalUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setModalImageUrl(reader.result as string);
      setModalUploading(false);
    };
    reader.onerror = () => setModalUploading(false);
    reader.readAsDataURL(file);
  };

  const submitModal = async () => {
    if (modalSubmitting) return;
    setModalSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: modalRequestId,
          status: modalType,
          note: modalNote || null,
          imageUrl: modalImageUrl || null,
        }),
      });
      if (!res.ok) {
        await showAlert({ message: "Durum güncellenemedi.", variant: "error" });
        return;
      }
      setModalOpen(false);
      await loadRequests();
      await showAlert({ message: `Talep "${modalType}" olarak kaydedildi.`, variant: "success" });
    } finally {
      setModalSubmitting(false);
    }
  };

  const updateStatus = async (id: string, newStatus: "Bekliyor" | "İşlemde") => {
    const res = await fetch("/api/requests", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (!res.ok) {
      await showAlert({ message: "Durum güncellenemedi.", variant: "error" });
      return;
    }
    await loadRequests();
    await showAlert({ message: `Talep durumu "${newStatus}" olarak kaydedildi.`, variant: "success" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Bekliyor": return <Clock className="h-4 w-4 text-amber-500" />;
      case "İşlemde": return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "Çözüldü": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "Reddedildi": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Bekliyor": return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30";
      case "İşlemde": return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30";
      case "Çözüldü": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30";
      case "Reddedildi": return "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/30";
      default: return "";
    }
  };

  const filtered = requests.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Hepsi" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Arıza & Talepler</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Sakinlerden gelen bildirimleri takip edin, çözüm veya red notu ekleyin.</p>
        {loadErr && <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 font-semibold">{loadErr}</p>}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-5 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="relative md:col-span-2">
          <input 
            type="text" 
            placeholder="Talep adı veya ID ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50"
          />
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400" />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50 appearance-none"
          >
            <option value="Hepsi">Tüm Talepler</option>
            <option value="Bekliyor">Bekleyenler</option>
            <option value="İşlemde">İşlemdekiler</option>
            <option value="Çözüldü">Çözülenler</option>
            <option value="Reddedildi">Reddedilenler</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-12 text-center text-zinc-500">
            Filtrelere uygun talep bulunamadı.
          </div>
        ) : (
          filtered.map((req) => (
            <div 
              key={req.id} 
              className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm hover:border-rose-200 dark:hover:border-rose-950/40 transition-all duration-200"
            >
              {/* Resolution/Rejection Note */}
              {req.status === "Çözüldü" && req.resolutionNote && (
                <div className="px-6 py-3 bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">Çözüm Notu</p>
                  <p className="text-sm text-emerald-900 dark:text-emerald-200">{req.resolutionNote}</p>
                  {req.resolutionImageUrl && (
                    <img src={req.resolutionImageUrl} alt="Çözüm görseli" className="mt-2 max-h-32 rounded-xl object-cover" />
                  )}
                </div>
              )}
              {req.status === "Reddedildi" && req.rejectedNote && (
                <div className="px-6 py-3 bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30">
                  <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">Red Nedeni</p>
                  <p className="text-sm text-red-900 dark:text-red-200">{req.rejectedNote}</p>
                  {req.rejectedImageUrl && (
                    <img src={req.rejectedImageUrl} alt="Red görseli" className="mt-2 max-h-32 rounded-xl object-cover" />
                  )}
                </div>
              )}

              <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4">
                  <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-3.5 rounded-2xl shrink-0 border border-rose-100 dark:border-rose-900/30 h-fit">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-400">{req.id.slice(0, 8)}…</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                        {req.category}
                      </span>
                      <span className="text-xs text-zinc-400">{req.date}</span>
                    </div>
                    <h4 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50 mt-1.5">{req.title}</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1 leading-relaxed max-w-xl">{req.description}</p>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex flex-col justify-center gap-2 md:items-end shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 dark:border-zinc-800/80">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusStyles(req.status)}`}>
                    {getStatusIcon(req.status)}
                    {req.status}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {req.status !== "Bekliyor" && (
                      <button 
                        type="button"
                        onClick={() => void updateStatus(req.id, "Bekliyor")}
                        className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-900/40 dark:text-amber-400 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                      >
                        Beklet
                      </button>
                    )}
                    {req.status !== "İşlemde" && (
                      <button 
                        type="button"
                        onClick={() => void updateStatus(req.id, "İşlemde")}
                        className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-900/40 dark:text-blue-400 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                      >
                        İşleme Al
                      </button>
                    )}
                    {req.status !== "Çözüldü" && (
                      <button 
                        type="button"
                        onClick={() => openModal(req.id, "Çözüldü")}
                        className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900/40 dark:text-emerald-400 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      >
                        Çözüldü
                      </button>
                    )}
                    {req.status !== "Reddedildi" && (
                      <button 
                        type="button"
                        onClick={() => openModal(req.id, "Reddedildi")}
                        className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-900/40 dark:text-red-400 dark:bg-red-950/20 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      >
                        Reddet
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolution/Rejection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                {modalType === "Çözüldü" ? "Talebi Çöz" : "Talebi Reddet"}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                {modalType === "Çözüldü" ? "Çözüm Açıklaması" : "Red Nedeni"}
              </label>
              <textarea
                rows={3}
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none resize-none text-zinc-950 dark:text-zinc-50 text-sm"
                placeholder={modalType === "Çözüldü" ? "Nasıl çözüldüğünü açıklayın..." : "Red nedenini yazın..."}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Görsel (isteğe bağlı)</label>
              {modalImageUrl ? (
                <div className="relative inline-block">
                  <img src={modalImageUrl} alt="Önizleme" className="w-full max-h-40 object-cover rounded-2xl border border-zinc-200 dark:border-zinc-800" />
                  <button
                    type="button"
                    onClick={() => { setModalImageUrl(null); if (modalFileRef.current) modalFileRef.current.value = ""; }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => modalFileRef.current?.click()}
                  className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 text-center cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
                >
                  {modalUploading ? (
                    <p className="text-sm text-zinc-500">Yükleniyor...</p>
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 mx-auto mb-1 text-zinc-300 dark:text-zinc-600" />
                      <p className="text-xs text-zinc-500">Görsel yüklemek için tıklayın (Max 2MB)</p>
                    </>
                  )}
                </div>
              )}
              <input ref={modalFileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleModalImageUpload} className="hidden" />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={submitModal}
                disabled={modalSubmitting}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-md transition-colors disabled:opacity-50 ${
                  modalType === "Çözüldü"
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10"
                    : "bg-red-600 hover:bg-red-500 shadow-red-600/10"
                }`}
              >
                {modalSubmitting ? "Kaydediliyor..." : modalType === "Çözüldü" ? "Çözüldü Olarak Kaydet" : "Reddet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
