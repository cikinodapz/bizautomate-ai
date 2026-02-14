import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
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
    const products = await Promise.all([
        prisma.product.create({
            data: {
                id: 'prod-001', businessId: business.id,
                name: 'Kopi Susu Gula Aren', category: 'Minuman', price: 22000, stock: 150,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-002', businessId: business.id,
                name: 'Es Matcha Latte', category: 'Minuman', price: 28000, stock: 80,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-003', businessId: business.id,
                name: 'Americano', category: 'Minuman', price: 18000, stock: 200,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-004', businessId: business.id,
                name: 'Roti Bakar Coklat', category: 'Makanan', price: 15000, stock: 60,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-005', businessId: business.id,
                name: 'Nasi Goreng Spesial', category: 'Makanan', price: 25000, stock: 45,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-006', businessId: business.id,
                name: 'Croissant Butter', category: 'Makanan', price: 20000, stock: 35,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-007', businessId: business.id,
                name: 'Thai Tea', category: 'Minuman', price: 20000, stock: 100,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-008', businessId: business.id,
                name: 'Sandwich Tuna', category: 'Makanan', price: 30000, stock: 25,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-009', businessId: business.id,
                name: 'Cappuccino', category: 'Minuman', price: 24000, stock: 120,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-010', businessId: business.id,
                name: 'Cheesecake Slice', category: 'Makanan', price: 35000, stock: 20,
            },
        }),
    ]);

    // Generate transactions for the last 30 days
    const now = new Date();
    const transactions = [];

    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
        const date = new Date(now);
        date.setDate(date.getDate() - dayOffset);
        date.setHours(0, 0, 0, 0);

        // 5-15 transactions per day
        const txCount = Math.floor(Math.random() * 11) + 5;

        for (let t = 0; t < txCount; t++) {
            const hour = Math.floor(Math.random() * 12) + 7; // 7am - 7pm
            const txDate = new Date(date);
            txDate.setHours(hour, Math.floor(Math.random() * 60));

            // 1-4 items per transaction
            const itemCount = Math.floor(Math.random() * 4) + 1;
            const selectedProducts: typeof products[number][] = [];
            const shuffled = [...products].sort(() => Math.random() - 0.5);
            for (let i = 0; i < itemCount; i++) {
                selectedProducts.push(shuffled[i]);
            }

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
                'Putu', 'Rina', 'Sari', 'Tono', 'Udin', 'Wati', null, null,
            ];
            const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];

            transactions.push(
                prisma.transaction.create({
                    data: {
                        businessId: business.id,
                        date: txDate,
                        customerName,
                        total,
                        items: { create: items },
                    },
                })
            );
        }
    }

    await Promise.all(transactions);

    const txCount = transactions.length;
    console.log(`✅ Seeded: 1 business, ${products.length} products, ${txCount} transactions`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
