import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db.announcements);
  } catch (err) {
    return NextResponse.json({ error: "Duyurular yüklenemedi." }, { status: 500 });
  }
}

type AnnouncementPostBody = {
  title?: unknown;
  content?: unknown;
  category?: unknown;
};

export async function POST(request: Request) {
  try {
    const db = await readDb();
    const raw = (await request.json()) as AnnouncementPostBody;
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    const content = typeof raw.content === "string" ? raw.content.trim() : "";
    const categoryRaw = raw.category;

    if (!title || !content) {
      return NextResponse.json({ error: "Başlık ve içerik alanları gereklidir." }, { status: 400 });
    }

    const category =
      typeof categoryRaw === "string" && categoryRaw.trim().length > 0
        ? categoryRaw.trim()
        : "Genel";

    const newAnnouncement = {
      id: Date.now(),
      title,
      content,
      category,
      date: new Date().toLocaleDateString("tr-TR"),
      isNew: true
    };

    db.announcements = [newAnnouncement, ...db.announcements];
    await writeDb(db);

    return NextResponse.json({ success: true, announcement: newAnnouncement });
  } catch (err) {
    return NextResponse.json({ error: "Duyuru yayınlanamadı." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const db = await readDb();
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "Duyuru ID'si gereklidir." }, { status: 400 });
    }

    db.announcements = db.announcements.filter(a => a.id !== id);
    await writeDb(db);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Duyuru silinemedi." }, { status: 500 });
  }
}
