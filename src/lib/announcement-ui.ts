export function announcementToClient(row: {
  id: string;
  title: string;
  content: string;
  category: string | null;
  createdAt: string | null;
}) {
  const createdMs = row.createdAt ? new Date(row.createdAt).getTime() : NaN;
  const fresh =
    Number.isFinite(createdMs) && Date.now() - createdMs < 7 * 24 * 60 * 60 * 1000;
  return {
    id: row.id,
    title: row.title,
    date: row.createdAt ? new Date(row.createdAt).toLocaleDateString("tr-TR") : "",
    content: row.content,
    category: row.category?.trim() || "Genel",
    isNew: fresh,
  };
}
