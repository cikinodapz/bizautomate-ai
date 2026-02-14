import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

const BUSINESS_ID = 'biz-001';

export async function GET() {
    const products = await prisma.product.findMany({
        where: { businessId: BUSINESS_ID },
        orderBy: { name: 'asc' },
    });
    return NextResponse.json({ products });
}

export async function POST(req: Request) {
    const { name, category, price, stock } = await req.json();
    const product = await prisma.product.create({
        data: { businessId: BUSINESS_ID, name, category, price, stock },
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
