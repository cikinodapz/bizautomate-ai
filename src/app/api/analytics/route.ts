import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const businessId = session.businessId;
        const now = new Date();

        // Current period (last 7 days)
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        // Previous period (7-14 days ago)
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(now.getDate() - 14);

        // Current period stats
        const currentTransactions = await prisma.transaction.findMany({
            where: {
                businessId,
                date: { gte: sevenDaysAgo },
            },
            include: { items: true },
        });

        // Previous period stats
        const prevTransactions = await prisma.transaction.findMany({
            where: {
                businessId,
                date: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
            },
        });

        const currentRevenue = currentTransactions.reduce((sum, tx) => sum + tx.total, 0);
        const prevRevenue = prevTransactions.reduce((sum, tx) => sum + tx.total, 0);
        const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

        const currentOrders = currentTransactions.length;
        const prevOrders = prevTransactions.length;
        const ordersChange = prevOrders > 0 ? ((currentOrders - prevOrders) / prevOrders) * 100 : 0;

        const avgOrderValue = currentOrders > 0 ? currentRevenue / currentOrders : 0;
        const prevAvg = prevOrders > 0 ? prevRevenue / prevOrders : 0;
        const avgChange = prevAvg > 0 ? ((avgOrderValue - prevAvg) / prevAvg) * 100 : 0;

        // Product sales count
        const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
        currentTransactions.forEach((tx) => {
            tx.items.forEach((item) => {
                if (!productSales[item.productName]) {
                    productSales[item.productName] = { name: item.productName, count: 0, revenue: 0 };
                }
                productSales[item.productName].count += item.quantity;
                productSales[item.productName].revenue += item.subtotal;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Daily revenue for chart (last 7 days)
        const dailyRevenue: { date: string; revenue: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dayStr = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
            const dayRevenue = currentTransactions
                .filter((tx) => {
                    const txDate = new Date(tx.date);
                    return txDate.toDateString() === d.toDateString();
                })
                .reduce((sum, tx) => sum + tx.total, 0);
            dailyRevenue.push({ date: dayStr, revenue: dayRevenue });
        }

        // Recent transactions
        const recentTx = await prisma.transaction.findMany({
            where: { businessId },
            orderBy: { date: 'desc' },
            take: 5,
            include: { items: true },
        });

        const totalProducts = await prisma.product.count({ where: { businessId } });

        return NextResponse.json({
            stats: {
                revenue: currentRevenue,
                revenueChange: Math.round(revenueChange * 10) / 10,
                orders: currentOrders,
                ordersChange: Math.round(ordersChange * 10) / 10,
                totalProducts,
                avgOrderValue: Math.round(avgOrderValue),
                avgChange: Math.round(avgChange * 10) / 10,
            },
            dailyRevenue,
            topProducts,
            recentTransactions: recentTx.map((tx) => ({
                id: tx.id,
                customerName: tx.customerName || 'Walk-in',
                date: tx.date,
                total: tx.total,
                itemCount: tx.items.length,
            })),
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
