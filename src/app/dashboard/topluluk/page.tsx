"use client";

import * as React from "react";
import {
  MessageSquare,
  Megaphone,
  HeartHandshake,
  ShoppingBag,
  Sparkles,
  Lightbulb,
  Send,
  Plus,
  Trash2,
  Lock,
  Vote,
  ShieldCheck,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
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

interface PollOption {
  text: string;
  count: number;
  percent: number;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  expiresAt: string | null;
  totalVotes: number;
  userVotedOption: number | null;
  optionsWithVotes: PollOption[];
}

interface Message {
  id: string;
  channelId: string;
  content: string;
  imageUrl: string | null;
  isPinned: boolean;
  createdAt: string;
  isMine: boolean;
  canDelete: boolean;
  author: {
    id: string;
    name: string;
    apartmentNo: string;
    role: string;
  };
  poll: Poll | null;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Megaphone,
  MessageSquare,
  HeartHandshake,
  ShoppingBag,
  Sparkles,
  Lightbulb,
};

export default function CommunityChatPage() {
  const showAlert = useAlert();
  const showConfirm = useConfirm();

  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loadingChannels, setLoadingChannels] = React.useState(true);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [text, setText] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [showImageInput, setShowImageInput] = React.useState(false);
  const [showPollModal, setShowPollModal] = React.useState(false);

  // Poll Form State
  const [pollQuestion, setPollQuestion] = React.useState("");
  const [pollOptions, setPollOptions] = React.useState<string[]>(["", ""]);

  // Mobile View state
  const [mobileTab, setMobileTab] = React.useState<"channels" | "chat">("chat");

  const [currentUserRole, setCurrentUserRole] = React.useState<string>("USER");
  const [currentApartment, setCurrentApartment] = React.useState<string>("");

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Load current user
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u.role) setCurrentUserRole(u.role);
        if (u.apartmentNo) setCurrentApartment(u.apartmentNo);
      }
    } catch {}
  }, []);

  // Fetch Channels
  const fetchChannels = React.useCallback(async () => {
    try {
      const res = await fetch("/api/community/channels", { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setChannels(data);
        if (data.length > 0 && !activeChannelId) {
          // Varsayılan olarak ilk sohbet kanalını seç
          const defaultCh = data.find((c: Channel) => c.slug === "sohbet") || data[0];
          setActiveChannelId(defaultCh.id);
        }
      }
    } catch (err) {
      console.error("Channels load failed", err);
    } finally {
      setLoadingChannels(false);
    }
  }, [activeChannelId]);

  React.useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Fetch Messages for active channel
  const fetchMessages = React.useCallback(async (channelId: string, showSpinner = false) => {
    if (!channelId) return;
    if (showSpinner) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/community/messages?channelId=${channelId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Messages load failed", err);
    } finally {
      if (showSpinner) setLoadingMessages(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeChannelId) {
      fetchMessages(activeChannelId, true);
    }
  }, [activeChannelId, fetchMessages]);

  // Polling every 4 seconds for live chat feel
  React.useEffect(() => {
    if (!activeChannelId) return;
    const interval = setInterval(() => {
      fetchMessages(activeChannelId, false);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeChannelId, fetchMessages]);

  // Scroll to bottom on messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const activeChannel = channels.find((c) => c.id === activeChannelId);
  const isAdmin = currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN";
  const isReadOnly = activeChannel?.isAnnouncementOnly && !isAdmin;

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!text.trim() && !imageUrl.trim()) || sending || !activeChannelId) return;

    setSending(true);
    try {
      const res = await fetch("/api/community/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          channelId: activeChannelId,
          content: text.trim(),
          imageUrl: imageUrl.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        throw new Error(data?.error || "Mesaj gönderilemedi");
      }
      setText("");
      setImageUrl("");
      setShowImageInput(false);
      await fetchMessages(activeChannelId, false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Mesaj gönderilemedi";
      showAlert({ title: "Hata", message: msg, variant: "error" });
    } finally {
      setSending(false);
    }
  };

  // Create Poll
  const handleCreatePoll = async () => {
    if (!pollQuestion.trim()) {
      showAlert({ title: "Uyarı", message: "Lütfen anket sorusunu girin.", variant: "warning" });
      return;
    }
    const cleanOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      showAlert({ title: "Uyarı", message: "En az 2 seçenek eklemelisiniz.", variant: "warning" });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/community/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          channelId: activeChannelId,
          content: `📊 Oylama: ${pollQuestion.trim()}`,
          poll: {
            question: pollQuestion.trim(),
            options: cleanOptions,
          },
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error || "Anket oluşturulamadı");

      setShowPollModal(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      await fetchMessages(activeChannelId, false);
      showAlert({ title: "Başarılı", message: "Anket oylamaya açıldı!", variant: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Anket oluşturulamadı";
      showAlert({ title: "Hata", message: msg, variant: "error" });
    } finally {
      setSending(false);
    }
  };

  // Vote on Poll
  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      const res = await fetch("/api/community/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pollId, optionIndex }),
      });
      if (res.ok) {
        await fetchMessages(activeChannelId, false);
      }
    } catch (err) {
      console.error("Vote failed", err);
    }
  };

  // Delete message
  const handleDeleteMessage = async (msgId: string) => {
    const ok = await showConfirm({
      title: "Mesajı Sil",
      message: "Bu mesajı silmek istediğinizden emin misiniz?",
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
      } else {
        const d = (await res.json().catch(() => null)) as { error?: string } | null;
        showAlert({ title: "Hata", message: d?.error || "Silinemedi", variant: "error" });
      }
    } catch {
      showAlert({ title: "Hata", message: "İşlem sırasında bir hata oluştu", variant: "error" });
    }
  };

  const getChannelIcon = (iconName: string) => {
    const Component = ICON_MAP[iconName] || MessageSquare;
    return <Component className="h-4.5 w-4.5 shrink-0" />;
  };

  return (
    <div className="flex h-full flex-col bg-slate-50 overflow-hidden">
      {/* ══════ TOP PRIVACY & STATUS BANNER ══════ */}
      <div className="bg-emerald-50/80 border-b border-emerald-100/80 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>KVKK &amp; Gizlilik Korumalı:</strong> Telefon numaranız gizlidir, komşularınız yalnızca dairenizi (
            <span className="font-semibold">{currentApartment ? `Daire ${currentApartment}` : "Daireniz"}</span>) görür.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Canlı Komşuluk Ağı</span>
        </div>
      </div>

      {/* ══════ MAIN CONTAINER (SIDEBAR + CHAT) ══════ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── LEFT CHANNELS LIST (Desktop & Mobile Drawer) ── */}
        <aside
          className={`w-full md:w-72 lg:w-80 border-r border-slate-200/80 bg-white flex flex-col shrink-0 ${
            mobileTab === "chat" ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-600" />
                Komşuluk Kanalları
              </h2>
              <p className="text-[11px] text-slate-500">Konusuna göre ayrılmış gruplar</p>
            </div>
            <button
              onClick={() => fetchChannels()}
              title="Yenile"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Channel list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingChannels ? (
              <div className="p-4 text-center text-xs text-slate-400">Kanallar yükleniyor...</div>
            ) : (
              channels.map((ch) => {
                const isActive = ch.id === activeChannelId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveChannelId(ch.id);
                      setMobileTab("chat");
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                      isActive
                        ? "bg-indigo-50 border border-indigo-200/70 text-indigo-950 shadow-xs"
                        : "hover:bg-slate-50 border border-transparent text-slate-700"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {getChannelIcon(ch.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${isActive ? "text-indigo-950" : "text-slate-800"}`}>
                          {ch.name}
                        </span>
                        {ch.isAnnouncementOnly && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold shrink-0">
                            Resmi
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {ch.description || "Grup mesajlaşma"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── RIGHT CHAT STREAM ── */}
        <section
          className={`flex-1 flex flex-col bg-white min-h-0 overflow-hidden ${
            mobileTab === "channels" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Chat Header */}
          {activeChannel ? (
            <div className="px-4 py-3 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileTab("channels")}
                  className="md:hidden p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-lg"
                  title="Kanallara Dön"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  {getChannelIcon(activeChannel.icon)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                    {activeChannel.name}
                    {activeChannel.isAnnouncementOnly && (
                      <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                        Yalnızca Yönetim Yazar
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {activeChannel.description || "Komşuluk grubu"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!isReadOnly && (
                  <button
                    onClick={() => setShowPollModal(true)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <Vote className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Anket Başlat</span>
                  </button>
                )}
                <button
                  onClick={() => fetchMessages(activeChannelId, false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Yenile"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-slate-200/80 bg-white">
              <p className="text-xs text-slate-400">Kanal seçilmedi</p>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-48 text-xs text-slate-400">
                Mesajlar yükleniyor...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Bu kanalda henüz mesaj yok</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  İlk mesajı yazarak komşularınızla iletişimi başlatabilirsiniz!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.isMine;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col group ${isMine ? "items-end" : "items-start"}`}
                  >
                    {/* Sender badge (if not mine) */}
                    {!isMine && (
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-xs font-bold text-slate-800">
                          {msg.author.name}
                        </span>
                        <span className="text-[10px] font-semibold bg-indigo-100/70 text-indigo-700 px-1.5 py-0.2 rounded">
                          {msg.author.apartmentNo}
                        </span>
                        {msg.author.role === "ADMIN" && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                            Yönetici
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`relative max-w-[85%] sm:max-w-md md:max-w-lg rounded-2xl p-3.5 shadow-xs ${
                        isMine
                          ? "bg-indigo-600 text-white rounded-br-xs"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                      }`}
                    >
                      {/* Image Attachment */}
                      {msg.imageUrl && (
                        <div className="mb-2 rounded-xl overflow-hidden max-h-60 bg-black/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.imageUrl}
                            alt="Ek"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}

                      {/* Text */}
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isMine ? "text-white" : "text-slate-800"}`}>
                        {msg.content}
                      </p>

                      {/* Attached Poll */}
                      {msg.poll && (
                        <div
                          className={`mt-3 p-3 rounded-xl border ${
                            isMine
                              ? "bg-indigo-700/60 border-indigo-500/50 text-white"
                              : "bg-slate-50 border-slate-200/80 text-slate-900"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold flex items-center gap-1.5">
                              <Vote className="h-3.5 w-3.5 text-indigo-400" />
                              {msg.poll.question}
                            </span>
                            <span className="text-[10px] opacity-75 font-medium">
                              {msg.poll.totalVotes} oy
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {msg.poll.optionsWithVotes.map((opt, idx) => {
                              const isVoted = msg.poll?.userVotedOption === idx;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleVote(msg.poll!.id, idx)}
                                  className={`w-full text-left relative overflow-hidden rounded-lg p-2 text-xs transition-all border ${
                                    isVoted
                                      ? isMine
                                        ? "border-emerald-400 bg-indigo-900/50 font-bold"
                                        : "border-indigo-500 bg-indigo-50 font-bold text-indigo-900"
                                      : isMine
                                      ? "border-indigo-500/40 bg-indigo-800/40 hover:bg-indigo-800/60"
                                      : "border-slate-200 bg-white hover:bg-slate-100"
                                  }`}
                                >
                                  {/* Progress bar fill */}
                                  <div
                                    className={`absolute inset-y-0 left-0 transition-all ${
                                      isVoted
                                        ? isMine
                                          ? "bg-emerald-500/20"
                                          : "bg-indigo-500/15"
                                        : isMine
                                        ? "bg-white/10"
                                        : "bg-slate-100"
                                    }`}
                                    style={{ width: `${opt.percent}%` }}
                                  />
                                  <div className="relative flex items-center justify-between z-10">
                                    <span className="flex items-center gap-1.5">
                                      {isVoted && (
                                        <CheckCircle2
                                          className={`h-3.5 w-3.5 ${
                                            isMine ? "text-emerald-400" : "text-indigo-600"
                                          }`}
                                        />
                                      )}
                                      {opt.text}
                                    </span>
                                    <span className="font-semibold text-[11px] opacity-80">
                                      %{opt.percent} ({opt.count})
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Footer time & delete */}
                      <div
                        className={`flex items-center justify-between gap-3 mt-1 text-[10px] ${
                          isMine ? "text-indigo-200" : "text-slate-400"
                        }`}
                      >
                        <span>
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                        {msg.canDelete && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-500 ${
                              isMine ? "text-indigo-200" : "text-slate-400"
                            }`}
                            title="Mesajı Sil"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-200/80 bg-white shrink-0">
            {isReadOnly ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center gap-2 text-xs text-amber-800">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Bu kanal yalnızca yönetim resmi duyuruları içindir. Sakinler sadece okuyabilir.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-2">
                {/* Image input popup field */}
                {showImageInput && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <ImageIcon className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      type="url"
                      placeholder="Görsel bağlantı adresi (URL) yapıştırın..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl("");
                        setShowImageInput(false);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      showImageInput || imageUrl
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                    title="Fotoğraf Ekle"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPollModal(true)}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    title="Anket / Oylama Başlat"
                  >
                    <Vote className="h-4 w-4" />
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      rows={1}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={`#${activeChannel?.name || "Kanala"} mesaj yazın...`}
                      className="w-full resize-none rounded-xl border border-slate-200/90 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={(!text.trim() && !imageUrl.trim()) || sending}
                    className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* ══════ MODAL: CREATE POLL ══════ */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Vote className="h-4 w-4 text-indigo-600" />
                Yeni Komşuluk Anketi / Oylaması
              </h3>
              <button
                onClick={() => setShowPollModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Anket Sorusu / Konu
                </label>
                <input
                  type="text"
                  placeholder="Örn: Bina dış cephesi hangi renge boyansın?"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seçenekler
                </label>
                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Seçenek ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const next = [...pollOptions];
                          next[idx] = e.target.value;
                          setPollOptions(next);
                        }}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setPollOptions(pollOptions.filter((_, i) => i !== idx));
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Seçenek Ekle
                  </button>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPollModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleCreatePoll}
                  disabled={sending}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-xs"
                >
                  {sending ? "Oluşturuluyor..." : "Anketi Başlat"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
