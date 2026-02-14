import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { type } = await req.json();
        const businessId = 'biz-001';

        const [business, products, transactions] = await Promise.all([
            prisma.business.findUnique({ where: { id: businessId } }),
            prisma.product.findMany({ where: { businessId } }),
            prisma.transaction.findMany({
                where: { businessId },
                include: { items: true },
                orderBy: { date: 'desc' },
                take: 50,
            }),
        ]);

        const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
        const productSales: Record<string, { count: number; revenue: number }> = {};
        transactions.forEach((tx) => {
            tx.items.forEach((item) => {
                if (!productSales[item.productName]) {
                    productSales[item.productName] = { count: 0, revenue: 0 };
                }
                productSales[item.productName].count += item.quantity;
                productSales[item.productName].revenue += item.subtotal;
            });
        });

        let prompt = '';

        if (type === 'invoice') {
            const lastTx = transactions[0];
            prompt = `Buatkan INVOICE/FAKTUR PENJUALAN dalam bahasa Indonesia untuk:
Bisnis: ${business?.name} (${business?.address})
Transaksi terakhir:
- Tanggal: ${lastTx?.date ? new Date(lastTx.date).toLocaleDateString('id-ID') : '-'}
- Customer: ${lastTx?.customerName || 'Walk-in'}
- Items: ${lastTx?.items.map((i) => `${i.productName} x${i.quantity} @Rp${i.price.toLocaleString('id-ID')}`).join(', ')}
- Total: Rp${lastTx?.total.toLocaleString('id-ID')}

Format sebagai dokumen invoice profesional dengan header, detail items, dan total. Gunakan format text biasa yang rapi.`;
        } else if (type === 'sales_report') {
            prompt = `Buatkan LAPORAN PENJUALAN dalam bahasa Indonesia untuk:
Bisnis: ${business?.name}
Periode: ${transactions.length > 0 ? new Date(transactions[transactions.length - 1].date).toLocaleDateString('id-ID') : '-'} s/d ${transactions.length > 0 ? new Date(transactions[0].date).toLocaleDateString('id-ID') : '-'}
Total Transaksi: ${transactions.length}
Total Revenue: Rp${totalRevenue.toLocaleString('id-ID')}
Top Produk: ${Object.entries(productSales).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5).map(([name, data]) => `${name}: ${data.count} unit (Rp${data.revenue.toLocaleString('id-ID')})`).join(', ')}
Jumlah Produk: ${products.length}

Buatkan laporan yang mencakup:
1. Ringkasan Eksekutif
2. Detail Penjualan per Produk
3. Analisis Tren
4. Rekomendasi

Format sebagai dokumen laporan profesional. Gunakan format text biasa yang rapi.`;
        } else {
            prompt = `Buatkan RINGKASAN BISNIS / EXECUTIVE SUMMARY dalam bahasa Indonesia untuk:
Bisnis: ${business?.name} (${business?.address})
Total Produk: ${products.length}
Produk: ${products.map((p) => `${p.name} (Rp${p.price.toLocaleString('id-ID')}, stok: ${p.stock})`).join(', ')}
Total Revenue (recent): Rp${totalRevenue.toLocaleString('id-ID')}
Total Transaksi: ${transactions.length}

Buatkan ringkasan bisnis yang mencakup:
1. Overview Bisnis
2. Performa Keuangan
3. Portofolio Produk
4. Kekuatan & Peluang
5. Rekomendasi Strategis

Format sebagai executive summary profesional. Gunakan format text biasa yang rapi.`;
        }

        const result = await generateText({
            model: google('gemini-2.5-flash-lite'),
            prompt,
        });

        return NextResponse.json({ content: result.text });
    } catch (error) {
        console.error('Document generation error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
