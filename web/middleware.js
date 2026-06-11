import { NextResponse } from "next/server";

export function middleware(request) {
    const token = request.cookies.get('token');
    const { pathname } = request.nextUrl;

    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!isAuthPage && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
};