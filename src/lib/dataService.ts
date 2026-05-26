// Client-side Data Service
// Performs API calls to the Next.js backend, with transparent fallback to localStorage for mobile/Capacitor static environments.

function parseApiError(payload: unknown, status: number): string {
  if (payload !== null && typeof payload === "object" && "error" in payload) {
    const e = (payload as { error?: unknown }).error;
    if (typeof e === "string" && e.trim().length > 0) return e;
  }
  return `HTTP error ${status}`;
}

// Helper to check if API is available
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errData: unknown = await res.json().catch(() => ({}));
      throw new Error(parseApiError(errData, res.status));
    }
    const body: unknown = await res.json();
    return body as T;
  } catch (error) {
    // Re-throw to let caller handle fallback if needed
    throw error;
  }
}

// Default states for localStorage fallback
const defaultAnnouncements = [
  { id: 1, title: "Havuz Bakımı Hakkında", date: "24 Mayıs 2026", content: "Açık havuzumuz 1 Haziran itibariyle kullanıma açılacaktır. Havuz kurallarına dikkat etmenizi rica ederiz.", category: "Genel", isNew: true },
  { id: 2, title: "Mayıs Ayı Ortak Gider Bildirimi", date: "20 Mayıs 2026", content: "Ortak alan elektrik faturalarındaki artış nedeniyle Haziran ayı aidatlarına %5 enflasyon farkı yansıtılmıştır.", category: "Mali", isNew: false },
  { id: 3, title: "Asansör Periyodik Bakımı", date: "15 Nisan 2026", content: "A Blok asansörleri periyodik bakım nedeniyle yarın 10:00 - 12:00 saatleri arasında geçici olarak servis dışı kalacaktır.", category: "Teknik", isNew: false }
];

const defaultResidents = [
  { id: 1, name: "Ahmet Yılmaz", daire: "Daire 14", blok: "A Blok", borc: 1250, durum: "Borçlu" },
  { id: 2, name: "Ayşe Demir", daire: "Daire 5", blok: "B Blok", borc: 0, durum: "Düzenli" },
  { id: 3, name: "Mehmet Kaya", daire: "Daire 22", blok: "A Blok", borc: 0, durum: "Düzenli" },
  { id: 4, name: "Elif Şahin", daire: "Daire 1", blok: "C Blok", borc: 2500, durum: "Borçlu" },
];

const defaultRequests = [
  { id: "REQ-1002", title: "B Blok Asansör Titremesi", category: "Arıza", description: "B blok asansörü yukarı çıkarken 3. kat civarında çok fazla titreme yapıyor.", date: "24.05.2026", status: "İşlemde" },
  { id: "REQ-1001", title: "Otopark Alanı Temizliği", category: "Temizlik", description: "-2. kat otopark alanında çok fazla toz birikmiş durumda, genel bir temizlik rica olunur.", date: "18.05.2026", status: "Çözüldü" }
];

const defaultPayments = [
  { id: "PAY-8729", period: "Nisan 2026", amount: 1250, date: "10.04.2026", status: "Başarılı", type: "Kredi Kartı" },
  { id: "PAY-8610", period: "Mart 2026", amount: 1250, date: "11.03.2026", status: "Başarılı", type: "Kredi Kartı" }
];

const defaultSettings = {
  aidat: "1250",
  managerName: "Ömür Site Yönetim A.Ş.",
  iban: "TR98 0006 2000 0000 1234 5678 90",
  bankName: "Garanti BBVA",
  phone: "+90 212 555 0000"
};

/* --- AUTHENTICATION --- */
export async function loginUser(payload: any) {
  try {
    return await request<any>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Giriş başarısız.";
    throw new Error(msg);
  }
}

/* --- RESIDENTS --- */
export async function getResidents(): Promise<any[]> {
  try {
    const list = await request<any[]>("/api/residents");
    // Cache to localStorage
    localStorage.setItem("admin_residents", JSON.stringify(list));
    return list;
  } catch {
    const stored = localStorage.getItem("admin_residents");
    if (!stored) {
      localStorage.setItem("admin_residents", JSON.stringify(defaultResidents));
      return defaultResidents;
    }
    return JSON.parse(stored);
  }
}

