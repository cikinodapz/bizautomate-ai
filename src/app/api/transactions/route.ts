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
