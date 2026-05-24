"use client";

import * as React from "react";
import { PlusCircle, Megaphone, Trash2, Calendar, X } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  date: string;
  content: string;
  category?: string;
  isNew?: boolean;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("Genel");
  const [content, setContent] = React.useState("");

  React.useEffect(() => {
    const stored = localStorage.getItem("site_announcements");
    if (stored) {
      setAnnouncements(JSON.parse(stored));
    } else {
      const defaults: Announcement[] = [
        { id: 1, title: "Havuz Bakımı Hakkında", date: "24 Mayıs 2026", content: "Açık havuzumuz 1 Haziran itibariyle kullanıma açılacaktır. Havuz kurallarına dikkat etmenizi rica ederiz.", category: "Genel", isNew: true },
        { id: 2, title: "Mayıs Ayı Ortak Gider Bildirimi", date: "20 Mayıs 2026", content: "Ortak alan elektrik faturalarındaki artış nedeniyle Haziran ayı aidatlarına %5 enflasyon farkı yansıtılmıştır.", category: "Mali", isNew: false },
        { id: 3, title: "Asansör Periyodik Bakımı", date: "15 Nisan 2026", content: "A Blok asansörleri periyodik bakım nedeniyle yarın 10:00 - 12:00 saatleri arasında geçici olarak servis dışı kalacaktır.", category: "Teknik", isNew: false }
      ];
      localStorage.setItem("site_announcements", JSON.stringify(defaults));
      setAnnouncements(defaults);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newAnn: Announcement = {
      id: Date.now(),
      title,
      date: new Date().toLocaleDateString("tr-TR"),
      content,
      category,
      isNew: true
    };

    // Prepend new announcement
    const updated = [newAnn, ...announcements];
    localStorage.setItem("site_announcements", JSON.stringify(updated));
    setAnnouncements(updated);

    // Reset Form
    setTitle("");
    setContent("");
    setCategory("Genel");
    setShowForm(false);
    alert("Duyuru başarıyla yayınlandı!");
  };

  const handleDelete = (id: number) => {
    if (!confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;
    const filtered = announcements.filter(a => a.id !== id);
    localStorage.setItem("site_announcements", JSON.stringify(filtered));
    setAnnouncements(filtered);
  };

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
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Duyuru Yönetimi</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Kat malikleri ve sakinlerin panolarına yeni duyurular yayınlayın.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center px-5 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-2xl shadow-lg shadow-rose-600/10 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4.5 w-4.5 mr-2" /> Yeni Duyuru Yayınla
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm relative animate-in fade-in slide-in-from-top-4 duration-300">
          <button 
            onClick={() => setShowForm(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          >
            <X className="h-5 w-5" />
          </button>

          <h3 className="text-xl font-bold mb-6 text-zinc-950 dark:text-zinc-50">Yeni Duyuru Oluştur</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Duyuru Başlığı</label>
                <input 
                  type="text" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50"
                  placeholder="Örn: Asansör Bakımı" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Kategori</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50"
                >
                  <option value="Genel">Genel / Duyuru</option>
                  <option value="Mali">Mali / Aidat</option>
                  <option value="Teknik">Teknik / Bakım</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Açıklama</label>
              <textarea 
                required 
                rows={5} 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none resize-none text-zinc-950 dark:text-zinc-50"
                placeholder="Duyuru metnini buraya yazın..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                İptal
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold shadow-md shadow-rose-600/10 transition-colors"
              >
                Yayınla
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Yayınlanmış Duyurular</h3>

        {announcements.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-8 text-center text-zinc-500">
            Yayınlanmış duyuru bulunmuyor.
          </div>
        ) : (
          announcements.map((ann) => (
            <div 
              key={ann.id} 
              className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start gap-4 shadow-sm hover:border-rose-200 dark:hover:border-rose-950/40 transition-all duration-200"
            >
              <div className="flex gap-4">
                <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-3.5 rounded-2xl shrink-0 border border-rose-100 dark:border-rose-900/30">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">{ann.title}</h4>
                    {ann.isNew && (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 rounded-full">YENİ</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${getCategoryColor(ann.category)}`}>
                      {ann.category || "Genel"}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {ann.date}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-3 leading-relaxed">{ann.content}</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(ann.id)}
                className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border border-transparent hover:border-red-100 dark:hover:border-red-900/30 cursor-pointer self-start"
                title="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