export async function addResident(payload: any) {
  try {
    return await request<any>("/api/residents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    const stored = localStorage.getItem("admin_residents");
    const list = stored ? JSON.parse(stored) : defaultResidents;
    const borcVal = Number(payload.borc) || 0;
    const newRes = {
      id: Date.now(),
      name: payload.name,
      blok: payload.blok,
      daire: payload.daire.startsWith("Daire") ? payload.daire : `Daire ${payload.daire}`,
      borc: borcVal,
      durum: borcVal > 0 ? "Borçlu" : "Düzenli"
    };
    list.push(newRes);
    localStorage.setItem("admin_residents", JSON.stringify(list));
    return { success: true, resident: newRes };
  }
}

export async function updateResident(payload: any) {
  try {
    return await request<any>("/api/residents", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    const stored = localStorage.getItem("admin_residents");
    let list = stored ? JSON.parse(stored) : defaultResidents;
    const borcVal = Number(payload.borc) || 0;
    list = list.map((r: any) => {
      if (r.id === payload.id) {
        if (r.id === 1) {
          localStorage.setItem("resident_balance", borcVal.toString());
        }
        return {
          ...r,
          name: payload.name || r.name,
          blok: payload.blok || r.blok,
          daire: payload.daire ? (payload.daire.startsWith("Daire") ? payload.daire : `Daire ${payload.daire}`) : r.daire,
          borc: borcVal,
          durum: borcVal > 0 ? "Borçlu" : "Düzenli"
        };
      }
      return r;
    });
    localStorage.setItem("admin_residents", JSON.stringify(list));
    return { success: true };
  }
}

export async function deleteResident(id: number) {
  try {
    return await request<any>(`/api/residents?id=${id}`, {
      method: "DELETE"
    });
  } catch {
    const stored = localStorage.getItem("admin_residents");
    let list = stored ? JSON.parse(stored) : defaultResidents;
    list = list.filter((r: any) => r.id !== id);
    localStorage.setItem("admin_residents", JSON.stringify(list));
    return { success: true };
  }
}

/* --- PAYMENTS --- */
export async function getPayments(): Promise<any[]> {
  try {
    const list = await request<any[]>("/api/payments");
    localStorage.setItem("resident_payments", JSON.stringify(list));
    return list;
  } catch {
    const stored = localStorage.getItem("resident_payments");
    if (!stored) {
      localStorage.setItem("resident_payments", JSON.stringify(defaultPayments));
      return defaultPayments;
    }
    return JSON.parse(stored);
  }
}

export async function processPayment(payload: any) {
  try {
    return await request<any>("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    // Offline payment logic
    localStorage.setItem("resident_balance", "0");
    const stored = localStorage.getItem("resident_payments");
    const list = stored ? JSON.parse(stored) : defaultPayments;
    const newPayment = {
      id: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
      period: payload.period || "Mayıs 2026",
      amount: Number(payload.amount) || 1250,
      date: new Date().toLocaleDateString("tr-TR"),
      status: "Başarılı",
      type: payload.type || "Kredi Kartı"
    };
    localStorage.setItem("resident_payments", JSON.stringify([newPayment, ...list]));
    
    // Sync local admin list if exists
    const adminStored = localStorage.getItem("admin_residents");
    if (adminStored) {
      const adminList = JSON.parse(adminStored);
      const ahmet = adminList.find((r: any) => r.id === 1);
      if (ahmet) {
        ahmet.borc = 0;
        ahmet.durum = "Düzenli";
      }
      localStorage.setItem("admin_residents", JSON.stringify(adminList));
    }
    return { success: true, payment: newPayment };
  }
}

/* --- REQUESTS --- */
export async function getRequests(): Promise<any[]> {
  try {
    const list = await request<any[]>("/api/requests");
    localStorage.setItem("site_requests", JSON.stringify(list));
    return list;
  } catch {
    const stored = localStorage.getItem("site_requests");
    if (!stored) {
      localStorage.setItem("site_requests", JSON.stringify(defaultRequests));
      return defaultRequests;
    }
    return JSON.parse(stored);
  }
}

export async function createRequest(payload: any) {
  try {
    return await request<any>("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    const stored = localStorage.getItem("site_requests");
    const list = stored ? JSON.parse(stored) : defaultRequests;
    const newReq = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      title: payload.title,
      category: payload.category || "Arıza",
      description: payload.description,
      date: new Date().toLocaleDateString("tr-TR"),
      status: "Bekliyor" as const
    };
    localStorage.setItem("site_requests", JSON.stringify([newReq, ...list]));
    return { success: true, request: newReq };
  }
}

export async function updateRequestStatus(id: string, status: string) {
  try {
    return await request<any>("/api/requests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
  } catch {
    const stored = localStorage.getItem("site_requests");
    let list = stored ? JSON.parse(stored) : defaultRequests;
    list = list.map((r: any) => {
      if (r.id === id) {
        return { ...r, status };
      }
      return r;
    });
    localStorage.setItem("site_requests", JSON.stringify(list));
    return { success: true };
  }
}

/* --- ANNOUNCEMENTS --- */
export async function getAnnouncements(): Promise<any[]> {
  try {
    const list = await request<any[]>("/api/announcements");
    localStorage.setItem("site_announcements", JSON.stringify(list));
    return list;
  } catch {
    const stored = localStorage.getItem("site_announcements");
    if (!stored) {
      localStorage.setItem("site_announcements", JSON.stringify(defaultAnnouncements));
      return defaultAnnouncements;
    }
    return JSON.parse(stored);
  }
}

export async function createAnnouncement(payload: any) {
  try {
    return await request<any>("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    const stored = localStorage.getItem("site_announcements");
    const list = stored ? JSON.parse(stored) : defaultAnnouncements;
    const newAnn = {
      id: Date.now(),
      title: payload.title,
      content: payload.content,
      category: payload.category || "Genel",
      date: new Date().toLocaleDateString("tr-TR"),
      isNew: true
    };
    localStorage.setItem("site_announcements", JSON.stringify([newAnn, ...list]));
    return { success: true, announcement: newAnn };
  }
}

export async function deleteAnnouncement(id: number) {
  try {
    return await request<any>(`/api/announcements?id=${id}`, {
      method: "DELETE"
    });
  } catch {
    const stored = localStorage.getItem("site_announcements");
    let list = stored ? JSON.parse(stored) : defaultAnnouncements;
    list = list.filter((a: any) => a.id !== id);
    localStorage.setItem("site_announcements", JSON.stringify(list));
    return { success: true };
  }
}

/* --- SETTINGS --- */
export async function getSettings(): Promise<any> {
  try {
    const config = await request<any>("/api/settings");
    localStorage.setItem("site_settings", JSON.stringify(config));
    return config;
  } catch {
    const stored = localStorage.getItem("site_settings");
    if (!stored) {
      localStorage.setItem("site_settings", JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    return JSON.parse(stored);
  }
}

export async function updateSettings(payload: any) {
  try {
    return await request<any>("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    localStorage.setItem("site_settings", JSON.stringify(payload));
    return { success: true, settings: payload };
  }
}
