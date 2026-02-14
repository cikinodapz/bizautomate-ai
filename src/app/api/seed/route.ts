import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        // Clean existing data
        await prisma.chatMessage.deleteMany();
        await prisma.scannedReceipt.deleteMany();
        await prisma.transactionItem.deleteMany();
        await prisma.transaction.deleteMany();
        await prisma.product.deleteMany();
        await prisma.business.deleteMany();

        // Create business
        const business = await prisma.business.create({
            data: {
                id: 'biz-001',
                name: 'Warung Kopi Nusantara',
                address: 'Jl. Merdeka No. 45, Denpasar, Bali',
            },
        });

        // Create products
        const productsData = [
            { id: 'prod-001', name: 'Kopi Susu Gula Aren', category: 'Minuman', price: 22000, stock: 150 },
            { id: 'prod-002', name: 'Es Matcha Latte', category: 'Minuman', price: 28000, stock: 80 },
            { id: 'prod-003', name: 'Americano', category: 'Minuman', price: 18000, stock: 200 },
            { id: 'prod-004', name: 'Roti Bakar Coklat', category: 'Makanan', price: 15000, stock: 60 },
            { id: 'prod-005', name: 'Nasi Goreng Spesial', category: 'Makanan', price: 25000, stock: 45 },
            { id: 'prod-006', name: 'Croissant Butter', category: 'Makanan', price: 20000, stock: 35 },
            { id: 'prod-007', name: 'Thai Tea', category: 'Minuman', price: 20000, stock: 100 },
            { id: 'prod-008', name: 'Sandwich Tuna', category: 'Makanan', price: 30000, stock: 25 },
            { id: 'prod-009', name: 'Cappuccino', category: 'Minuman', price: 24000, stock: 120 },
            { id: 'prod-010', name: 'Cheesecake Slice', category: 'Makanan', price: 35000, stock: 20 },
        ];

        const products = await Promise.all(
            productsData.map((p) =>
                prisma.product.create({
                    data: { ...p, businessId: business.id },
                })
            )
        );

        // Generate transactions for the last 30 days
        const now = new Date();
        let txCount = 0;

        for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
            const date = new Date(now);
            date.setDate(date.getDate() - dayOffset);
            date.setHours(0, 0, 0, 0);

            const dailyTxCount = Math.floor(Math.random() * 11) + 5;

            for (let t = 0; t < dailyTxCount; t++) {
                const hour = Math.floor(Math.random() * 12) + 7;
                const txDate = new Date(date);
                txDate.setHours(hour, Math.floor(Math.random() * 60));

                const itemCount = Math.floor(Math.random() * 4) + 1;
                const shuffled = [...products].sort(() => Math.random() - 0.5);
                const selectedProducts = shuffled.slice(0, itemCount);

                const items = selectedProducts.map((p) => {
                    const qty = Math.floor(Math.random() * 3) + 1;
                    return {
                        productId: p.id,
                        productName: p.name,
                        quantity: qty,
                        price: p.price,
                        subtotal: p.price * qty,
                    };
                });

                const total = items.reduce((sum, item) => sum + item.subtotal, 0);

                const customerNames = [
                    'Andi', 'Budi', 'Citra', 'Dewi', 'Eka', 'Fajar', 'Gita',
                    'Hendra', 'Indah', 'Joko', 'Kartika', 'Lina', 'Made', 'Nina',
                    'Putu', 'Rina', 'Sari', 'Tono', 'Udin', 'Wati',
                ];
                const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];

                await prisma.transaction.create({
                    data: {
                        businessId: business.id,
                        date: txDate,
                        customerName,
                        total,
                        items: { create: items },
                    },
                });
                txCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Seeded: 1 business, ${products.length} products, ${txCount} transactions`,
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
