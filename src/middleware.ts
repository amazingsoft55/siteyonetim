import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecretKey() {
  const jwtSecretEnv = process.env.JWT_SECRET;
  if (!jwtSecretEnv && process.env.NODE_ENV === "production") {
    throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing!");
  }
  return new TextEncoder().encode(
    jwtSecretEnv || "dev-only-fallback-insecure-key-never-use-in-prod"
  );
}

function isPublicApiPath(path: string): boolean {
  const publicPaths = [
    "/api/auth/login",
    "/api/auth/logout",
    "/api/auth/complete-password",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/setup/status",
    "/api/seed",
    "/api/telemetry/pageview",
    "/api/public/contact"
  ];
  return publicPaths.includes(path);
}

function redirectByRole(role: string, req: NextRequest) {
  if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/super-admin", req.url));
  if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  // ---- 1. API Route Access Strategy ----
  if (path.startsWith("/api/")) {
    if (isPublicApiPath(path)) {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.json(
        { error: "Bu istek için kimlik doğrulaması yetersizdir.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      const role = payload.role as string;

      if (payload.mcp === true && path !== "/api/auth/complete-password") {
        return NextResponse.json(
          {
            error: "Kalıcı şifrenizi belirlemeden diğer işlemleri gerçekleştiremezsiniz.",
            code: "MUST_CHANGE_PASSWORD",
            redirect: "/sifre-belirle",
          },
          { status: 403 }
        );
      }

      // Explicit RBAC Check mapping
      if (path.startsWith("/api/super-admin/") && role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Bu alana erişmek için yetkiniz bulunmamaktadır.", code: "FORBIDDEN" },
          { status: 403 }
        );
      }

      if (path.startsWith("/api/admin/") && role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Bu alana erişmek için yetkiniz bulunmamaktadır.", code: "FORBIDDEN" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş oturum anahtarı.", code: "INVALID_TOKEN" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // ---- 2. Page Transitions & SSR Guards ----
  if (path.startsWith("/sifre-belirle")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      if (payload.mcp !== true) {
        return redirectByRole(payload.role as string, request);
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
    const { payload } = await jwtVerify(token, getSecretKey());
    const role = payload.role as string;

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
