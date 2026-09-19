import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const payload = await verifyJwt(token);
    if (!payload || typeof payload !== "object" || !payload.id || !payload.role) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.id as string,
        role: payload.role as string,
        name: (payload.name as string) || "",
        siteId: (payload.siteId as string) || null,
        apartmentNo: (payload.apartmentNo as string) || null,
        mustChangePassword: payload.mcp === true,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
