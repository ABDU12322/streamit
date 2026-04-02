import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authToken = request.cookies.get("authToken")?.value;
    const userId = request.cookies.get("userId")?.value;
    const isAuthenticated = !!(authToken && userId);

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/upload-video", "/group", "/show-video"];

    // Check if current path is a protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // If accessing a protected route without auth, redirect to login
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If accessing login/signup while already authenticated, redirect to dashboard
    if ((pathname === "/login" || pathname === "/signup") && isAuthenticated) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api/auth (auth endpoints)
         * - api/ (other API endpoints are protected via requireAuth)
         */
        "/((?!_next/static|_next/image|favicon.ico|api/auth|api/).*)",
    ],
};
