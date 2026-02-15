import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, sessionId } = await req.json();
    const businessId = 'biz-001';

    // Auto-create session if not provided
    let activeSessionId = sessionId;
    if (!activeSessionId) {
        const firstUserMsg = messages.find((m: { role: string }) => m.role === 'user');
        const title = firstUserMsg
            ? firstUserMsg.content.substring(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '')
            : 'Percakapan Baru';

        const session = await prisma.chatSession.create({
            data: { businessId, title },
        });
        activeSessionId = session.id;
    }

    // Save the latest user message to DB
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg && lastUserMsg.role === 'user') {
        await prisma.chatMessage.create({
            data: {
                businessId,
                sessionId: activeSessionId,
                role: 'user',
                content: lastUserMsg.content,
            },
        });
    }

    // Fetch business context data
    const [business, products, recentTx, receipts] = await Promise.all([
        prisma.business.findUnique({ where: { id: businessId } }),
        prisma.product.findMany({ where: { businessId } }),
        prisma.transaction.findMany({
            where: { businessId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
            take: 50,
        }),
        prisma.scannedReceipt.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        }),
    ]);

    // Calculate summary stats
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const weekTx = recentTx.filter((tx) => new Date(tx.date) >= sevenDaysAgo);
    const monthTx = recentTx.filter((tx) => new Date(tx.date) >= thirtyDaysAgo);

    const weekRevenue = weekTx.reduce((sum, tx) => sum + tx.total, 0);
    const monthRevenue = monthTx.reduce((sum, tx) => sum + tx.total, 0);

    // Product sales summary
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

    const expenseReceipts = receipts
        .map((r) => `${r.storeName || 'Unknown'}: Rp${(r.total || 0).toLocaleString('id-ID')} (${r.date ? new Date(r.date).toLocaleDateString('id-ID') : 'N/A'})`)
        .join('\n');

    const recentTransactions = recentTx.slice(0, 5).map((tx) => {
        const itemsList = tx.items.map((i) => `${i.productName} x${i.quantity} @Rp${i.price.toLocaleString('id-ID')}`).join(', ');
        return `- ${tx.customerName || 'Walk-in'} | ${new Date(tx.date).toLocaleDateString('id-ID')} ${new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} | Rp${tx.total.toLocaleString('id-ID')} | Items: ${itemsList}`;
    }).join('\n');

    const systemPrompt = `Kamu adalah BizAutomate AI — asisten bisnis AI yang cerdas dan ramah untuk "${business?.name || 'Bisnis'}".
Alamat: ${business?.address || '-'}

DATA BISNIS SAAT INI:
- Revenue minggu ini: Rp${weekRevenue.toLocaleString('id-ID')} (${weekTx.length} transaksi)
- Revenue bulan ini: Rp${monthRevenue.toLocaleString('id-ID')} (${monthTx.length} transaksi)
- Rata-rata per transaksi: Rp${monthTx.length > 0 ? Math.round(monthRevenue / monthTx.length).toLocaleString('id-ID') : 0}
- Total produk: ${products.length}
- Produk: ${products.map((p) => `${p.name} (${p.category}, Rp${p.price.toLocaleString('id-ID')}, stok: ${p.stock})`).join(', ')}

TOP 5 PRODUK BULAN INI:
${topProducts.join('\n')}

5 TRANSAKSI TERBARU:
${recentTransactions}

PENGELUARAN (dari scan struk):
${expenseReceipts || 'Belum ada data pengeluaran yang di-scan'}

ATURAN:
1. Jawab dalam Bahasa Indonesia yang profesional tapi ramah.
2. Selalu berikan jawaban berdasarkan DATA NYATA di atas.
3. Berikan insight dan rekomendasi yang actionable.
4. Gunakan emoji secukupnya untuk membuat respons lebih engaging.
5. Jika ditanya sesuatu yang membutuhkan data yang tidak ada, jelaskan dengan sopan.
6. Format respons dengan rapi menggunakan bullet points atau numbering jika diperlukan.`;

    const result = streamText({
        model: google('gemini-2.5-flash-lite'),
        system: systemPrompt,
        messages,
        async onFinish({ text }) {
            // Save AI response to DB after streaming completes
            await prisma.chatMessage.create({
                data: {
                    businessId,
                    sessionId: activeSessionId,
                    role: 'assistant',
                    content: text,
                },
            });

            // Update session title if it's the first message
            const msgCount = await prisma.chatMessage.count({
                where: { sessionId: activeSessionId },
            });
            if (msgCount <= 2 && lastUserMsg) {
                const title = lastUserMsg.content.substring(0, 60) +
                    (lastUserMsg.content.length > 60 ? '...' : '');
                await prisma.chatSession.update({
                    where: { id: activeSessionId },
                    data: { title },
                });
            }
        },
    });

    return result.toDataStreamResponse({
        headers: {
            'X-Session-Id': activeSessionId,
        },
    });
}
