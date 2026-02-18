import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Remove data URL prefix if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: base64Data,
                            },
                        },
                        {
                            text: `Analisis gambar struk/nota/receipt ini dan extract semua informasi.
              
Return sebagai JSON dengan format EXACT berikut (tanpa markdown code blocks):
{
  "storeName": "nama toko",
  "date": "YYYY-MM-DD",
  "items": [
    { "name": "nama barang", "qty": 1, "price": 10000 }
  ],
  "total": 50000
}

ATURAN:
1. Jika tidak bisa membaca field tertentu, gunakan null.
2. Price dan total dalam angka (tanpa Rp dan titik).
3. qty adalah jumlah item, default 1 jika tidak terlihat.
4. Pastikan total adalah jumlah dari semua (qty * price).
5. HANYA return JSON, tanpa teks tambahan.`,
                        },
                    ],
                },
            ],
        });

        const text = response?.text || '';

        // Try to parse JSON from response
        let parsed;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        } catch {
            return NextResponse.json({
                error: 'Failed to parse receipt',
                raw: text
            }, { status: 422 });
        }

        return NextResponse.json({
            success: true,
            data: parsed,
            raw: text,
        });
    } catch (error) {
        console.error('Scanner error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// Save scanned receipt (expense only)
export async function PUT(req: Request) {
    try {
        const { storeName, date, items, total, image } = await req.json();
        const businessId = 'biz-001';

        console.log(`[Scanner] Saving receipt for ${storeName}, total: ${total}, hasImage: ${!!image}`);

        // Save scanned receipt record (pengeluaran)
        const receipt = await prisma.scannedReceipt.create({
            data: {
                businessId,
                storeName,
                date: date ? new Date(date) : new Date(),
                total,
                itemsJson: JSON.stringify(items),
                imageUrl: image
            },
        });

        console.log(`[Scanner] Created ScannedReceipt ID: ${receipt.id}`);

        return NextResponse.json({ success: true, receipt });
    } catch (error) {
        console.error('Save receipt error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// GET /api/scanner — Fetch scan history
export async function GET() {
    try {
        const businessId = 'biz-001';
        const history = await prisma.scannedReceipt.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        console.log(`[Scanner] Fetched ${history.length} history items for ${businessId}`);

        return NextResponse.json({
            success: true,
            history: history.map(h => ({
                id: h.id,
                storeName: h.storeName,
                date: h.date,
                total: h.total,
                imageUrl: h.imageUrl,
                items: JSON.parse(h.itemsJson || '[]'),
                createdAt: h.createdAt
            }))
        });
    } catch (error) {
        console.error('Scanner history error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
