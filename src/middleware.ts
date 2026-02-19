import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "veltrixai-secret-key-change-in-production"
);

const COOKIE_NAME = "veltrix_token";

// Routes that don't require authentication
const publicPaths = [
    "/",
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/logout",
    "/api/seed",
];

function isPublicPath(pathname: string) {
    return publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (isPublicPath(pathname)) {
        // If user is on login/register and already authenticated, redirect to dashboard
        if (pathname === "/login" || pathname === "/register") {
            const token = request.cookies.get(COOKIE_NAME)?.value;
            if (token) {
                try {
                    await jwtVerify(token, JWT_SECRET);
                    return NextResponse.redirect(new URL("/dashboard", request.url));
                } catch {
                    // Invalid token, continue to login/register
                }
            }
        }
        return NextResponse.next();
    }

    // Protected paths: check for valid token
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
        // API routes return 401, pages redirect to login
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);

        // Inject businessId into request headers for API routes
        const response = NextResponse.next();
        response.headers.set("x-business-id", payload.businessId as string);
        response.headers.set("x-user-id", payload.userId as string);
        return response;
    } catch {
        // Invalid token
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/:path*",
        "/login",
        "/register",
    ],
};
