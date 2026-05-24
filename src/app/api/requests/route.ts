import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db.requests);
  } catch (err) {
    return NextResponse.json({ error: "Talepler yüklenemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await readDb();
    const { title, category, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const newRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      category: category || "Arıza",
      description,
      date: new Date().toLocaleDateString("tr-TR"),
      status: "Bekliyor" as const
    };

    db.requests = [newRequest, ...db.requests];
    await writeDb(db);

    return NextResponse.json({ success: true, request: newRequest });
  } catch (err) {
    return NextResponse.json({ error: "Talep eklenemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const db = await readDb();
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID ve durum alanları gereklidir." }, { status: 400 });
    }

    const requestIndex = db.requests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    db.requests[requestIndex].status = status;
    await writeDb(db);

    return NextResponse.json({ success: true, request: db.requests[requestIndex] });
  } catch (err) {
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}
