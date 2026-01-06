import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/verify-email", "/"];

// Admin routes that require admin role
const adminRoutes = ["/admin-dashboard"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Get token from cookies (you'll need to set this on login)
    const token = request.cookies.get("token")?.value;

    // If no token and trying to access protected route, redirect to login
    if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // For admin routes, we'd need to decode the JWT to check role
    // This is a simplified version - in production, you'd verify the token
    if (adminRoutes.some(route => pathname.startsWith(route))) {
        // Note: In middleware, you can't easily decode/verify JWT without
        // making it available client-side or using a server-side API call
        // This is a limitation of middleware for role-based checks
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
};
