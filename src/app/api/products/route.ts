import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const products = await prisma.product.findMany({
        where: { businessId: session.businessId },
        orderBy: { name: 'asc' },
    });
    return NextResponse.json({ products });
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { name, category, price, stock } = await req.json();
    const product = await prisma.product.create({
        data: { businessId: session.businessId, name, category, price, stock },
    });
    return NextResponse.json({ product });
}

export async function PUT(req: Request) {
    const { id, name, category, price, stock } = await req.json();
    const product = await prisma.product.update({
        where: { id },
        data: { name, category, price, stock },
    });
    return NextResponse.json({ product });
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'No id' }, { status: 400 });
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
