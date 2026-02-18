"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Receipt,
    BarChart3,
    Loader2,
    CheckCircle2,
    RefreshCw,
    Settings2,
    ChevronDown,
    FileDown,
} from "lucide-react";

type DocType = "invoice" | "sales_report" | "business_summary";



interface InvoiceOptions {
    customerName: string;
    notes: string;
    includeVAT: boolean;
}

interface ReportOptions {
    period: "7" | "14" | "30";
    language: "id" | "en";
}

interface SummaryOptions {
    focus: "all" | "financial" | "products" | "recommendations";
    tone: "formal" | "casual";
}

export default function DocumentsPage() {
    const [selectedType, setSelectedType] = useState<DocType>("invoice");
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [optionsOpen, setOptionsOpen] = useState(true);
    const [invoiceGenerated, setInvoiceGenerated] = useState<string | null>(null);

    // Customization states
    const [invoiceOpts, setInvoiceOpts] = useState<InvoiceOptions>({
        customerName: "",
        notes: "",
        includeVAT: true,
    });
    const [reportOpts, setReportOpts] = useState<ReportOptions>({
        period: "30",
        language: "id",
    });
    const [summaryOpts, setSummaryOpts] = useState<SummaryOptions>({
        focus: "all",
        tone: "formal",
    });

    // Fetch recent transactions for invoice customer dropdown
    const [recentCustomers, setRecentCustomers] = useState<string[]>([]);
    useEffect(() => {
        fetch("/api/transactions?limit=20")
            .then((r) => r.json())
            .then((data) => {
                const names: string[] = [];
                const txs = data.transactions || data || [];
                txs.forEach((tx: { customerName?: string }) => {
                    if (tx.customerName && !names.includes(tx.customerName)) {
                        names.push(tx.customerName);
                    }
                });
                setRecentCustomers(names);
            })
            .catch(() => { });
    }, []);

    const docTypes = [
        {
            id: "invoice" as DocType,
            icon: Receipt,
            title: "Invoice",
            desc: "Generate invoice/faktur penjualan dari transaksi terbaru",
            color: "#6366f1",
        },
        {
            id: "sales_report" as DocType,
            icon: BarChart3,
            title: "Laporan Penjualan",
            desc: "Laporan penjualan lengkap dengan analisis AI",
            color: "#34d399",
        },
        {
            id: "business_summary" as DocType,
            icon: FileText,
            title: "Ringkasan Bisnis",
            desc: "Executive summary performa bisnis keseluruhan",
            color: "#fbbf24",
        },
    ];

    const getOptions = () => {
        switch (selectedType) {
            case "invoice":
                return {
                    customerName: invoiceOpts.customerName || undefined,
                    notes: invoiceOpts.notes || undefined,
                    includeVAT: invoiceOpts.includeVAT,
                };
            case "sales_report":
                return {
                    period: reportOpts.period,
                    language: reportOpts.language,
                };
            case "business_summary":
                return {
                    focus: summaryOpts.focus,
                    tone: summaryOpts.tone,
                };
        }
    };

    const generateDocument = async () => {
        setGenerating(true);
        setError(null);
        setInvoiceGenerated(null);
        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: selectedType, options: getOptions() }),
            });

            if (selectedType === "invoice" || selectedType === "sales_report" || selectedType === "business_summary") {
                // All document types return binary DOCX
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "Failed to generate");
                }
                const blob = await res.blob();
                const disposition = res.headers.get("Content-Disposition") || "";
                const filenameMatch = disposition.match(/filename="(.+)"/);
                const fallbackName = `${activeDoc?.title || "Document"}_${new Date().toISOString().split("T")[0]}.docx`;
                const filename = filenameMatch ? filenameMatch[1] : fallbackName;

                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                setInvoiceGenerated(filename);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error generating document. Pastikan Gemini API key sudah dikonfigurasi."
            );
        }
        setGenerating(false);
    };


    const activeDoc = docTypes.find((d) => d.id === selectedType);

    return (
        <>
            <div className="page-header">
                <h1>📄 AI Document Generator</h1>
                <p>Generate dokumen bisnis profesional secara otomatis dengan AI.</p>
            </div>

            <div className="doc-types">
                {docTypes.map((docType) => (
                    <div
                        key={docType.id}
                        className={`doc-type-card ${selectedType === docType.id ? "selected" : ""}`}
                        onClick={() => setSelectedType(docType.id)}
                    >
                        <div
                            className="doc-type-icon"
                            style={{
                                background: `${docType.color}15`,
                                color: docType.color,
                            }}
                        >
                            <docType.icon size={28} />
                        </div>
                        <h3>{docType.title}</h3>
                        <p>{docType.desc}</p>
                        {selectedType === docType.id && (
                            <div className="doc-type-check">
                                <CheckCircle2 size={18} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Customization Panel */}
            <div className="doc-options-panel">
                <button
                    className="doc-options-toggle"
                    onClick={() => setOptionsOpen(!optionsOpen)}
                >
                    <div className="doc-options-toggle-left">
                        <Settings2 size={16} />
                        <span>Opsi Kustomisasi</span>
                    </div>
                    <ChevronDown
                        size={16}
                        style={{
                            transform: optionsOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                        }}
                    />
                </button>
                {optionsOpen && (
                    <div className="doc-options-content">
                        {selectedType === "invoice" && (
                            <div className="doc-options-grid">
                                <div className="doc-option-field">
                                    <label>Nama Pelanggan</label>
                                    <input
                                        type="text"
                                        className="doc-option-input"
                                        placeholder="Masukkan nama atau pilih..."
                                        value={invoiceOpts.customerName}
                                        onChange={(e) =>
                                            setInvoiceOpts({
                                                ...invoiceOpts,
                                                customerName: e.target.value,
                                            })
                                        }
                                        list="customer-list"
                                    />
                                    <datalist id="customer-list">
                                        {recentCustomers.map((name) => (
                                            <option key={name} value={name} />
                                        ))}
                                    </datalist>
                                    <span className="doc-option-hint">
                                        Kosongkan untuk menggunakan pelanggan dari transaksi terbaru
                                    </span>
                                </div>
                                <div className="doc-option-field">
                                    <label>Catatan / Notes</label>
                                    <input
                                        type="text"
                                        className="doc-option-input"
                                        placeholder="Contoh: Pembayaran via transfer BCA"
                                        value={invoiceOpts.notes}
                                        onChange={(e) =>
                                            setInvoiceOpts({
                                                ...invoiceOpts,
                                                notes: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="doc-option-field">
                                    <label className="doc-option-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={invoiceOpts.includeVAT}
                                            onChange={(e) =>
                                                setInvoiceOpts({
                                                    ...invoiceOpts,
                                                    includeVAT: e.target.checked,
                                                })
                                            }
                                        />
                                        <span>Sertakan PPN (11%)</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {selectedType === "sales_report" && (
                            <div className="doc-options-grid">
                                <div className="doc-option-field">
                                    <label>Periode Laporan</label>
                                    <select
                                        className="doc-option-input"
                                        value={reportOpts.period}
                                        onChange={(e) =>
                                            setReportOpts({
                                                ...reportOpts,
                                                period: e.target.value as ReportOptions["period"],
                                            })
                                        }
                                    >
                                        <option value="7">7 Hari Terakhir</option>
                                        <option value="14">14 Hari Terakhir</option>
                                        <option value="30">30 Hari Terakhir</option>
                                    </select>
                                </div>
                                <div className="doc-option-field">
                                    <label>Bahasa</label>
                                    <select
                                        className="doc-option-input"
                                        value={reportOpts.language}
                                        onChange={(e) =>
                                            setReportOpts({
                                                ...reportOpts,
                                                language: e.target.value as ReportOptions["language"],
                                            })
                                        }
                                    >
                                        <option value="id">Bahasa Indonesia</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {selectedType === "business_summary" && (
                            <div className="doc-options-grid">
                                <div className="doc-option-field">
                                    <label>Fokus Ringkasan</label>
                                    <select
                                        className="doc-option-input"
                                        value={summaryOpts.focus}
                                        onChange={(e) =>
                                            setSummaryOpts({
                                                ...summaryOpts,
                                                focus: e.target.value as SummaryOptions["focus"],
                                            })
                                        }
                                    >
                                        <option value="all">Semua Aspek</option>
                                        <option value="financial">Keuangan & Revenue</option>
                                        <option value="products">Produk & Inventori</option>
                                        <option value="recommendations">Rekomendasi & Strategi</option>
                                    </select>
                                </div>
                                <div className="doc-option-field">
                                    <label>Gaya Penulisan</label>
                                    <select
                                        className="doc-option-input"
                                        value={summaryOpts.tone}
                                        onChange={(e) =>
                                            setSummaryOpts({
                                                ...summaryOpts,
                                                tone: e.target.value as SummaryOptions["tone"],
                                            })
                                        }
                                    >
                                        <option value="formal">Formal / Profesional</option>
                                        <option value="casual">Santai / Engaging</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="doc-actions-bar">
                <button
                    className="btn-primary"
                    onClick={generateDocument}
                    disabled={generating}
                >
                    {generating ? (
                        <>
                            <Loader2 size={18} className="spin" />
                            {selectedType === "business_summary" ? "Generating dengan AI..." : `Generating ${activeDoc?.title}...`}
                        </>
                    ) : (
                        <><FileDown size={18} /> Generate & Download {activeDoc?.title}</>
                    )}
                </button>


            </div>

            {error && (
                <div className="error-alert">
                    ⚠️ {error}
                </div>
            )}

            <div className="doc-preview-container">
                {generating ? (
                    <div className="doc-preview-loading">
                        <div className="doc-loading-animation">
                            <RefreshCw size={32} className="spin" />
                        </div>
                        <h3>Membuat {activeDoc?.title} dari template...</h3>
                        <p>Mengisi template dengan data bisnis dan analisis AI</p>
                    </div>
                ) : invoiceGenerated ? (
                    <div className="doc-preview-empty">
                        <div className="doc-empty-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                            <CheckCircle2 size={48} />
                        </div>
                        <h3>{activeDoc?.title} berhasil digenerate! ✨</h3>
                        <p style={{ marginBottom: 8 }}>
                            File <strong>{invoiceGenerated}</strong> telah didownload.
                        </p>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            Buka file di Microsoft Word atau Google Docs untuk melihat dan mengedit.
                        </p>
                    </div>
                ) : (
                    <div className="doc-preview-empty">
                        <div className="doc-empty-icon">
                            <FileText size={48} />
                        </div>
                        <h3>Pilih tipe dokumen dan klik Generate</h3>
                        <p>
                            Dokumen akan digenerate dari template DOCX dengan analisis AI dan langsung terdownload.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
