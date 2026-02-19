import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, createToken, getTokenCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { name, email, password, businessName } = await req.json();

        if (!name || !email || !password || !businessName) {
            return NextResponse.json(
                { error: "Semua field harus diisi." },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password minimal 6 karakter." },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { error: "Email sudah terdaftar." },
                { status: 409 }
            );
        }

        // Create business first
        const business = await prisma.business.create({
            data: { name: businessName },
        });

        // Create user with hashed password
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                businessId: business.id,
            },
        });

        // Create JWT token
        const token = await createToken(user.id, business.id);
        const cookieOptions = getTokenCookieOptions(token);

        const response = NextResponse.json(
            {
                user: { id: user.id, name: user.name, email: user.email },
                business: { id: business.id, name: business.name },
            },
            { status: 201 }
        );

        response.cookies.set(cookieOptions);
        return response;
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan saat registrasi.", detail: String(error) },
            { status: 500 }
        );
    }
}
