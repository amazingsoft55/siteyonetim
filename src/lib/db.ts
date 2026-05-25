/** Edge uyumlu: fs yok; Workers’ta istekler arası kalıcılık D1 ile olur. Bu katman demo JSON verisini bellekte tutar. */

interface Resident {
  id: number;
  name: string;
  daire: string;
  blok: string;
  borc: number;
  durum: string;
}

interface Payment {
  id: string;
  period: string;
  amount: number;
  date: string;
  status: string;
  type: string;
}

interface RequestItem {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  status: "Bekliyor" | "İşlemde" | "Çözüldü";
}

interface Announcement {
  id: number;
  title: string;
  date: string;
  content: string;
  category?: string;
  isNew?: boolean;
}

interface SiteSettings {
  aidat: string;
  managerName: string;
  iban: string;
  bankName: string;
  phone: string;
}

interface DatabaseSchema {
  residents: Resident[];
  payments: Payment[];
  requests: RequestItem[];
  announcements: Announcement[];
  settings: SiteSettings;
}

const initialData: DatabaseSchema = {
  residents: [
    { id: 1, name: "Ahmet Yılmaz", daire: "Daire 14", blok: "A Blok", borc: 1250, durum: "Borçlu" },
    { id: 2, name: "Ayşe Demir", daire: "Daire 5", blok: "B Blok", borc: 0, durum: "Düzenli" },
    { id: 3, name: "Mehmet Kaya", daire: "Daire 22", blok: "A Blok", borc: 0, durum: "Düzenli" },
    { id: 4, name: "Elif Şahin", daire: "Daire 1", blok: "C Blok", borc: 2500, durum: "Borçlu" },
  ],
  payments: [
    { id: "PAY-8729", period: "Nisan 2026", amount: 1250, date: "10.04.2026", status: "Başarılı", type: "Kredi Kartı" },
    { id: "PAY-8610", period: "Mart 2026", amount: 1250, date: "11.03.2026", status: "Başarılı", type: "Kredi Kartı" },
    { id: "PAY-8501", period: "Şubat 2026", amount: 1250, date: "15.02.2026", status: "Başarılı", type: "Havale/EFT" },
  ],
  requests: [
    {
      id: "REQ-1002",
      title: "B Blok Asansör Titremesi",
      category: "Arıza",
      description: "B blok asansörü yukarı çıkarken 3. kat civarında çok fazla titreme yapıyor.",
      date: "24.05.2026",
      status: "İşlemde",
    },
    {
      id: "REQ-1001",
      title: "Otopark Alanı Temizliği",
      category: "Temizlik",
      description: "-2. kat otopark alanında çok fazla toz birikmiş durumda, genel bir temizlik rica olunur.",
      date: "18.05.2026",
      status: "Çözüldü",
    },
  ],
  announcements: [
    {
      id: 1,
      title: "Havuz Bakımı Hakkında",
      date: "24 Mayıs 2026",
      content:
        "Açık havuzumuz 1 Haziran itibariyle kullanıma açılacaktır. Havuz kurallarına dikkat etmenizi rica ederiz.",
      category: "Genel",
      isNew: true,
    },
    {
      id: 2,
      title: "Mayıs Ayı Ortak Gider Bildirimi",
      date: "20 Mayıs 2026",
      content:
        "Ortak alan elektrik faturalarındaki artış nedeniyle Haziran ayı aidatlarına %5 enflasyon farkı yansıtılmıştır.",
      category: "Mali",
      isNew: false,
    },
    {
      id: 3,
      title: "Asansör Periyodik Bakımı",
      date: "15 Nisan 2026",
      content:
        "A Blok asansörleri periyodik bakım nedeniyle yarın 10:00 - 12:00 saatleri arasında geçici olarak servis dışı kalacaktır.",
      category: "Teknik",
      isNew: false,
    },
  ],
  settings: {
    aidat: "1250",
    managerName: "Ömür Site Yönetim A.Ş.",
    iban: "TR98 0006 2000 0000 1234 5678 90",
    bankName: "Garanti BBVA",
    phone: "+90 212 555 0000",
  },
};

let memoryDb: DatabaseSchema | null = null;

function getStore(): DatabaseSchema {
  if (!memoryDb) {
    memoryDb = JSON.parse(JSON.stringify(initialData)) as DatabaseSchema;
  }
  return memoryDb;
}

export async function readDb(): Promise<DatabaseSchema> {
  return getStore();
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  memoryDb = data;
}
