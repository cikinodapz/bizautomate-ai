import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPassword, createToken, getTokenCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email dan password harus diisi." },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { business: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Email atau password salah." },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: "Email atau password salah." },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = await createToken(user.id, user.businessId);
        const cookieOptions = getTokenCookieOptions(token);

        const response = NextResponse.json({
            user: { id: user.id, name: user.name, email: user.email },
            business: { id: user.business.id, name: user.business.name },
        });

        response.cookies.set(cookieOptions);
        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan saat login." },
            { status: 500 }
        );
    }
}
