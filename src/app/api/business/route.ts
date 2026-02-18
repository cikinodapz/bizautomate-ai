import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

const BUSINESS_ID = 'biz-001';

export async function GET() {
    try {
        const business = await prisma.business.findUnique({
            where: { id: BUSINESS_ID },
        });
        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }
        return NextResponse.json({ business });
    } catch (error) {
        console.error('Error fetching business:', error);
        return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { name, address } = await req.json();

        const business = await prisma.business.update({
            where: { id: BUSINESS_ID },
            data: {
                ...(name !== undefined && { name }),
                ...(address !== undefined && { address }),
            },
        });

        return NextResponse.json({ success: true, business });
    } catch (error) {
        console.error('Error updating business:', error);
        return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
    }
}
