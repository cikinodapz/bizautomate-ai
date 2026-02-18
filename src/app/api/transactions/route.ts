import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const businessId = 'biz-001'; // Hardcoded for demo

        const sortParam = searchParams.get('sort') || 'date_desc';
        const [sortBy, sortOrder] = sortParam.includes('_') ? sortParam.split('_') : ['date', 'desc'];

        // Validate sort parameters
        const validSortFields = ['date', 'total'];
        const validSortOrders = ['asc', 'desc'];

        const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'date';
        const finalSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';

        const skip = (page - 1) * limit;

        const where: any = {
            businessId,
            OR: [
                { customerName: { contains: search, mode: 'insensitive' } },
            ]
        };

        // If search looks like a number, try to search by total/amount
        if (!isNaN(Number(search)) && search !== '') {
            where.OR.push({ total: { equals: Number(search) } });
        }

        // Also allow searching by product name in items
        if (search) {
            where.OR.push({
                items: {
                    some: {
                        productName: { contains: search, mode: 'insensitive' }
                    }
                }
            });
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: {
                    items: true,
                },
                orderBy: {
                    [finalSortBy]: finalSortOrder,
                },
                skip,
                take: limit,
            }),
            prisma.transaction.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: transactions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { customerName, paymentMethod, items } = await req.json();
        const businessId = 'biz-001';

        if (!items || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Minimal 1 item diperlukan' },
                { status: 400 }
            );
        }

        // Calculate total from items
        const txItems = items.map((item: { productId?: string; productName: string; quantity: number; price: number }) => ({
            productId: item.productId || null,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price,
        }));
        const total = txItems.reduce((sum: number, i: { subtotal: number }) => sum + i.subtotal, 0);

        // Create transaction and decrement stock in a single Prisma transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the transaction with items
            const transaction = await tx.transaction.create({
                data: {
                    businessId,
                    date: new Date(),
                    customerName: customerName || 'Umum',
                    total,
                    items: { create: txItems },
                },
                include: { items: true },
            });

            // Decrement stock for products that have a productId
            for (const item of txItems) {
                if (item.productId) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }
            }

            return transaction;
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create transaction' },
            { status: 500 }
        );
    }
}
