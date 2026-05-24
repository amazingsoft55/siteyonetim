import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-siteyonetim-key-2024"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Korumalı yolların kontrolü
  const isSuperAdminRoute = path.startsWith('/super-admin');
  const isAdminRoute = path.startsWith('/admin');
  const isUserRoute = path.startsWith('/dashboard');

  if (isSuperAdminRoute || isAdminRoute || isUserRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;

      if (isSuperAdminRoute && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (isAdminRoute && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        // Super admin admin paneline de girebilir
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (isUserRoute && role !== 'USER' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/super-admin/:path*', '/admin/:path*', '/dashboard/:path*'],
};
