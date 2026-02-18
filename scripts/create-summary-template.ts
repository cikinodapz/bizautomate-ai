/**
 * Script to generate the business summary DOCX template with placeholders.
 * Run: npx tsx scripts/create-summary-template.ts
 * Output: templates/business_summary_template.docx
 */

import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
    ShadingType,
} from "docx";
import * as fs from "fs";
import * as path from "path";

async function createTemplate() {
    const borderNone = {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    };

    const borderThin = {
        top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    };

    const headerShading = {
        type: ShadingType.SOLID,
        color: "4F46E5",
        fill: "4F46E5",
    };

    const accentShading = {
        type: ShadingType.SOLID,
        color: "F0F0FF",
        fill: "F0F0FF",
    };

    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: { font: "Calibri", size: 22, color: "333333" },
                },
            },
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: { top: 720, bottom: 720, left: 1080, right: 1080 },
                    },
                },
                children: [
                    // ===== HEADER =====
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 40 },
                        children: [
                            new TextRun({ text: "RINGKASAN BISNIS", bold: true, size: 48, color: "4F46E5" }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 200 },
                        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "4F46E5" } },
                        children: [],
                    }),

                    // Business info
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: borderNone,
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: borderNone,
                                        children: [
                                            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "{business_name}", bold: true, size: 28, color: "1a1a2e" })] }),
                                            new Paragraph({ children: [new TextRun({ text: "{business_address}", size: 20, color: "666666" })] }),
                                        ],
                                    }),
                                    new TableCell({
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: borderNone,
                                        children: [
                                            new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 40 }, children: [new TextRun({ text: "Periode: ", size: 20, color: "666666" }), new TextRun({ text: "30 Hari Terakhir", bold: true, size: 20, color: "1a1a2e" })] }),
                                            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Digenerate: ", size: 20, color: "666666" }), new TextRun({ text: "{generated_date}", size: 20, color: "1a1a2e" })] }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),

                    new Paragraph({ spacing: { after: 200 }, children: [] }),

                    // ===== KPI CARDS =====
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: borderThin,
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                        borders: borderThin,
                                        shading: accentShading,
                                        children: [
                                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 20 }, children: [new TextRun({ text: "Revenue (7 Hari)", size: 16, color: "666666" })] }),
                                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "{week_revenue}", bold: true, size: 24, color: "4F46E5" })] }),
                                        ],
                                    }),
                                    new TableCell({
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                        borders: borderThin,
                                        shading: accentShading,
                                        children: [
                                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 20 }, children: [new TextRun({ text: "Revenue (30 Hari)", size: 16, color: "666666" })] }),
                                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "{month_revenue}", bold: true, size: 24, color: "4F46E5" })] }),
                                        ],
                                    }),
                                    new TableCell({
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                        borders: borderThin,
                                        shading: accentShading,
                                        children: [
                                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 20 }, children: [new TextRun({ text: "Total Produk", size: 16, color: "666666" })] }),
                                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "{total_products}", bold: true, size: 24, color: "4F46E5" })] }),
                                        ],
                                    }),
                                    new TableCell({
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                        borders: borderThin,
                                        shading: accentShading,
                                        children: [
                                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 20 }, children: [new TextRun({ text: "Pengeluaran", size: 16, color: "666666" })] }),
                                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "{expense_total}", bold: true, size: 24, color: "E53E3E" })] }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),

                    new Paragraph({ spacing: { after: 200 }, children: [] }),

                    // ===== PERFORMA KEUANGAN =====
                    new Paragraph({
                        spacing: { after: 100 },
                        children: [new TextRun({ text: "Performa Keuangan", bold: true, size: 28, color: "4F46E5" })],
                    }),
                    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "{ai_financial}", size: 22, color: "333333" })] }),

                    // ===== PRODUK TERLARIS =====
                    new Paragraph({
                        spacing: { after: 100 },
                        children: [new TextRun({ text: "Highlight Penjualan", bold: true, size: 28, color: "4F46E5" })],
                    }),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: borderThin,
                        rows: [
                            new TableRow({
                                tableHeader: true,
                                children: [
                                    new TableCell({ borders: borderThin, shading: headerShading, children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Produk", bold: true, size: 20, color: "FFFFFF" })] })] }),
                                    new TableCell({ borders: borderThin, shading: headerShading, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Kategori", bold: true, size: 20, color: "FFFFFF" })] })] }),
                                    new TableCell({ borders: borderThin, shading: headerShading, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Terjual", bold: true, size: 20, color: "FFFFFF" })] })] }),
                                    new TableCell({ borders: borderThin, shading: headerShading, children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Revenue", bold: true, size: 20, color: "FFFFFF" })] })] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ borders: borderThin, children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "{#top_products}{product_name}", size: 20 })] })] }),
                                    new TableCell({ borders: borderThin, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "{category}", size: 20 })] })] }),
                                    new TableCell({ borders: borderThin, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "{qty_sold}", size: 20 })] })] }),
                                    new TableCell({ borders: borderThin, children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "{revenue}{/top_products}", size: 20 })] })] }),
                                ],
                            }),
                        ],
                    }),

                    new Paragraph({ spacing: { after: 200 }, children: [] }),

                    // ===== INVENTORI =====
                    new Paragraph({
                        spacing: { after: 100 },
                        children: [new TextRun({ text: "Manajemen Inventori", bold: true, size: 28, color: "4F46E5" })],
                    }),
                    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "{ai_inventory}", size: 22, color: "333333" })] }),

                    // ===== OUTLOOK & REKOMENDASI =====
                    new Paragraph({
                        spacing: { after: 100 },
                        children: [new TextRun({ text: "Outlook & Rekomendasi", bold: true, size: 28, color: "4F46E5" })],
                    }),
                    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "{ai_recommendations}", size: 22, color: "333333" })] }),

                    // ===== FOOTER =====
                    new Paragraph({
                        border: { top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" } },
                        spacing: { before: 200 },
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Digenerate oleh BizAutomate AI — {generated_date}", size: 16, color: "999999" })],
                    }),
                ],
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    const outputDir = path.join(process.cwd(), "templates");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, "business_summary_template.docx");
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Business summary template created at: ${outputPath}`);
}

createTemplate().catch(console.error);
