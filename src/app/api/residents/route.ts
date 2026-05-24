import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db.residents);
  } catch (err) {
    return NextResponse.json({ error: "Veriler yüklenemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await readDb();
    const { name, blok, daire, borc } = await request.json();

    if (!name || !daire || !blok) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const borcVal = Number(borc) || 0;
    const newResident = {
      id: Date.now(),
      name,
      blok,
      daire: daire.startsWith("Daire") ? daire : `Daire ${daire}`,
      borc: borcVal,
      durum: borcVal > 0 ? "Borçlu" : "Düzenli"
    };

    db.residents.push(newResident);
    await writeDb(db);

    return NextResponse.json({ success: true, resident: newResident });
  } catch (err) {
    return NextResponse.json({ error: "Kayıt işlemi başarısız." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const db = await readDb();
    const { id, name, blok, daire, borc } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Sakin ID'si gerekli." }, { status: 400 });
    }

    const residentIndex = db.residents.findIndex(r => r.id === id);
    if (residentIndex === -1) {
      return NextResponse.json({ error: "Sakin bulunamadı." }, { status: 404 });
    }

    const borcVal = Number(borc) || 0;
    db.residents[residentIndex] = {
      ...db.residents[residentIndex],
      name: name || db.residents[residentIndex].name,
      blok: blok || db.residents[residentIndex].blok,
      daire: daire ? (daire.startsWith("Daire") ? daire : `Daire ${daire}`) : db.residents[residentIndex].daire,
      borc: borcVal,
      durum: borcVal > 0 ? "Borçlu" : "Düzenli"
    };

    await writeDb(db);
    return NextResponse.json({ success: true, resident: db.residents[residentIndex] });
  } catch (err) {
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const db = await readDb();
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "ID parametresi eksik." }, { status: 400 });
    }

    // Do not allow deleting Ahmet Yılmaz (id: 1) for demo security
    if (id === 1) {
      return NextResponse.json({ error: "Bu sakin demo güvenliği için silinemez." }, { status: 403 });
    }

    db.residents = db.residents.filter(r => r.id !== id);
    await writeDb(db);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Silme işlemi başarısız." }, { status: 500 });
  }
}
