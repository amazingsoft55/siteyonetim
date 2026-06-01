export function announcementToClient(row: {
  id: string;
  title: string;
  content: string;
  category: string | null;
  imageUrl?: string | null;
  images?: string | null;
  createdAt: string | null;
}) {
  const createdMs = row.createdAt ? new Date(row.createdAt).getTime() : NaN;
  const fresh =
    Number.isFinite(createdMs) && Date.now() - createdMs < 7 * 24 * 60 * 60 * 1000;

  let parsedImages: string[] = [];
  if (row.images) {
    try {
      const arr = JSON.parse(row.images);
      if (Array.isArray(arr)) parsedImages = arr.filter((s: unknown) => typeof s === "string");
    } catch { /* ignore */ }
  }

  const allImages: string[] = [];
  if (row.imageUrl) allImages.push(row.imageUrl);
  for (const img of parsedImages) {
    if (!allImages.includes(img)) allImages.push(img);
  }

  return {
    id: row.id,
    title: row.title,
    date: row.createdAt ? new Date(row.createdAt).toLocaleDateString("tr-TR") : "",
    content: row.content,
    category: row.category?.trim() || "Genel",
    imageUrl: row.imageUrl || null,
    images: allImages,
    isNew: fresh,
  };
}
