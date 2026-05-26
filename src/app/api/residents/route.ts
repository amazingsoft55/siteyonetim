import { NextResponse } from "next/server";

export const runtime = "edge";

/** Geriye uyum: kullanıcılar artık /api/admin/residents adresini kullanmalı. */
export function GET() {
  return NextResponse.json(
    {
      error:
        "/api/residents kullanımdan kaldırıldı. Yönetici paneli GET /api/admin/residents adresine geçildi.",
      code: "ENDPOINT_DEPRECATED",
      replacementUrl: "/api/admin/residents",
    },
    { status: 410 },
  );
}
