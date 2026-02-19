import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import * as fs from 'fs';
import * as path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface DocOptions {
    customerName?: string;
    notes?: string;
    includeVAT?: boolean;
    period?: string;
    language?: string;
    focus?: string;
    tone?: string;
}

function formatRp(n: number): string {
    return `Rp${n.toLocaleString('id-ID')}`;
}

// ===== 1. DOCX INVOICE =====
async function generateInvoiceDocx(businessId: string, options: DocOptions): Promise<{ buffer: Buffer; filename: string }> {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [business, recentTx] = await Promise.all([
        prisma.business.findUnique({ where: { id: businessId } }),
        prisma.transaction.findMany({
            where: { businessId, date: { gte: sevenDaysAgo } },
            include: { items: true },
            orderBy: { date: 'desc' },
            take: 1,
        }),
    ]);

    if (recentTx.length === 0) {
        throw new Error('Tidak ada transaksi terbaru untuk dijadikan invoice.');
    }

    const tx = recentTx[0];
    const items = tx.items.map((item) => ({
        product_name: item.productName,
        quantity: item.quantity.toString(),
        price: formatRp(item.price),
        item_subtotal: formatRp(item.subtotal),
    }));

    const subtotalNum = tx.items.reduce((sum, item) => sum + item.subtotal, 0);
    const includeVAT = options.includeVAT !== false;
    const vatNum = includeVAT ? Math.round(subtotalNum * 0.11) : 0;
    const grandTotalNum = subtotalNum + vatNum;

    const year = now.getFullYear();
    const invoiceNum = `INV-${year}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const data = {
        business_name: business?.name || 'Bisnis',
        business_address: business?.address || '-',
        invoice_number: invoiceNum,
        invoice_date: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        customer_name: options.customerName || tx.customerName || 'Walk-in Customer',
        items,
        subtotal: formatRp(subtotalNum),
        vat_label: includeVAT ? 'PPN 11%' : '',
        vat_amount: includeVAT ? formatRp(vatNum) : '-',
        grand_total: formatRp(grandTotalNum),
        notes: options.notes || 'Terima kasih atas pembeliannya.',
        generated_date: now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    };

    const templatePath = path.join(process.cwd(), 'templates', 'invoice_template.docx');
    const templateContent = fs.readFileSync(templatePath);
    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render(data);

    const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    return { buffer: buf, filename: `${invoiceNum}.docx` };
}

// ===== 2. DOCX SALES REPORT =====
async function generateSalesReportDocx(businessId: string, options: DocOptions): Promise<{ buffer: Buffer; filename: string }> {
    const periodDays = parseInt(options.period || '30');
    const now = new Date();
    const periodAgo = new Date(now);
    periodAgo.setDate(now.getDate() - periodDays);

    const [business, products, periodTx, receipts] = await Promise.all([
        prisma.business.findUnique({ where: { id: businessId } }),
        prisma.product.findMany({ where: { businessId } }),
        prisma.transaction.findMany({
            where: { businessId, date: { gte: periodAgo } },
            include: { items: true },
            orderBy: { date: 'desc' },
        }),
        prisma.scannedReceipt.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        }),
    ]);

    const periodRevenue = periodTx.reduce((sum, tx) => sum + tx.total, 0);
    const avgTx = periodTx.length > 0 ? Math.round(periodRevenue / periodTx.length) : 0;

    const productSales: Record<string, { count: number; revenue: number }> = {};
    periodTx.forEach((tx) => {
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
        .slice(0, 10)
        .map(([name, data]) => ({
            product_name: name,
            qty_sold: `${data.count} unit`,
            revenue: formatRp(data.revenue),
        }));

    const lowStock = products.filter((p) => p.stock < 10);
    const expenseTotal = receipts.reduce((sum, r) => sum + (r.total || 0), 0);

    const lang = options.language === 'en' ? 'English' : 'Bahasa Indonesia';
    const dataContext = `
Revenue ${periodDays} hari: ${formatRp(periodRevenue)} (${periodTx.length} transaksi)
Rata-rata per transaksi: ${formatRp(avgTx)}
Total pengeluaran: ${formatRp(expenseTotal)}
Top produk: ${topProducts.map(p => `${p.product_name} (${p.qty_sold}, ${p.revenue})`).join(', ')}
Stok rendah: ${lowStock.length > 0 ? lowStock.map(p => `${p.name} (${p.stock})`).join(', ') : 'Tidak ada'}
Kategori produk: ${Array.from(new Set(products.map(p => p.category))).join(', ')}
`;

    const aiResult = await generateText({
        model: google('gemini-2.5-flash-lite'),
        prompt: `Berdasarkan data bisnis berikut, berikan:
1. EXECUTIVE_SUMMARY: Ringkasan eksekutif 2-3 kalimat tentang performa bisnis
2. ANALYSIS: Analisis insight 3-4 kalimat tentang tren dan pola penjualan
3. RECOMMENDATIONS: 3-5 rekomendasi actionable, masing-masing 1 kalimat

${dataContext}

Tulis dalam ${lang}. Format output HARUS:
EXECUTIVE_SUMMARY: [teks]
ANALYSIS: [teks]
RECOMMENDATIONS: [teks]

Jangan tambahkan formatting lain. Langsung tulis.`,
    });

    const aiText = aiResult.text;
    const execSummary = aiText.match(/EXECUTIVE_SUMMARY:\s*([\s\S]+?)(?=ANALYSIS:|$)/)?.[1]?.trim() || 'Ringkasan tidak tersedia.';
    const analysis = aiText.match(/ANALYSIS:\s*([\s\S]+?)(?=RECOMMENDATIONS:|$)/)?.[1]?.trim() || 'Analisis tidak tersedia.';
    const recommendations = aiText.match(/RECOMMENDATIONS:\s*([\s\S]+?)$/)?.[1]?.trim() || 'Rekomendasi tidak tersedia.';

    const periodLabel = `${periodDays} Hari Terakhir (${periodAgo.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} — ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})`;

    const data = {
        business_name: business?.name || 'Bisnis',
        business_address: business?.address || '-',
        period_label: periodLabel,
        generated_date: now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        executive_summary: execSummary,
        total_revenue: formatRp(periodRevenue),
        total_transactions: `${periodTx.length} transaksi`,
        avg_transaction: formatRp(avgTx),
        top_products: topProducts.length > 0 ? topProducts : [{ product_name: '-', qty_sold: '-', revenue: '-' }],
        ai_analysis: analysis,
        ai_recommendations: recommendations,
    };

    const templatePath = path.join(process.cwd(), 'templates', 'sales_report_template.docx');
    const templateContent = fs.readFileSync(templatePath);
    const zip = new PizZip(templateContent);
    const docx = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    docx.render(data);

    const buf = docx.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    const dateStr = now.toISOString().split('T')[0];

    return { buffer: buf, filename: `Laporan_Penjualan_${dateStr}.docx` };
}

// ===== 3. DOCX BUSINESS SUMMARY =====
async function generateSummaryDocx(businessId: string, options: DocOptions): Promise<{ buffer: Buffer; filename: string }> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [business, products, recentTx, monthTx, receipts] = await Promise.all([
        prisma.business.findUnique({ where: { id: businessId } }),
        prisma.product.findMany({ where: { businessId } }),
        prisma.transaction.findMany({
            where: { businessId, date: { gte: sevenDaysAgo } },
            include: { items: true },
            orderBy: { date: 'desc' },
        }),
        prisma.transaction.findMany({
            where: { businessId, date: { gte: thirtyDaysAgo } },
            include: { items: true },
            orderBy: { date: 'desc' },
        }),
        prisma.scannedReceipt.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        }),
    ]);

    const weekRevenue = recentTx.reduce((sum, tx) => sum + tx.total, 0);
    const monthRevenue = monthTx.reduce((sum, tx) => sum + tx.total, 0);
    const expenseTotal = receipts.reduce((sum, r) => sum + (r.total || 0), 0);

    const productSales: Record<string, { count: number; revenue: number; category: string }> = {};
    monthTx.forEach((tx) => {
        tx.items.forEach((item) => {
            if (!productSales[item.productName]) {
                const prod = products.find(p => p.name === item.productName);
                productSales[item.productName] = { count: 0, revenue: 0, category: prod?.category || '-' };
            }
            productSales[item.productName].count += item.quantity;
            productSales[item.productName].revenue += item.subtotal;
        });
    });

    const topProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .slice(0, 10)
        .map(([name, data]) => ({
            product_name: name,
            category: data.category,
            qty_sold: `${data.count} unit`,
            revenue: formatRp(data.revenue),
        }));

    const lowStock = products.filter((p) => p.stock < 10);

    const focusLabel = options.focus === 'financial' ? 'keuangan dan revenue' :
        options.focus === 'products' ? 'produk dan inventori' :
            options.focus === 'recommendations' ? 'rekomendasi dan strategi' : 'semua aspek';
    const toneLabel = options.tone === 'casual' ? 'santai dan engaging' : 'formal dan profesional';

    const dataContext = `
