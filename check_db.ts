import { PrismaClient } from './src/generated/prisma';
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.scannedReceipt.count();
    const latest = await prisma.scannedReceipt.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log('COUNT:', count);
    console.log('LATEST:', JSON.stringify(latest, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
