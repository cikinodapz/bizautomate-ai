"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Save, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react";

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
}

function formatRupiah(num: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num);
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [form, setForm] = useState({ name: "", category: "Minuman", price: "", stock: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Semua");
    const itemsPerPage = 10;

    const loadProducts = () => {
        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => {
                setProducts(data.products || []);
                setLoading(false);
            });
    };

    useEffect(() => { loadProducts(); }, []);

    // Filter logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "Semua" || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [filteredProducts.length, totalPages, currentPage]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = {
            name: form.name,
            category: form.category,
            price: parseFloat(form.price),
            stock: parseInt(form.stock),
        };

        if (editId) {
            await fetch("/api/products", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editId, ...body }),
            });
        } else {
            await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
        }

        setForm({ name: "", category: "Minuman", price: "", stock: "" });
        setShowForm(false);
        setEditId(null);
        loadProducts();
    };

    const confirmDelete = async () => {
        if (productToDelete) {
            await fetch(`/api/products?id=${productToDelete.id}`, { method: "DELETE" });
            setProductToDelete(null);
            loadProducts();
        }
    };

    if (loading) return <div className="empty-state"><div className="loading-dots"><span></span><span></span><span></span></div></div>;

    return (
        <>
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1>📦 Produk</h1>
                    <p>Kelola daftar produk bisnis Anda.</p>
                </div>
                <button className="btn-primary" onClick={() => { setForm({ name: "", category: "Minuman", price: "", stock: "" }); setEditId(null); setShowForm(true); }}>
                    <Plus size={18} /> Tambah Produk
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editId ? "Edit Produk" : "Tambah Produk Baru"}</h2>
                            <button className="btn-close" onClick={() => setShowForm(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Nama Produk</label>
                                <input
                                    className="chat-input"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    placeholder="Contoh: Coffee Latte"
                                    autoFocus
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Kategori</label>
                                <select
                                    className="chat-input"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    style={{ width: "100%" }}
                                >
                                    <option value="Minuman">Minuman</option>
                                    <option value="Makanan">Makanan</option>
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="form-group">
                                    <label>Harga (Rp)</label>
                                    <input
                                        className="chat-input"
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        required
                                        placeholder="0"
                                        style={{ width: "100%" }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stok</label>
                                    <input
                                        className="chat-input"
                                        type="number"
                                        value={form.stock}
                                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                        required
                                        placeholder="0"
                                        style={{ width: "100%" }}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-primary)", padding: "10px 20px", borderRadius: "var(--radius-md)", color: "white", cursor: "pointer" }}>
                                    Batal
                                </button>
                                <button type="submit" className="btn-primary">
                                    <Save size={18} /> {editId ? "Update Produk" : "Simpan Produk"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {productToDelete && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setProductToDelete(null); }}>
                    <div className="modal-content" style={{ maxWidth: "400px", textAlign: "center" }}>
                        <div style={{ color: "var(--danger)", marginBottom: "20px", display: "flex", justifyContent: "center" }}>
                            <div style={{ background: "rgba(240, 68, 56, 0.1)", padding: "16px", borderRadius: "50%" }}>
                                <Trash2 size={32} />
                            </div>
                        </div>
                        <h2 style={{ marginBottom: "12px" }}>Hapus Produk?</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "0.95rem", lineHeight: "1.5" }}>
                            Apakah Anda yakin ingin menghapus <strong>{productToDelete.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="modal-footer" style={{ justifyContent: "center", marginTop: 0 }}>
                            <button type="button" className="btn-secondary" onClick={() => setProductToDelete(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-primary)", padding: "10px 24px", borderRadius: "var(--radius-md)", color: "white", cursor: "pointer" }}>
                                Batal
                            </button>
                            <button type="button" className="btn-primary" onClick={confirmDelete} style={{ background: "#ef4444", border: "none", padding: "10px 24px" }}>
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="table-filters">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Cari nama produk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ position: 'relative' }}>
                            <Filter size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1, pointerEvents: 'none' }} />
                            <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1, pointerEvents: 'none' }} />
                            <select
                                className="search-input"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                style={{
                                    paddingLeft: 36,
                                    paddingRight: 36,
                                    appearance: 'none',
                                    cursor: 'pointer',
                                    minWidth: '180px',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-primary)',
                                }}
                            >
                                <option value="Semua" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Semua Kategori</option>
                                <option value="Makanan" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Makanan</option>
                                <option value="Minuman" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Minuman</option>
                            </select>
                        </div>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Produk</th>
                            <th>Kategori</th>
                            <th>Harga</th>
                            <th>Stok</th>
                            <th style={{ width: 100 }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.length > 0 ? (
                            paginatedProducts.map((p) => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                    <td>
                                        <span className={`category-badge ${p.category.toLowerCase()}`}>{p.category}</span>
                                    </td>
                                    <td>{formatRupiah(p.price)}</td>
                                    <td>
                                        <span style={{ color: p.stock < 30 ? "var(--warning)" : "var(--text-primary)" }}>
                                            {p.stock}
                                            {p.stock < 30 && " ⚠️"}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button
                                                style={{ background: "none", border: "none", color: "var(--accent-primary-hover)", cursor: "pointer" }}
                                                onClick={() => {
                                                    setEditId(p.id);
                                                    setForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock) });
                                                    setShowForm(true);
                                                }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}
                                                onClick={() => setProductToDelete(p)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                    Tidak ada produk yang ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="pagination">
                        <div className="pagination-info">
                            Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
                        </div>
                        <div className="pagination-controls" style={{ display: 'flex', gap: 8 }}>
                            <button
                                className="pagination-btn icon-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                                title="Halaman Pertama"
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                className="pagination-btn icon-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                title="Sebelumnya"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div style={{ display: 'flex', gap: 4 }}>
                                {(() => {
                                    // Logic to show a window of pages (e.g., max 5 pages)
                                    let startPage = Math.max(1, currentPage - 2);
                                    let endPage = Math.min(totalPages, startPage + 4);

                                    // Adjust start if end is too close to limit
                                    if (endPage - startPage < 4) {
                                        startPage = Math.max(1, endPage - 4);
                                    }

                                    // Ensure startPage is valid
                                    startPage = Math.max(1, Math.min(startPage, Math.max(1, totalPages - 4)));

                                    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const p = startPage + i;
                                        if (p > totalPages) return null;
                                        return (
                                            <button
                                                key={p}
                                                className={`pagination-btn ${currentPage === p ? "active" : ""}`}
                                                onClick={() => setCurrentPage(p)}
                                            >
                                                {p}
                                            </button>
                                        );
                                    });
                                })()}
                            </div>

                            <button
                                className="pagination-btn icon-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                title="Berikutnya"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                className="pagination-btn icon-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                                title="Halaman Terakhir"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
