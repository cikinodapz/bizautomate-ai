import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/chat/history — list all chat sessions
export async function GET() {
    try {
        const businessId = 'biz-001';
        const sessions = await prisma.chatSession.findMany({
            where: { businessId },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: { select: { messages: true } },
            },
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error('Chat history error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// POST /api/chat/history — create new chat session
export async function POST() {
    try {
        const businessId = 'biz-001';
        const session = await prisma.chatSession.create({
            data: {
                businessId,
                title: 'Percakapan Baru',
            },
        });

        return NextResponse.json({ session });
    } catch (error) {
        console.error('Create session error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// DELETE /api/chat/history?id=xxx — delete a chat session
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        await prisma.chatSession.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete session error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
