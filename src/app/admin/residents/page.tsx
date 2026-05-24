"use client";

import * as React from "react";
import { Search, PlusCircle, Filter, Trash2, Edit2, X } from "lucide-react";

interface Resident {
  id: number;
  name: string;
  daire: string;
  blok: string;
  borc: number;
  durum: string;
}

export default function ResidentsPage() {
  const [residents, setResidents] = React.useState<Resident[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedBlok, setSelectedBlok] = React.useState("Hepsi");
  const [selectedStatus, setSelectedStatus] = React.useState("Hepsi");
  
  // Modal state
  const [showModal, setShowModal] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [targetId, setTargetId] = React.useState<number | null>(null);
  
  // Form fields
  const [formName, setFormName] = React.useState("");
  const [formBlok, setFormBlok] = React.useState("A Blok");
  const [formDaire, setFormDaire] = React.useState("");
  const [formBorc, setFormBorc] = React.useState("0");

  React.useEffect(() => {
    // 1. Get resident balance from user side to keep them in sync!
    const userBalanceStored = localStorage.getItem("resident_balance");
    const userBalance = userBalanceStored !== null ? Number(userBalanceStored) : 1250;

    // 2. Load resident database
    const stored = localStorage.getItem("admin_residents");
    let currentResidents: Resident[] = [];
    if (stored) {
      currentResidents = JSON.parse(stored);
    } else {
      currentResidents = [
        { id: 1, name: "Ahmet Yılmaz", daire: "Daire 14", blok: "A Blok", borc: 1250, durum: "Borçlu" },
        { id: 2, name: "Ayşe Demir", daire: "Daire 5", blok: "B Blok", borc: 0, durum: "Düzenli" },
        { id: 3, name: "Mehmet Kaya", daire: "Daire 22", blok: "A Blok", borc: 0, durum: "Düzenli" },
        { id: 4, name: "Elif Şahin", daire: "Daire 1", blok: "C Blok", borc: 2500, durum: "Borçlu" },
      ];
    }

    // Sync Ahmet's balance (id: 1)
    const ahmetIndex = currentResidents.findIndex(r => r.id === 1);
    if (ahmetIndex !== -1) {
      currentResidents[ahmetIndex].borc = userBalance;
      currentResidents[ahmetIndex].durum = userBalance > 0 ? "Borçlu" : "Düzenli";
    }

    localStorage.setItem("admin_residents", JSON.stringify(currentResidents));
    setResidents(currentResidents);
  }, []);

  const handleOpenAdd = () => {
    setModalMode("add");
    setFormName("");
    setFormBlok("A Blok");
    setFormDaire("");
    setFormBorc("0");
    setShowModal(true);
  };

  const handleOpenEdit = (res: Resident) => {
    setModalMode("edit");
    setTargetId(res.id);
    setFormName(res.name);
    setFormBlok(res.blok);
    setFormDaire(res.daire.replace("Daire ", ""));
    setFormBorc(res.borc.toString());
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDaire) return;

    const borcVal = Number(formBorc);
    const updatedDurum = borcVal > 0 ? "Borçlu" : "Düzenli";

    let updatedList = [...residents];

    if (modalMode === "add") {
      const newRes: Resident = {
        id: Date.now(),
        name: formName,
        blok: formBlok,
        daire: `Daire ${formDaire}`,
        borc: borcVal,
        durum: updatedDurum
      };
      updatedList.push(newRes);
      alert("Yeni sakin başarıyla eklendi!");
    } else if (modalMode === "edit" && targetId !== null) {
      updatedList = updatedList.map(r => {
        if (r.id === targetId) {
          // If editing Ahmet Yılmaz, also update resident_balance to stay in sync!
          if (r.id === 1) {
            localStorage.setItem("resident_balance", borcVal.toString());
          }
          return {
            ...r,
            name: formName,
            blok: formBlok,
            daire: `Daire ${formDaire}`,
            borc: borcVal,
            durum: updatedDurum
          };
        }
        return r;
      });
      alert("Sakin bilgileri güncellendi!");
    }

    localStorage.setItem("admin_residents", JSON.stringify(updatedList));
    setResidents(updatedList);
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Bu sakini silmek istediğinize emin misiniz?")) return;
    const filtered = residents.filter(r => r.id !== id);
    localStorage.setItem("admin_residents", JSON.stringify(filtered));
    setResidents(filtered);
  };

  // Filter & Search Logic
  const filteredResidents = residents.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.daire.toLowerCase().includes(search.toLowerCase());
    const matchBlok = selectedBlok === "Hepsi" || r.blok === selectedBlok;
    const matchStatus = selectedStatus === "Hepsi" || r.durum === selectedStatus;
    return matchSearch && matchBlok && matchStatus;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Sakinler & Borç Durumu</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Daire sakinlerinin bilgileri, aidat durumları ve tahsilat takibi.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center px-5 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-2xl shadow-lg shadow-rose-600/10 transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4.5 w-4.5 mr-2" /> Sakin Ekle
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-5 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <input 
            type="text" 
            placeholder="İsim veya daire no ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50"
          />
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400" />
        </div>

        {/* Blok Filter */}
        <div className="relative">
          <select
            value={selectedBlok}
            onChange={(e) => setSelectedBlok(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50 appearance-none"
          >
            <option value="Hepsi">🏢 Tüm Bloklar</option>
            <option value="A Blok">A Blok</option>
            <option value="B Blok">B Blok</option>
            <option value="C Blok">C Blok</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50 appearance-none"
          >
            <option value="Hepsi">🏷️ Tüm Durumlar</option>
            <option value="Düzenli">Düzenli (Borçsuz)</option>
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
                <th className="px-6 py-4">Sakin Adı</th>
                <th className="px-6 py-4">Blok & Daire</th>
                <th className="px-6 py-4 text-right">Borç Tutarı</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-400">
                    Kayıtlı sakin bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((res) => (
                  <tr key={res.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs uppercase">
                          {res.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        {res.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-semibold">
                      {res.blok} - {res.daire}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-zinc-900 dark:text-zinc-50">
                      {res.borc > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">{res.borc.toLocaleString("tr-TR")} ₺</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">Borçsuz</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        res.durum === 'Düzenli' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                      }`}>
                        {res.durum}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(res)}
                          className="p-2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {res.id !== 1 && (
                          <button 
                            onClick={() => handleDelete(res.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border border-transparent hover:border-red-100 dark:hover:border-red-900/30 cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-extrabold text-xl mb-6 text-zinc-900 dark:text-zinc-50">
              {modalMode === "add" ? "Yeni Sakin Kaydet" : "Sakin Bilgilerini Düzenle"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Sakin Adı Soyadı</label>
                <input 
                  type="text" 
                  required 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50"
                  placeholder="Örn: Mehmet Öz" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Blok</label>
                  <select 
                    value={formBlok}
                    onChange={(e) => setFormBlok(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50"
                  >
                    <option value="A Blok">A Blok</option>
                    <option value="B Blok">B Blok</option>
                    <option value="C Blok">C Blok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Daire No</label>
                  <input 
                    type="number" 
                    required 
                    value={formDaire}
                    onChange={(e) => setFormDaire(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50"
                    placeholder="Örn: 14" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Aidat Borcu (₺)</label>
                <input 
                  type="number" 
                  required 
                  value={formBorc}
                  onChange={(e) => setFormBorc(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50"
                  placeholder="0" 
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold shadow-md shadow-rose-600/10 transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
