import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.VAPID_PUBLIC_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      { error: "Push notification yapılandırılmamış." },
      { status: 503 },
    );
  }
  return NextResponse.json({ publicKey: key });
}
