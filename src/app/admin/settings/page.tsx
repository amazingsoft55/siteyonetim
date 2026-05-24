"use client";

import * as React from "react";
import { Settings, Save, ShieldAlert, CreditCard, Building } from "lucide-react";

export default function AdminSettingsPage() {
  const [aidat, setAidat] = React.useState("1250");
  const [managerName, setManagerName] = React.useState("Ömür Site Yönetim A.Ş.");
  const [iban, setIban] = React.useState("TR98 0006 2000 0000 1234 5678 90");
  const [bankName, setBankName] = React.useState("Garanti BBVA");
  const [phone, setPhone] = React.useState("+90 212 555 0000");

  React.useEffect(() => {
    const stored = localStorage.getItem("site_settings");
    if (stored) {
      const parsed = JSON.parse(stored);
      setAidat(parsed.aidat || "1250");
      setManagerName(parsed.managerName || "Ömür Site Yönetim A.Ş.");
      setIban(parsed.iban || "TR98 0006 2000 0000 1234 5678 90");
      setBankName(parsed.bankName || "Garanti BBVA");
      setPhone(parsed.phone || "+90 212 555 0000");
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = {
      aidat,
      managerName,
      iban,
      bankName,
      phone
    };
    localStorage.setItem("site_settings", JSON.stringify(settings));
    alert("Site ayarları başarıyla kaydedildi!");
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-3xl mx-auto pb-16">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Site Ayarları</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Uygulamanın genel aidat tarifesi, banka hesap bilgileri ve yönetici iletişim ayarları.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Settings Info Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 p-5 rounded-3xl border border-rose-100 dark:border-rose-900/30">
            <h4 className="font-bold flex items-center gap-1.5 text-sm uppercase tracking-wider mb-2">
              <ShieldAlert className="h-4.5 w-4.5" /> Önemli Not
            </h4>
            <p className="text-xs leading-relaxed opacity-90">
              Burada değiştireceğiniz aidat miktarı, yeni borçlandırmalarda varsayılan değer olarak alınacaktır.
            </p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-5 rounded-3xl shadow-sm text-center">
            <Building className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Aktif Konut Sayısı</h5>
            <p className="text-2xl font-black text-rose-600 mt-1">50 Daire</p>
          </div>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-5">
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Yönetim / Şirket Ünvanı</label>
              <input 
                type="text" 
                required 
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Aylık Aidat (₺)</label>
                <input 
                  type="number" 
                  required 
                  value={aidat}
                  onChange={(e) => setAidat(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50 font-bold text-rose-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Yönetim İletişim Tel</label>
                <input 
                  type="text" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50 font-semibold"
                />
              </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-5 space-y-4">
              <h4 className="font-bold text-md text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-rose-600" /> Havale/EFT Banka Bilgileri
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Banka Adı</label>
                  <input 
                    type="text" 
                    required 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">IBAN Numarası</label>
                  <input 
                    type="text" 
                    required 
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold shadow-md shadow-rose-600/10 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
              >
                <Save className="h-4.5 w-4.5" /> Ayarları Kaydet
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
