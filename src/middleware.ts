import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-siteyonetim-key-2024",
);

function redirectByRole(role: string, req: NextRequest) {
  if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/super-admin", req.url));
  if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

function isPublicApiPath(path: string): boolean {
  if (path === "/api/auth/login") return true;
  if (path === "/api/auth/logout") return true;
  if (path === "/api/auth/complete-password") return true;
  if (path === "/api/auth/forgot-password") return true;
  if (path === "/api/auth/reset-password") return true;
  if (path === "/api/setup/status") return true;
  if (path === "/api/seed") return true;
  if (path === "/api/telemetry/pageview") return true;
  if (path === "/api/public/contact") return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  /* ---- API: geçici şifre bekleyen kullanıcıyı işlemeye zorlamadan önce engelle ---- */
  if (path.startsWith("/api/")) {
    if (isPublicApiPath(path) || path === "/api/auth/complete-password") {
      return NextResponse.next();
    }
    if (!token) return NextResponse.next();

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (payload.mcp === true) {
        return NextResponse.json(
          {
            error: "Önce kalıcı şifrenizi tanımlayın.",
            code: "MUST_CHANGE_PASSWORD",
            redirect: "/sifre-belirle",
          },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  /* ---- /sifre-belirle: oturum + yalnızca mcp iken mantıklı ---- */
  if (path.startsWith("/sifre-belirle")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;
      if (payload.mcp !== true) {
        return redirectByRole(role, request);
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const isSuperAdminRoute = path.startsWith("/super-admin");
  const isAdminRoute = path.startsWith("/admin");
  const isUserRoute = path.startsWith("/dashboard");

  if (!(isSuperAdminRoute || isAdminRoute || isUserRoute)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const role = payload.role as string;

    /* Geçici şifre: önce doğrulama sayfasına */
    if (payload.mcp === true) {
      return NextResponse.redirect(new URL("/sifre-belirle", request.url));
    }

    if (isSuperAdminRoute && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAdminRoute && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (isUserRoute && role !== "USER" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/sifre-belirle",
    "/sifre-belirle/:path*",
    "/api/:path*",
  ],
};
