import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db.requests);
  } catch (err) {
    return NextResponse.json({ error: "Talepler yüklenemedi." }, { status: 500 });
  }
}

type RequestPostBody = {
  title?: unknown;
  category?: unknown;
  description?: unknown;
};

export async function POST(request: Request) {
  try {
    const db = await readDb();
    const raw = (await request.json()) as RequestPostBody;
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    const description = typeof raw.description === "string" ? raw.description.trim() : "";
    const categoryRaw = raw.category;

    if (!title || !description) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const category =
      typeof categoryRaw === "string" && categoryRaw.trim().length > 0 ? categoryRaw.trim() : "Arıza";

    const newRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      category,
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

const REQUEST_STATUSES = ["Bekliyor", "İşlemde", "Çözüldü"] as const;

type RequestPutBody = {
  id?: unknown;
  status?: unknown;
};

export async function PUT(request: Request) {
  try {
    const db = await readDb();
    const raw = (await request.json()) as RequestPutBody;
    const id = typeof raw.id === "string" ? raw.id.trim() : "";

    const status =
      typeof raw.status === "string" && REQUEST_STATUSES.includes(raw.status as (typeof REQUEST_STATUSES)[number])
        ? (raw.status as (typeof REQUEST_STATUSES)[number])
        : null;

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