Revenue 7 hari: ${formatRp(weekRevenue)} (${recentTx.length} transaksi)
Revenue 30 hari: ${formatRp(monthRevenue)} (${monthTx.length} transaksi)
Rata-rata/transaksi: ${formatRp(monthTx.length > 0 ? Math.round(monthRevenue / monthTx.length) : 0)}
Pengeluaran: ${formatRp(expenseTotal)}
Produk: ${products.length} total
Top produk: ${topProducts.map(p => `${p.product_name} (${p.qty_sold}, ${p.revenue})`).join(', ')}
Stok rendah: ${lowStock.length > 0 ? lowStock.map(p => `${p.name} (${p.stock})`).join(', ') : 'Tidak ada'}
Kategori: ${Array.from(new Set(products.map(p => p.category))).join(', ')}
`;

    const aiResult = await generateText({
        model: google('gemini-2.5-flash-lite'),
        prompt: `Berdasarkan data bisnis berikut, berikan 3 bagian analisis. Fokus pada ${focusLabel}. Gaya ${toneLabel}.

${dataContext}

Format output HARUS persis:
FINANCIAL: [analisis performa keuangan 3-5 kalimat, termasuk tren revenue, perbandingan pengeluaran vs pendapatan, dan insight]
INVENTORY: [analisis inventori 2-4 kalimat, termasuk status stok, produk yang perlu restock, dan saran manajemen]
RECOMMENDATIONS: [5-7 rekomendasi actionable, pisahkan dengan titik koma (;)]

