import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
    try {
        const businessId = 'biz-001';
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        // Fetch all business data
        const [business, products, weekTx, monthTx, receipts] = await Promise.all([
            prisma.business.findUnique({ where: { id: businessId } }),
            prisma.product.findMany({ where: { businessId } }),
            prisma.transaction.findMany({
                where: { businessId, date: { gte: sevenDaysAgo } },
                include: { items: true },
            }),
            prisma.transaction.findMany({
                where: { businessId, date: { gte: thirtyDaysAgo } },
                include: { items: true },
            }),
            prisma.scannedReceipt.findMany({
                where: { businessId },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
        ]);

        const weekRevenue = weekTx.reduce((sum, tx) => sum + tx.total, 0);
        const monthRevenue = monthTx.reduce((sum, tx) => sum + tx.total, 0);

        // Product sales
        const productSales: Record<string, { count: number; revenue: number }> = {};
        monthTx.forEach((tx) => {
            tx.items.forEach((item) => {
                if (!productSales[item.productName]) {
                    productSales[item.productName] = { count: 0, revenue: 0 };
                }
                productSales[item.productName].count += item.quantity;
                productSales[item.productName].revenue += item.subtotal;
            });
        });

        const topProducts = Object.entries(productSales)
            .sort(([, a], [, b]) => b.revenue - a.revenue)
            .slice(0, 5)
            .map(([name, data]) => `${name}: ${data.count} terjual, Rp${data.revenue.toLocaleString('id-ID')}`);

        // Low stock products
        const lowStock = products
            .filter((p) => p.stock < 10)
            .map((p) => `${p.name} (stok: ${p.stock})`);

        const expenseTotal = receipts.reduce((sum, r) => sum + (r.total || 0), 0);

        const prompt = `Kamu adalah AI business analyst untuk "${business?.name || 'Bisnis'}".
Berdasarkan data berikut, berikan TEPAT 3 insight singkat dan actionable.

DATA:
- Revenue minggu ini: Rp${weekRevenue.toLocaleString('id-ID')} (${weekTx.length} transaksi)
- Revenue bulan ini: Rp${monthRevenue.toLocaleString('id-ID')} (${monthTx.length} transaksi)
- Rata-rata transaksi: Rp${monthTx.length > 0 ? Math.round(monthRevenue / monthTx.length).toLocaleString('id-ID') : 0}
- Total produk: ${products.length}
- Produk stok rendah: ${lowStock.length > 0 ? lowStock.join(', ') : 'Tidak ada'}
- Top 5 produk: ${topProducts.join('; ')}
- Total pengeluaran (scan struk): Rp${expenseTotal.toLocaleString('id-ID')}

FORMAT RESPONS (JSON array, HANYA JSON tanpa markdown):
[
  {"type": "success|warning|info", "title": "Judul singkat", "message": "Penjelasan 1-2 kalimat actionable"},
  {"type": "success|warning|info", "title": "Judul singkat", "message": "Penjelasan 1-2 kalimat actionable"},
  {"type": "success|warning|info", "title": "Judul singkat", "message": "Penjelasan 1-2 kalimat actionable"}
]

ATURAN:
- type "success" = performa bagus, "warning" = perlu perhatian, "info" = saran/tips
- Gunakan Bahasa Indonesia
- Jawab HANYA dengan JSON array, tanpa backtick atau penjelasan tambahan`;

        const result = await generateText({
            model: google('gemini-2.5-flash-lite'),
            prompt,
        });

        // Parse JSON from response
        let insights;
        try {
            const text = result.text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
            insights = JSON.parse(text);
        } catch {
            insights = [
                { type: 'info', title: 'AI Sedang Memproses', message: 'Insight akan tersedia dalam beberapa saat. Coba refresh kembali.' },
            ];
        }

        return NextResponse.json({ insights });
    } catch (error) {
        console.error('AI Insights error:', error);
        return NextResponse.json({
            insights: [
                { type: 'info', title: 'Insight Tidak Tersedia', message: 'Gagal memuat AI insights. Pastikan API key sudah dikonfigurasi.' },
            ],
        });
    }
}
