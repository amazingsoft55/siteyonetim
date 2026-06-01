/** Talep kayıtları: veritabanı durum sabitleri ile arayüz (Türkçe) arasında köprü */

export type ClientRequestItem = {
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
};

export function dbRequestToClient(row: {
  id: string;
  subject: string;
  description: string;
  category: string | null;
  status: string;
  resolutionNote?: string | null;
  resolutionImageUrl?: string | null;
  rejectedNote?: string | null;
  rejectedImageUrl?: string | null;
  createdAt: string | null;
}): ClientRequestItem {
  return {
    id: row.id,
    title: row.subject,
    category: row.category?.trim() || "Genel",
    description: row.description,
    date: row.createdAt
      ? new Date(row.createdAt).toLocaleDateString("tr-TR")
      : new Date().toLocaleDateString("tr-TR"),
    status:
      row.status === "IN_PROGRESS" ? "İşlemde"
      : row.status === "RESOLVED" ? "Çözüldü"
      : row.status === "REJECTED" ? "Reddedildi"
      : "Bekliyor",
    resolutionNote: row.resolutionNote ?? null,
    resolutionImageUrl: row.resolutionImageUrl ?? null,
    rejectedNote: row.rejectedNote ?? null,
    rejectedImageUrl: row.rejectedImageUrl ?? null,
  };
}

export function uiStatusToDb(s: string): "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED" {
  if (s === "İşlemde") return "IN_PROGRESS";
  if (s === "Çözüldü") return "RESOLVED";
  if (s === "Reddedildi") return "REJECTED";
  return "OPEN";
}