Tulis dalam Bahasa Indonesia. Jangan tambahkan formatting lain.`,
    });

    const aiText = aiResult.text;
    const aiFinancial = aiText.match(/FINANCIAL:\s*([\s\S]+?)(?=INVENTORY:|$)/)?.[1]?.trim() || 'Analisis keuangan tidak tersedia.';
    const aiInventory = aiText.match(/INVENTORY:\s*([\s\S]+?)(?=RECOMMENDATIONS:|$)/)?.[1]?.trim() || 'Analisis inventori tidak tersedia.';
    const aiRecommendations = aiText.match(/RECOMMENDATIONS:\s*([\s\S]+?)$/)?.[1]?.trim() || 'Rekomendasi tidak tersedia.';

    const data = {
        business_name: business?.name || 'Bisnis',
        business_address: business?.address || '-',
        generated_date: now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        week_revenue: formatRp(weekRevenue),
        month_revenue: formatRp(monthRevenue),
        total_products: `${products.length} produk`,
        expense_total: formatRp(expenseTotal),
        top_products: topProducts.length > 0 ? topProducts : [{ product_name: '-', category: '-', qty_sold: '-', revenue: '-' }],
        ai_financial: aiFinancial,
        ai_inventory: aiInventory,
        ai_recommendations: aiRecommendations,
    };

    const templatePath = path.join(process.cwd(), 'templates', 'business_summary_template.docx');
    const templateContent = fs.readFileSync(templatePath);
    const zip = new PizZip(templateContent);
    const docx = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    docx.render(data);

    const buf = docx.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    const dateStr = now.toISOString().split('T')[0];

    return { buffer: buf, filename: `Ringkasan_Bisnis_${dateStr}.docx` };
}

// ===== MAIN HANDLER =====
export async function POST(req: Request) {
    try {
        const { type, options = {} } = await req.json() as { type: string; options: DocOptions };
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const businessId = session.businessId;

        if (!type || !['invoice', 'sales_report', 'business_summary'].includes(type)) {
            return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
        }

        // ===== INVOICE → DOCX =====
        if (type === 'invoice') {
            const { buffer, filename } = await generateInvoiceDocx(businessId, options);
            return new Response(new Uint8Array(buffer), {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                },
            });
        }

        // ===== SALES REPORT → DOCX =====
        if (type === 'sales_report') {
            const { buffer, filename } = await generateSalesReportDocx(businessId, options);
            return new Response(new Uint8Array(buffer), {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                },
            });
        }

        // ===== BUSINESS SUMMARY → DOCX =====
        const { buffer, filename } = await generateSummaryDocx(businessId, options);
        return new Response(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Document generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate document. ' + String(error) },
            { status: 500 }
        );
    }
}
