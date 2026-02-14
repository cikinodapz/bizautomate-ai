"use client";

import { useState } from "react";
import {
    FileText,
    Receipt,
    BarChart3,
    Loader2,
    Download,
} from "lucide-react";

type DocType = "invoice" | "sales_report" | "business_summary";

export default function DocumentsPage() {
    const [selectedType, setSelectedType] = useState<DocType>("invoice");
    const [generating, setGenerating] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const docTypes = [
        {
            id: "invoice" as DocType,
            icon: Receipt,
            title: "Invoice",
            desc: "Generate invoice/faktur penjualan",
        },
        {
            id: "sales_report" as DocType,
            icon: BarChart3,
            title: "Laporan Penjualan",
            desc: "Laporan penjualan mingguan/bulanan",
        },
        {
            id: "business_summary" as DocType,
            icon: FileText,
            title: "Ringkasan Bisnis",
            desc: "Executive summary performa bisnis",
        },
    ];

    const generateDocument = async () => {
        setGenerating(true);
        setPreview(null);
        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: selectedType }),
            });
            const data = await res.json();
            setPreview(data.content);
        } catch {
            setPreview("Error generating document. Pastikan Gemini API key sudah dikonfigurasi.");
        }
        setGenerating(false);
    };

    return (
        <>
            <div className="page-header">
                <h1>📄 AI Document Generator</h1>
                <p>Generate dokumen bisnis profesional secara otomatis dengan AI.</p>
            </div>

            <div className="doc-types">
                {docTypes.map((doc) => (
                    <div
                        key={doc.id}
                        className={`doc-type-card ${selectedType === doc.id ? "selected" : ""}`}
                        onClick={() => setSelectedType(doc.id)}
                    >
                        <doc.icon size={32} />
                        <h3>{doc.title}</h3>
                        <p>{doc.desc}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                <button
                    className="btn-primary"
                    onClick={generateDocument}
                    disabled={generating}
                >
                    {generating ? (
                        <><Loader2 size={18} /> Generating...</>
                    ) : (
                        <><FileText size={18} /> Generate Dokumen</>
                    )}
                </button>
                {preview && (
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            const blob = new Blob([preview], { type: "text/plain" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${selectedType}_${new Date().toISOString().split("T")[0]}.txt`;
                            a.click();
                        }}
                    >
                        <Download size={18} /> Download
                    </button>
                )}
            </div>

            <div className="doc-preview">
                {preview ? (
                    preview
                ) : (
                    <div className="empty-state">
                        <FileText size={48} />
                        <p>Pilih tipe dokumen dan klik Generate untuk melihat preview</p>
                    </div>
                )}
            </div>
        </>
    );
}
