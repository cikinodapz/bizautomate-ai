import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const businessId = 'biz-001';
        const period = searchParams.get('period') || '30';
        const daysBack = parseInt(period);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        const transactions = await prisma.transaction.findMany({
            where: {
                businessId,
                date: { gte: startDate },
            },
            include: { items: true },
            orderBy: { date: 'asc' },
        });

        // Daily trend
        const dailyMap: Record<string, number> = {};
        for (let i = daysBack - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dailyMap[key] = 0;
        }
        transactions.forEach((tx) => {
            const key = new Date(tx.date).toISOString().split('T')[0];
            if (dailyMap[key] !== undefined) dailyMap[key] += tx.total;
        });
        const salesTrend = Object.entries(dailyMap).map(([date, revenue]) => ({
            date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            revenue,
        }));

        // Product stats
        const productStats: Record<string, { name: string; count: number; revenue: number }> = {};
        transactions.forEach((tx) => {
            tx.items.forEach((item) => {
                if (!productStats[item.productName]) {
                    productStats[item.productName] = { name: item.productName, count: 0, revenue: 0 };
                }
                productStats[item.productName].count += item.quantity;
                productStats[item.productName].revenue += item.subtotal;
            });
        });
        const topProducts = Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        // Category breakdown
        const categoryMap: Record<string, number> = {};
        const products = await prisma.product.findMany({ where: { businessId } });
        const productCategoryMap: Record<string, string> = {};
        products.forEach((p) => {
            productCategoryMap[p.name] = p.category;
        });
        transactions.forEach((tx) => {
            tx.items.forEach((item) => {
                const cat = productCategoryMap[item.productName] || 'Lainnya';
                categoryMap[cat] = (categoryMap[cat] || 0) + item.subtotal;
            });
        });
        const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

        // Total stats
        const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
        const totalOrders = transactions.length;

        return NextResponse.json({
            salesTrend,
            topProducts,
            categoryBreakdown,
            totalRevenue,
            totalOrders,
            avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        });
    } catch (error) {
        console.error('Analytics detail error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
