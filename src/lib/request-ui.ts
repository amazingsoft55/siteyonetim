/** Talep kayıtlarını sakla (D1 ENUM) ile arayüz (Türkçe) arasında köprü */

export type ClientRequestItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  status: "Bekliyor" | "İşlemde" | "Çözüldü";
};

export function dbRequestToClient(row: {
  id: string;
  subject: string;
  description: string;
  category: string | null;
  status: string;
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
      : "Bekliyor",
  };
}

export function uiStatusToDb(s: string): "OPEN" | "IN_PROGRESS" | "RESOLVED" {
  if (s === "İşlemde") return "IN_PROGRESS";
  if (s === "Çözüldü") return "RESOLVED";
  return "OPEN";
}
