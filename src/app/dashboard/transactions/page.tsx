"use client";

import { useState, useEffect } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    FileText,
    Calendar,
    User,
    Package,
    Camera,
    Filter,
    X,
    Eye,
    Receipt,
    CreditCard,
    CheckCircle,
    ChevronsLeft,
    ChevronsRight,
    ChevronDown
} from "lucide-react";

interface TransactionItem {
    id: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface Transaction {
    id: string;
    date: string;
    customerName: string;
    total: number;
    paymentMethod: string;
    status: string;
    items: TransactionItem[];
    imageUrl?: string | null;
}

interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

function formatRupiah(num: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num);
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("date_desc");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search,
                sort,
            });
            const res = await fetch(`/api/transactions?${params}`);
            const data = await res.json();
            if (data.success) {
                setTransactions(data.data);
                setMeta(data.meta);
            }
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTransactions();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, search, sort]);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>🗃️ Riwayat Transaksi</h1>
                    <p>Pantau semua transaksi masuk dan detail penjualannya.</p>
                </div>
            </div>

            <div className="card">
                {/* Filters */}
                <div className="table-filters">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama customer, produk..."
                            className="search-input"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <div className="filter-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ position: 'relative' }}>
                            <Filter size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1, pointerEvents: 'none' }} />
                            <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1, pointerEvents: 'none' }} />
                            <select
                                value={sort}
                                onChange={(e) => {
                                    setSort(e.target.value);
                                    setPage(1);
                                }}
                                className="search-input"
                                style={{
                                    paddingLeft: 36,
                                    paddingRight: 36,
                                    appearance: 'none',
                                    cursor: 'pointer',
                                    minWidth: '200px',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-primary)',
                                }}
                            >
                                <option value="date_desc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Terbaru</option>
                                <option value="date_asc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Terlama</option>
                                <option value="total_desc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Harga Tertinggi</option>
                                <option value="total_asc" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Harga Terendah</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container" style={{ position: 'relative' }}>
                    {loading && transactions.length === 0 ? (
                        <div className="empty-state">
                            <div className="loading-dots"><span></span><span></span><span></span></div>
                            <p>Memuat data transaksi...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={48} />
                            <h3>Belum ada transaksi</h3>
                            <p>Transaksi yang masuk akan muncul di sini.</p>
                        </div>
                    ) : (
                        <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                            {loading && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
                                    animation: 'shimmer 1.5s infinite',
                                    zIndex: 10
                                }} />
                            )}
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="hover-row"
                                        >
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Calendar size={14} className="text-muted" />
                                                    {formatDate(tx.date)}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <User size={14} className="text-muted" />
                                                    <span style={{ fontWeight: 500 }}>{tx.customerName || '-'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Package size={14} className="text-muted" />
                                                    {tx.items.reduce((acc, item) => acc + item.quantity, 0)} items
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge" style={{
                                                    background: 'rgba(52, 211, 153, 0.1)',
                                                    color: '#34d399',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {tx.status || 'Completed'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    {formatRupiah(tx.total)}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className="btn-secondary"
                                                    style={{
                                                        padding: '8px',
                                                        fontSize: '0.8rem',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '6px',
                                                    }}
                                                    onClick={() => setSelectedTransaction(tx)}
                                                    title="Lihat Detail"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="pagination">
                        <div className="pagination-info">
                            Menampilkan {(meta.page - 1) * meta.limit + 1} - {Math.min(meta.page * meta.limit, meta.total)} dari {meta.total} transaksi
                        </div>

                        <div className="pagination-controls" style={{ display: 'flex', gap: 8 }}>
                            <button
                                className="pagination-btn icon-btn"
                                disabled={page === 1}
                                onClick={() => setPage(1)}
                                title="Halaman Pertama"
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                className="pagination-btn icon-btn"
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                title="Sebelumnya"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div style={{ display: 'flex', gap: 4 }}>
                                {(() => {
                                    // Logic to show a window of pages (e.g., max 5 pages)
                                    let startPage = Math.max(1, page - 2);
                                    let endPage = Math.min(meta.totalPages, startPage + 4);

                                    // Adjust start if end is too close to limit
                                    if (endPage - startPage < 4) {
                                        startPage = Math.max(1, endPage - 4);
                                    }

                                    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(p => (
                                        <button
                                            key={p}
                                            className={`pagination-btn ${page === p ? "active" : ""}`}
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    ));
                                })()}
                            </div>

                            <button
                                className="pagination-btn icon-btn"
                                disabled={page === meta.totalPages}
                                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                                title="Berikutnya"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                className="pagination-btn icon-btn"
                                disabled={page === meta.totalPages}
                                onClick={() => setPage(meta.totalPages)}
                                title="Halaman Terakhir"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedTransaction && (
                <div
                    className="modal-overlay"
                    onClick={() => setSelectedTransaction(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '700px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            background: 'var(--bg-card)',
                            borderRadius: '16px',
                            border: '1px solid var(--border-primary)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            padding: 0
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid var(--border-primary)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Receipt size={24} className="text-accent" />
                                    Detail Transaksi
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
                                    ID: <span style={{ fontFamily: 'monospace' }}>{selectedTransaction.id.substring(0, 8)}...</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="btn-icon"
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '24px' }}>
                            {/* Stats Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: 16,
                                marginBottom: 24
                            }}>
                                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tanggal</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                                        <Calendar size={14} /> {formatDate(selectedTransaction.date)}
                                    </div>
                                </div>
                                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Customer</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                                        <User size={14} /> {selectedTransaction.customerName || 'Umum'}
                                    </div>
                                </div>
                                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#34d399' }}>
                                        <CheckCircle size={14} /> {selectedTransaction.status}
                                    </div>
                                </div>
                                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Total</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                        {formatRupiah(selectedTransaction.total)}
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div style={{ marginBottom: 24 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Package size={18} /> Daftar Item
                                </h3>
                                <div style={{
                                    border: '1px solid var(--border-primary)',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
                                            <tr>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Produk</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500 }}>Qty</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500 }}>Harga</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500 }}>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedTransaction.items.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                    <td style={{ padding: '12px 16px' }}>{item.productName}</td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.quantity}</td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>{formatRupiah(item.price)}</td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500 }}>{formatRupiah(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                            <tr style={{ background: 'rgba(52, 211, 153, 0.05)' }}>
                                                <td colSpan={3} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Total Pembayaran</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#34d399', fontSize: '1rem' }}>{formatRupiah(selectedTransaction.total)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Receipt Image */}
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Camera size={18} /> Bukti Fisik / Struk
                                </h3>
                                {selectedTransaction.imageUrl ? (
                                    <div style={{
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '1px solid var(--border-primary)',
                                        background: '#000',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: '20px'
                                    }}>
                                        <img
                                            src={selectedTransaction.imageUrl}
                                            alt="Bukti Struk"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '400px',
                                                objectFit: 'contain',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '40px',
                                        textAlign: 'center',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        border: '1px dashed var(--border-primary)',
                                        color: 'var(--text-muted)'
                                    }}>
                                        <Camera size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                                        <p>Tidak ada bukti foto untuk transaksi ini.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-primary)', textAlign: 'right', background: 'rgba(255,255,255,0.02)' }}>
                            <button
                                className="btn-primary"
                                onClick={() => setSelectedTransaction(null)}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
