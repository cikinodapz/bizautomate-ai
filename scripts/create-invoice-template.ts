/**
 * Script to generate the base invoice DOCX template with placeholders.
 * Run: npx ts-node scripts/create-invoice-template.ts
 * Output: templates/invoice_template.docx
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
    HeadingLevel,
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

    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Calibri",
                        size: 22, // 11pt
                        color: "333333",
                    },
                },
            },
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 720,    // 0.5 inch
                            bottom: 720,
                            left: 1080,  // 0.75 inch
                            right: 1080,
                        },
                    },
                },
                children: [
                    // ===== HEADER: INVOICE TITLE =====
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 40 },
                        children: [
                            new TextRun({
                                text: "INVOICE",
                                bold: true,
                                size: 56,  // 28pt
                                color: "4F46E5",
                                font: "Calibri",
                            }),
                        ],
                    }),

                    // Accent line
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 200 },
                        border: {
                            bottom: { style: BorderStyle.SINGLE, size: 6, color: "4F46E5" },
                        },
                        children: [],
                    }),

                    // ===== BUSINESS INFO (left) + INVOICE INFO (right) =====
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: borderNone,
                        rows: [
                            new TableRow({
                                children: [
                                    // Left: Business name + address
                                    new TableCell({
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: borderNone,
                                        children: [
                                            new Paragraph({
                                                spacing: { after: 40 },
                                                children: [
                                                    new TextRun({
                                                        text: "{business_name}",
                                                        bold: true,
                                                        size: 28,
                                                        color: "1a1a2e",
                                                    }),
                                                ],
                                            }),
                                            new Paragraph({
                                                spacing: { after: 0 },
                                                children: [
                                                    new TextRun({
                                                        text: "{business_address}",
                                                        size: 20,
                                                        color: "666666",
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    // Right: Invoice number + date
                                    new TableCell({
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: borderNone,
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.RIGHT,
                                                spacing: { after: 40 },
                                                children: [
                                                    new TextRun({ text: "No. Invoice: ", size: 20, color: "666666" }),
                                                    new TextRun({ text: "{invoice_number}", bold: true, size: 20, color: "1a1a2e" }),
                                                ],
                                            }),
                                            new Paragraph({
                                                alignment: AlignmentType.RIGHT,
                                                spacing: { after: 40 },
                                                children: [
                                                    new TextRun({ text: "Tanggal: ", size: 20, color: "666666" }),
                                                    new TextRun({ text: "{invoice_date}", size: 20, color: "1a1a2e" }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),

                    // Spacer
                    new Paragraph({ spacing: { after: 200 }, children: [] }),

                    // ===== CUSTOMER INFO =====
                    new Paragraph({
                        spacing: { after: 80 },
                        children: [
                            new TextRun({ text: "Kepada:", size: 20, color: "666666" }),
                        ],
                    }),
                    new Paragraph({
                        spacing: { after: 200 },
                        children: [
                            new TextRun({
                                text: "{customer_name}",
                                bold: true,
                                size: 24,
                                color: "1a1a2e",
                            }),
                        ],
                    }),

                    // ===== ITEMS TABLE =====
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: borderThin,
                        rows: [
                            // Header row
                            new TableRow({
                                tableHeader: true,
                                children: [
                                    new TableCell({
                                        width: { size: 45, type: WidthType.PERCENTAGE },
                                        borders: borderThin,
                                        shading: headerShading,
                                        children: [
                                            new Paragraph({
                                                spacing: { before: 40, after: 40 },
                                                children: [
                                                    new TextRun({ text: "Produk", bold: true, size: 20, color: "FFFFFF", font: "Calibri" }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    new TableCell({
                                        width: { size: 10, type: WidthType.PERCENTAGE },
                                        borders: borderThin,
                                        shading: headerShading,
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                spacing: { before: 40, after: 40 },
                                                children: [
                                                    new TextRun({ text: "Qty", bold: true, size: 20, color: "FFFFFF", font: "Calibri" }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    new TableCell({
                                        width: { size: 22, type: WidthType.PERCENTAGE },
                                        borders: borderThin,
                                        shading: headerShading,
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.RIGHT,
                                                spacing: { before: 40, after: 40 },
                                                children: [
                                                    new TextRun({ text: "Harga", bold: true, size: 20, color: "FFFFFF", font: "Calibri" }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    new TableCell({
                                        width: { size: 23, type: WidthType.PERCENTAGE },
                                        borders: borderThin,
                                        shading: headerShading,
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.RIGHT,
                                                spacing: { before: 40, after: 40 },
                                                children: [
                                                    new TextRun({ text: "Subtotal", bold: true, size: 20, color: "FFFFFF", font: "Calibri" }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            // Data row (loop)
                            new TableRow({
                                children: [
                                    new TableCell({
                                        borders: borderThin,
                                        children: [
                                            new Paragraph({
                                                spacing: { before: 40, after: 40 },
                                                children: [
                                                    new TextRun({ text: "{#items}{product_name}", size: 20 }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    new TableCell({
                                        borders: borderThin,
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                spacing: { before: 40, after: 40 },
                                                children: [
                                                    new TextRun({ text: "{quantity}", size: 20 }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    new TableCell({
                                        borders: borderThin,
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.RIGHT,
                                                spacing: { before: 40, after: 40 },
                                                children: [
                                                    new TextRun({ text: "{price}", size: 20 }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    new TableCell({
                                        borders: borderThin,
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.RIGHT,
                                                spacing: { before: 40, after: 40 },
                                                children: [
                                                    new TextRun({ text: "{item_subtotal}{/items}", size: 20 }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),

                    // Spacer
                    new Paragraph({ spacing: { after: 120 }, children: [] }),

                    // ===== TOTALS =====
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: borderNone,
                        rows: [
                            // Subtotal
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 65, type: WidthType.PERCENTAGE },
                                        borders: borderNone,
                                        children: [new Paragraph({ children: [] })],
                                    }),
                                    new TableCell({
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        borders: borderNone,
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.RIGHT,
                                                children: [
                                                    new TextRun({ text: "Subtotal", size: 20, color: "666666" }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    new TableCell({
                                        width: { size: 20, type: WidthType.PERCENTAGE },
                                        borders: borderNone,
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.RIGHT,
                                                children: [
                                                    new TextRun({ text: "{subtotal}", size: 20, color: "1a1a2e" }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            // VAT
                            new TableRow({
                                children: [
                                    new TableCell({
                                        borders: borderNone,
                                        children: [new Paragraph({ children: [] })],
                                    }),
                                    new TableCell({
                                        borders: borderNone,
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.RIGHT,
                                                children: [
                                                    new TextRun({ text: "{vat_label}", size: 20, color: "666666" }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    new TableCell({
                                        borders: borderNone,
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.RIGHT,
                                                children: [
                                                    new TextRun({ text: "{vat_amount}", size: 20, color: "1a1a2e" }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            // Grand Total
                            new TableRow({
                                children: [
                                    new TableCell({
                                        borders: borderNone,
                                        children: [new Paragraph({ children: [] })],
                                    }),
                                    new TableCell({
                                        borders: {
                                            ...borderNone,
                                            top: { style: BorderStyle.SINGLE, size: 2, color: "4F46E5" },
                                        },
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.RIGHT,
                                                spacing: { before: 60 },
                                                children: [
                                                    new TextRun({ text: "TOTAL", bold: true, size: 22, color: "4F46E5" }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    new TableCell({
                                        borders: {
                                            ...borderNone,
                                            top: { style: BorderStyle.SINGLE, size: 2, color: "4F46E5" },
                                        },
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.RIGHT,
                                                spacing: { before: 60 },
                                                children: [
                                                    new TextRun({ text: "{grand_total}", bold: true, size: 24, color: "4F46E5" }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),

                    // Spacer
                    new Paragraph({ spacing: { after: 300 }, children: [] }),

                    // ===== NOTES =====
                    new Paragraph({
                        spacing: { after: 60 },
                        children: [
                            new TextRun({ text: "Catatan:", bold: true, size: 20, color: "666666" }),
                        ],
                    }),
                    new Paragraph({
                        spacing: { after: 200 },
                        children: [
                            new TextRun({ text: "{notes}", size: 20, color: "444444", italics: true }),
                        ],
                    }),

                    // ===== FOOTER =====
                    new Paragraph({
                        border: {
                            top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                        },
                        spacing: { before: 200, after: 0 },
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: "Digenerate oleh BizAutomate AI — {generated_date}", size: 16, color: "999999" }),
                        ],
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
    const outputPath = path.join(outputDir, "invoice_template.docx");
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Template created at: ${outputPath}`);
}

createTemplate().catch(console.error);
