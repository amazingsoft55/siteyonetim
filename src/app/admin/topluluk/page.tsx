"use client";

import * as React from "react";
import {
  MessagesSquare,
  Plus,
  Trash2,
  Lock,
  ShieldCheck,
  RefreshCw,
  X,
  Users,
} from "lucide-react";
import { useAlert, useConfirm } from "@/components/ModalProvider";

interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  isAnnouncementOnly: boolean;
  sortOrder: number;
}

interface Message {
  id: string;
  channelId: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    apartmentNo: string;
    role: string;
  };
}

export default function AdminCommunityPage() {
  const showAlert = useAlert();
  const showConfirm = useConfirm();

  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMessages, setLoadingMessages] = React.useState(false);

  // New Channel Modal
  const [showNewChannelModal, setShowNewChannelModal] = React.useState(false);
  const [newChannelName, setNewChannelName] = React.useState("");
  const [newChannelDesc, setNewChannelDesc] = React.useState("");
  const [newChannelIcon, setNewChannelIcon] = React.useState("MessageSquare");
  const [newChannelAnnouncementOnly, setNewChannelAnnouncementOnly] = React.useState(false);
  const [savingChannel, setSavingChannel] = React.useState(false);

  // Load Channels
  const fetchChannels = React.useCallback(async () => {
    try {
      const res = await fetch("/api/community/channels", { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setChannels(data);
        if (data.length > 0 && !selectedChannelId) {
          setSelectedChannelId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedChannelId]);

  React.useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Fetch Messages for selected channel
  const fetchMessages = React.useCallback(async (channelId: string) => {
    if (!channelId) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/community/messages?channelId=${channelId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  React.useEffect(() => {
    if (selectedChannelId) {
      fetchMessages(selectedChannelId);
    }
  }, [selectedChannelId, fetchMessages]);

  // Create Channel
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) {
      showAlert({ title: "Hata", message: "Lütfen kanal adını girin.", variant: "error" });
      return;
    }

    setSavingChannel(true);
    try {
      const res = await fetch("/api/community/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newChannelName.trim(),
          description: newChannelDesc.trim() || undefined,
          icon: newChannelIcon,
          isAnnouncementOnly: newChannelAnnouncementOnly,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kanal oluşturulamadı");

      setShowNewChannelModal(false);
      setNewChannelName("");
      setNewChannelDesc("");
      await fetchChannels();
      showAlert({ title: "Başarılı", message: "Yeni komşuluk grubu/kanalı oluşturuldu.", variant: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "İşlem başarısız";
      showAlert({ title: "Hata", message: msg, variant: "error" });
    } finally {
      setSavingChannel(false);
    }
  };

  // Delete message (Moderation)
  const handleDeleteMessage = async (msgId: string) => {
    const ok = await showConfirm({
      title: "Mesajı Kaldır",
      message: "Bu mesajı uygunsuzluk veya kural ihlali sebebiyle gruptan silmek istediğinize emin misiniz?",
      confirmLabel: "Evet, Sil",
      cancelLabel: "Vazgeç",
      variant: "warning",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/community/messages?id=${msgId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        showAlert({ title: "Başarılı", message: "Mesaj gruptan kaldırıldı.", variant: "success" });
      } else {
        showAlert({ title: "Hata", message: "Mesaj silinemedi.", variant: "error" });
      }
    } catch {
      showAlert({ title: "Hata", message: "Bağlantı hatası oluştu.", variant: "error" });
    }
  };

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  return (
    <div className="space-y-6">
      {/* Başlık ve Butonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <MessagesSquare className="h-7 w-7 text-indigo-600" />
            Topluluk &amp; Komşu Grupları Yönetimi
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Bina içi tematik sohbet kanallarını düzenleyin, yeni gruplar açın ve mesajları modere edin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewChannelModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> Yeni Kanal Ekle
          </button>
        </div>
      </div>

      {/* KVKK ve Bilgi Kartı */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 space-y-1">
          <p className="font-bold">
            KVKK Uyumlu Güvenli Komşuluk Sistemi:
          </p>
          <p className="text-indigo-800 leading-relaxed">
            WhatsApp gruplarında telefon numaraları ifşa olurken; sistemimizde sakinler yalnızca daire numarası ve isimleriyle görünür.
            Yönetici olarak uygunsuz içerikleri saniyeler içinde silebilir ve resmi kanalları tek yönlü duyuru moduna alabilirsiniz.
          </p>
        </div>
      </div>

      {/* Kanal Listesi & Mesaj Akışı Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Sütun: Kanallar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" /> Aktif Kanallar ({channels.length})
            </h2>
            <button
              onClick={() => fetchChannels()}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Yenile"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Yükleniyor...</div>
            ) : (
              channels.map((ch) => {
                const isActive = ch.id === selectedChannelId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChannelId(ch.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? "bg-indigo-50 border-indigo-300 text-indigo-950 shadow-xs font-bold"
                        : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs truncate">{ch.name}</span>
                        {ch.isAnnouncementOnly && (
                          <Lock className="h-3 w-3 text-amber-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] font-normal text-slate-500 truncate mt-0.5">
                        {ch.description || "Grup kanalı"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Sağ Sütun: Seçili Kanal Mesajları & Moderasyon */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {selectedChannel?.name || "Kanal Seçilmedi"}
                {selectedChannel?.isAnnouncementOnly && (
                  <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                    Sadece Yönetim Yazar
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedChannel?.description || "Mesaj ve moderasyon paneli"}
              </p>
            </div>

            <button
              onClick={() => selectedChannelId && fetchMessages(selectedChannelId)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              title="Yenile"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Mesaj Listesi */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loadingMessages ? (
              <div className="p-8 text-center text-xs text-slate-400">Mesajlar yükleniyor...</div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Bu kanalda henüz mesaj bulunmuyor.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all flex items-start justify-between gap-4 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {msg.author.name}
                      </span>
                      <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded">
                        {msg.author.apartmentNo}
                      </span>
                      {msg.author.role === "ADMIN" && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                          Yönetici
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString("tr-TR") : ""}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>

                    {msg.imageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden max-h-40 max-w-xs bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={msg.imageUrl} alt="Ek" className="h-auto w-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Sil Butonu (Yönetici Moderasyonu) */}
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                    title="Mesajı Gruptan Sil (Modere Et)"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ══════ MODAL: YENİ KANAL OLUŞTUR ══════ */}
      {showNewChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-600" />
                Yeni Komşuluk Kanalı / Grubu
              </h3>
              <button
                onClick={() => setShowNewChannelModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kanal Adı &amp; İkon
                </label>
                <input
                  type="text"
                  placeholder="Örn: 🚗 Otopark & Araç Paylaşımı"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: Bina otoparkı ve araç şarj konularında yardımlaşma."
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    Resmi Kanal (Yalnızca Yönetim Yazar)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Açık olursa sakinler sadece okuyabilir, mesaj yazamaz.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newChannelAnnouncementOnly}
                  onChange={(e) => setNewChannelAnnouncementOnly(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewChannelModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={savingChannel}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-xs"
                >
                  {savingChannel ? "Kaydediliyor..." : "Kanalı Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
