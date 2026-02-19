"use client";

import { useState, useEffect, useCallback } from "react";
import {
    FileText,
    Receipt,
    BarChart3,
    Loader2,
    CheckCircle2,
    Settings2,
    ChevronDown,
    FileDown,
    Clock,
    Trash2,
    FolderOpen,
    X,
    Download,
    Filter,
} from "lucide-react";

type DocType = "invoice" | "sales_report" | "business_summary";

interface DocHistoryItem {
    id: string;
    type: DocType;
    filename: string;
    date: string;
    label: string;
}

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

const HISTORY_KEY = "bizautomate_doc_history";

function getDocHistory(): DocHistoryItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveDocHistory(items: DocHistoryItem[]) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

function formatHistoryDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const docTypeInfo: Record<DocType, { icon: typeof Receipt; label: string; color: string }> = {
    invoice: { icon: Receipt, label: "Invoice", color: "#6366f1" },
    sales_report: { icon: BarChart3, label: "Laporan", color: "#34d399" },
    business_summary: { icon: FileText, label: "Ringkasan", color: "#fbbf24" },
};

type HistoryFilter = "all" | DocType;

export default function DocumentsPage() {
    const [selectedType, setSelectedType] = useState<DocType>("invoice");
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [optionsOpen, setOptionsOpen] = useState(true);
    const [successFile, setSuccessFile] = useState<string | null>(null);
    const [history, setHistory] = useState<DocHistoryItem[]>([]);
    const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
    const [redownloadingId, setRedownloadingId] = useState<string | null>(null);

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

    // Load history from localStorage on mount
    useEffect(() => {
        setHistory(getDocHistory());
    }, []);

    const addToHistory = useCallback((type: DocType, filename: string, label: string) => {
        const newItem: DocHistoryItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type,
            filename,
            date: new Date().toISOString(),
            label,
        };
        const updated = [newItem, ...getDocHistory()].slice(0, 50); // Keep max 50
        saveDocHistory(updated);
        setHistory(updated);
    }, []);

    const clearHistory = useCallback(() => {
        saveDocHistory([]);
        setHistory([]);
    }, []);

    const removeFromHistory = useCallback((id: string) => {
        const updated = getDocHistory().filter((item) => item.id !== id);
        saveDocHistory(updated);
        setHistory(updated);
    }, []);

    const redownloadDocument = useCallback(async (item: DocHistoryItem) => {
        setRedownloadingId(item.id);
        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: item.type, options: {} }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to generate");
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = item.filename;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Gagal mengunduh ulang dokumen."
            );
        }
        setRedownloadingId(null);
    }, []);

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
        setSuccessFile(null);
        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: selectedType, options: getOptions() }),
            });

            if (selectedType === "invoice" || selectedType === "sales_report" || selectedType === "business_summary") {
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
                setSuccessFile(filename);
                addToHistory(selectedType, filename, activeDoc?.title || "Document");
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

            {/* Generate Button */}
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

            {/* Compact Success Banner */}
            {successFile && (
                <div className="doc-success-banner">
                    <div className="doc-success-banner-content">
                        <CheckCircle2 size={20} />
                        <div>
                            <strong>{successFile}</strong> berhasil didownload ✨
                            <span className="doc-success-hint">Buka di Microsoft Word atau Google Docs untuk melihat.</span>
                        </div>
                    </div>
                    <button
                        className="doc-success-close"
                        onClick={() => setSuccessFile(null)}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="error-alert">
                    ⚠️ {error}
                </div>
            )}

            {/* Document History */}
            <div className="doc-history-card">
                <div className="doc-history-header">
                    <h2>
                        <FolderOpen size={18} style={{ color: 'var(--accent-primary)' }} />
                        Riwayat Dokumen
                    </h2>
                    {history.length > 0 && (
                        <button
                            className="doc-history-clear"
                            onClick={clearHistory}
                        >
                            <Trash2 size={14} />
                            Hapus Semua
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                {history.length > 0 && (
                    <div className="doc-history-filters">
                        <Filter size={14} className="doc-history-filter-icon" />
                        {([
                            { key: "all" as HistoryFilter, label: "Semua" },
                            { key: "invoice" as HistoryFilter, label: "Invoice" },
                            { key: "sales_report" as HistoryFilter, label: "Laporan" },
                            { key: "business_summary" as HistoryFilter, label: "Ringkasan" },
                        ]).map((f) => (
                            <button
                                key={f.key}
                                className={`doc-history-filter-btn ${historyFilter === f.key ? "active" : ""}`}
                                onClick={() => setHistoryFilter(f.key)}
                            >
                                {f.label}
                                {f.key !== "all" && (
                                    <span className="doc-history-filter-count">
                                        {history.filter((h) => h.type === f.key).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {history.length === 0 ? (
                    <div className="doc-history-empty">
                        <Clock size={32} />
                        <h4>Belum ada dokumen</h4>
                        <p>Dokumen yang sudah digenerate akan muncul di sini.</p>
                    </div>
                ) : (() => {
                    const filtered = historyFilter === "all"
                        ? history
                        : history.filter((h) => h.type === historyFilter);
                    return filtered.length === 0 ? (
                        <div className="doc-history-empty">
                            <Filter size={28} />
                            <h4>Tidak ada dokumen bertipe ini</h4>
                            <p>Coba pilih filter lain atau generate dokumen baru.</p>
                        </div>
                    ) : (
                        <div className="doc-history-list">
                            {filtered.map((item) => {
                                const info = docTypeInfo[item.type];
                                const IconComp = info.icon;
                                const isRedownloading = redownloadingId === item.id;
                                return (
                                    <div key={item.id} className="doc-history-item">
                                        <div
                                            className="doc-history-item-icon"
                                            style={{ background: `${info.color}15`, color: info.color }}
                                        >
                                            <IconComp size={18} />
                                        </div>
                                        <div className="doc-history-item-info">
                                            <div className="doc-history-item-name">{item.filename}</div>
                                            <div className="doc-history-item-meta">
                                                <span
                                                    className="doc-history-type-badge"
                                                    style={{ background: `${info.color}18`, color: info.color }}
                                                >
                                                    {info.label}
                                                </span>
                                                <span className="doc-history-item-date">
                                                    <Clock size={12} />
                                                    {formatHistoryDate(item.date)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="doc-history-item-actions">
                                            <button
                                                className="doc-history-item-download"
                                                onClick={() => redownloadDocument(item)}
                                                disabled={isRedownloading}
                                                title="Download ulang"
                                            >
                                                {isRedownloading ? (
                                                    <Loader2 size={14} className="spin" />
                                                ) : (
                                                    <Download size={14} />
                                                )}
                                            </button>
                                            <button
                                                className="doc-history-item-remove"
                                                onClick={() => removeFromHistory(item.id)}
                                                title="Hapus dari riwayat"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>
        </>
    );
}
