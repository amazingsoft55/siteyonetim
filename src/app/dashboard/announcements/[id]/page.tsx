"use client";

import * as React from "react";
import { Megaphone, Calendar, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  category?: string;
  imageUrl?: string | null;
  images?: string[];
  isNew?: boolean;
}

export default function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [announcement, setAnnouncement] = React.useState<Announcement | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const resolvedParams = React.use(params);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/announcements?id=${resolvedParams.id}`, { credentials: "include" });
        if (!res.ok) {
          if (!cancelled) { setError("Duyuru bulunamadı."); setLoading(false); }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setAnnouncement(data as Announcement);
          setLoading(false);
        }
      } catch {
        if (!cancelled) { setError("Bağlantı hatası."); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <Link href="/dashboard/announcements" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Duyurulara Dön
        </Link>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-12 text-center text-zinc-500">
          {error || "Duyuru bulunamadı."}
        </div>
      </div>
    );
  }

  const allImages = announcement.images && announcement.images.length > 0
    ? announcement.images
    : (announcement.imageUrl ? [announcement.imageUrl] : []);

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case "Mali":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";
      case "Teknik":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30";
      default:
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/dashboard/announcements" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Duyurulara Dön
      </Link>

      {/* Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm">
        {/* Image Gallery */}
        {allImages.length > 0 && (
          <div className="relative">
            <img
              src={allImages[currentImageIndex]}
              alt={announcement.title}
              className="w-full max-h-[400px] object-cover"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImageIndex ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-3.5 rounded-2xl shrink-0 border border-indigo-100 dark:border-indigo-900/30">
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50">
                  {announcement.title}
                </h1>
                {announcement.isNew && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 rounded-full">
                    YENİ
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {announcement.category && (
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getCategoryColor(announcement.category)}`}>
                    {announcement.category}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  {announcement.date}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-100 dark:border-zinc-800" />

          {/* Body */}
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            {announcement.content.split("\n").map((line, i) => (
              <p key={i} className="text-zinc-700 dark:text-zinc-300 text-[15px] leading-relaxed">
                {line}
              </p>
            ))}
          </div>

          {/* All images as thumbnails below */}
          {allImages.length > 1 && (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Tüm Görseller ({allImages.length})</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`rounded-xl overflow-hidden border-2 transition-colors ${
                      idx === currentImageIndex
                        ? "border-indigo-500 dark:border-indigo-400"
                        : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <img src={img} alt={`Görsel ${idx + 1}`} className="w-full h-16 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
