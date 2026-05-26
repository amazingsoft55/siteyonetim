import { cookies } from "next/headers";
import { verifyJwt } from "./auth";

export type SessionPayload = {
  id: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  siteId?: string | null;
  name?: string;
  apartmentNo?: string | null;
};

/** HttpOnly JWT cookie → oturum (API route handlers). */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const c = await cookies();
    const t = c.get("token")?.value;
    if (!t) return null;
    const p = await verifyJwt(t);
    if (
      !p ||
      typeof p.id !== "string" ||
      typeof p.role !== "string" ||
      !["SUPER_ADMIN", "ADMIN", "USER"].includes(p.role as string)
    ) {
      return null;
    }
    return {
      id: p.id as string,
      role: p.role as SessionPayload["role"],
      siteId: typeof p.siteId === "string" ? p.siteId : p.siteId === null ? null : undefined,
      name: typeof p.name === "string" ? p.name : undefined,
      apartmentNo:
        typeof p.apartmentNo === "string" ? p.apartmentNo : p.apartmentNo === null ? null : undefined,
    };
  } catch {
    /* cookies()/JWT doğrulaması nadiren istisna fırlatabilir; route’un 500’e düşmesini engelle */
    return null;
  }
}
