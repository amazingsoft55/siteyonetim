import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isIyzicoConfigured } from "@/lib/iyzico";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  return NextResponse.json({
    configured: isIyzicoConfigured(),
    mode: isIyzicoConfigured() ? "live" : "test",
  });
}
