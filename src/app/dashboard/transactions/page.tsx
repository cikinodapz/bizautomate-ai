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
    ChevronDown,
    Plus,
    Trash2,
    ShoppingCart
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

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
}

interface CartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    maxStock: number;
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

    // Add transaction modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [submitting, setSubmitting] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [addSuccess, setAddSuccess] = useState(false);

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

    // Fetch products when add modal opens
    useEffect(() => {
        if (showAddModal) {
            fetch("/api/products")
                .then(r => r.json())
                .then(data => setProducts(data.products || []))
                .catch(() => { });
        }
    }, [showAddModal]);

    const addToCart = (product: Product) => {
        const existing = cart.find(c => c.productId === product.id);
        if (existing) {
            if (existing.quantity < product.stock) {
                setCart(cart.map(c => c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c));
            }
        } else {
            setCart([...cart, {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: 1,
                maxStock: product.stock,
            }]);
        }
    };

    const updateCartQty = (productId: string, qty: number) => {
        if (qty <= 0) {
            setCart(cart.filter(c => c.productId !== productId));
        } else {
            setCart(cart.map(c => c.productId === productId ? { ...c, quantity: Math.min(qty, c.maxStock) } : c));
        }
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(c => c.productId !== productId));
    };

    const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

    const submitTransaction = async () => {
        if (cart.length === 0) return;
        setSubmitting(true);
        setAddError(null);
        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName: customerName || "Umum",
                    paymentMethod,
                    items: cart.map(c => ({
                        productId: c.productId,
                        productName: c.productName,
                        quantity: c.quantity,
                        price: c.price,
                    })),
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Gagal membuat transaksi");
            setAddSuccess(true);
            setTimeout(() => {
                setShowAddModal(false);
                setCart([]);
                setCustomerName("");
                setPaymentMethod("cash");
                setAddSuccess(false);
                fetchTransactions();
            }, 1200);
        } catch (err) {
            setAddError(err instanceof Error ? err.message : "Gagal membuat transaksi");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>🗃️ Riwayat Transaksi</h1>
                    <p>Pantau semua transaksi masuk dan detail penjualannya.</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
                    onClick={() => { setShowAddModal(true); setAddError(null); setAddSuccess(false); }}
                >
                    <Plus size={18} /> Tambah Transaksi
                </button>
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

            {/* Add Transaction Modal */}
            {showAddModal && (
                <div
                    className="modal-overlay"
                    onClick={() => { if (!submitting) setShowAddModal(false); }}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
                            background: 'var(--bg-card)', borderRadius: '16px',
                            border: '1px solid var(--border-primary)',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: 0
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid var(--border-primary)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <ShoppingCart size={24} className="text-accent" /> Tambah Transaksi Baru
                            </h2>
                            <button
                                onClick={() => { if (!submitting) setShowAddModal(false); }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '24px' }}>
                            {addSuccess ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                    <CheckCircle size={64} style={{ color: '#34d399', marginBottom: 16 }} />
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Transaksi Berhasil! 🎉</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>Data transaksi telah disimpan dan stok produk telah diperbarui.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Customer & Payment */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Nama Customer</label>
                                            <input
                                                type="text"
                                                className="search-input"
                                                placeholder="Kosongkan untuk 'Umum'"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Metode Pembayaran</label>
                                            <select
                                                className="search-input"
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                style={{ width: '100%', appearance: 'none', cursor: 'pointer', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
                                            >
                                                <option value="cash">💵 Cash</option>
                                                <option value="transfer">🏦 Transfer Bank</option>
                                                <option value="qris">📱 QRIS</option>
                                                <option value="debit">💳 Kartu Debit</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Product List */}
                                    <div style={{ marginBottom: 24 }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Pilih Produk</label>
                                        <div style={{
                                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10,
                                            maxHeight: '220px', overflowY: 'auto', padding: '4px',
                                            border: '1px solid var(--border-primary)', borderRadius: 10, background: 'var(--bg-secondary)'
                                        }}>
                                            {products.filter(p => p.stock > 0).map(p => {
                                                const inCart = cart.find(c => c.productId === p.id);
                                                return (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => addToCart(p)}
                                                        style={{
                                                            padding: '10px 12px', borderRadius: 8,
                                                            border: inCart ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                                                            background: inCart ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                                                            cursor: 'pointer', textAlign: 'left',
                                                            color: 'var(--text-primary)', transition: 'all 0.15s'
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{p.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            {formatRupiah(p.price)} · Stok: {p.stock}
                                                        </div>
                                                        {inCart && (
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: 4 }}>
                                                                ✓ {inCart.quantity}x ditambahkan
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                            {products.filter(p => p.stock > 0).length === 0 && (
                                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                                                    Tidak ada produk dengan stok tersedia.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cart */}
                                    {cart.length > 0 && (
                                        <div style={{ marginBottom: 24 }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                                                🛒 Keranjang ({cart.length} item)
                                            </label>
                                            <div style={{ border: '1px solid var(--border-primary)', borderRadius: 10, overflow: 'hidden' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                                    <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
                                                        <tr>
                                                            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Produk</th>
                                                            <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 500, width: 120 }}>Qty</th>
                                                            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 500 }}>Harga</th>
                                                            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 500 }}>Subtotal</th>
                                                            <th style={{ padding: '10px 14px', width: 50 }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {cart.map(c => (
                                                            <tr key={c.productId} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                                <td style={{ padding: '10px 14px', fontWeight: 500 }}>{c.productName}</td>
                                                                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                                                        <button
                                                                            onClick={() => updateCartQty(c.productId, c.quantity - 1)}
                                                                            style={{
                                                                                width: 28, height: 28, borderRadius: 6,
                                                                                border: '1px solid var(--border-primary)',
                                                                                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                fontSize: '1rem', fontWeight: 600
                                                                            }}
                                                                        >−</button>
                                                                        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{c.quantity}</span>
                                                                        <button
                                                                            onClick={() => updateCartQty(c.productId, c.quantity + 1)}
                                                                            disabled={c.quantity >= c.maxStock}
                                                                            style={{
                                                                                width: 28, height: 28, borderRadius: 6,
                                                                                border: '1px solid var(--border-primary)',
                                                                                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                                                                cursor: c.quantity >= c.maxStock ? 'not-allowed' : 'pointer',
                                                                                opacity: c.quantity >= c.maxStock ? 0.4 : 1,
                                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                fontSize: '1rem', fontWeight: 600
                                                                            }}
                                                                        >+</button>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>{formatRupiah(c.price)}</td>
                                                                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 500 }}>{formatRupiah(c.price * c.quantity)}</td>
                                                                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                                                    <button
                                                                        onClick={() => removeFromCart(c.productId)}
                                                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                                                                        title="Hapus"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr style={{ background: 'rgba(99,102,241,0.05)' }}>
                                                            <td colSpan={3} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>Grand Total</td>
                                                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{formatRupiah(cartTotal)}</td>
                                                            <td></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {addError && (
                                        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', marginBottom: 16, fontSize: '0.9rem' }}>
                                            ⚠️ {addError}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        {!addSuccess && (
                            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setShowAddModal(false)}
                                    disabled={submitting}
                                >
                                    Batal
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={submitTransaction}
                                    disabled={cart.length === 0 || submitting}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: cart.length === 0 ? 0.5 : 1 }}
                                >
                                    {submitting ? (
                                        <><Loader2 size={18} className="spin" /> Menyimpan...</>
                                    ) : (
                                        <><CheckCircle size={18} /> Simpan Transaksi ({formatRupiah(cartTotal)})</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
