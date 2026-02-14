"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    DollarSign,
    ShoppingCart,
    Package,
    TrendingUp,
    Bot,
    Camera,
    BarChart3,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface DashboardData {
    stats: {
        revenue: number;
        revenueChange: number;
        orders: number;
        ordersChange: number;
        totalProducts: number;
        avgOrderValue: number;
        avgChange: number;
    };
    dailyRevenue: { date: string; revenue: number }[];
    topProducts: { name: string; count: number; revenue: number }[];
    recentTransactions: {
        id: string;
        customerName: string;
        date: string;
        total: number;
        itemCount: number;
    }[];
}

function formatRupiah(num: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num);
}

function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics")
            .then((res) => res.json())
            .then((d) => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="empty-state">
                <div className="loading-dots">
                    <span></span><span></span><span></span>
                </div>
                <p>Memuat dashboard...</p>
            </div>
        );
    }

    if (!data || !data.stats) {
        return (
            <div className="empty-state">
                <Package size={48} />
                <h3>Belum ada data</h3>
                <p style={{ marginBottom: 16 }}>Silakan seed database terlebih dahulu.</p>
                <button
                    className="btn-primary"
                    onClick={async () => {
                        await fetch("/api/seed", { method: "POST" });
                        window.location.reload();
                    }}
                >
                    Seed Database
                </button>
            </div>
        );
    }

    const { stats, dailyRevenue, topProducts, recentTransactions } = data;

    return (
        <>
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Selamat datang kembali! Berikut ringkasan bisnis Anda.</p>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Revenue (7 hari)</span>
                        <div className="stat-card-icon revenue"><DollarSign size={20} /></div>
                    </div>
                    <div className="stat-card-value">{formatRupiah(stats.revenue)}</div>
                    <div className={`stat-card-change ${stats.revenueChange >= 0 ? "positive" : "negative"}`}>
                        {stats.revenueChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(stats.revenueChange)}% dari minggu lalu
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Total Pesanan</span>
                        <div className="stat-card-icon orders"><ShoppingCart size={20} /></div>
                    </div>
                    <div className="stat-card-value">{stats.orders}</div>
                    <div className={`stat-card-change ${stats.ordersChange >= 0 ? "positive" : "negative"}`}>
                        {stats.ordersChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(stats.ordersChange)}% dari minggu lalu
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Total Produk</span>
                        <div className="stat-card-icon products"><Package size={20} /></div>
                    </div>
                    <div className="stat-card-value">{stats.totalProducts}</div>
                    <div className="stat-card-change positive">Aktif</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Rata-rata Order</span>
                        <div className="stat-card-icon avg"><TrendingUp size={20} /></div>
                    </div>
                    <div className="stat-card-value">{formatRupiah(stats.avgOrderValue)}</div>
                    <div className={`stat-card-change ${stats.avgChange >= 0 ? "positive" : "negative"}`}>
                        {stats.avgChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(stats.avgChange)}%
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Sales Chart */}
                <div className="card">
                    <div className="card-header">
                        <h2>Tren Penjualan (7 Hari)</h2>
                        <Link href="/dashboard/analytics" className="card-action">
                            Lihat Detail →
                        </Link>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyRevenue}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    contentStyle={{
                                        background: "#1a1a2e",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: 12,
                                        color: "#f1f1f7",
                                    }}
                                    formatter={(value) => [formatRupiah(Number(value)), "Revenue"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Top Products */}
                    <div className="card">
                        <div className="card-header">
                            <h2>Top Produk</h2>
                        </div>
                        <div className="transaction-list">
                            {topProducts.map((product, i) => (
                                <div key={i} className="transaction-item">
                                    <div className="transaction-info">
                                        <div className="transaction-avatar" style={{
                                            background: i === 0 ? "linear-gradient(135deg, #fbbf24, #f59e0b)" :
                                                i === 1 ? "linear-gradient(135deg, #9ca3af, #6b7280)" :
                                                    "linear-gradient(135deg, #92400e, #78350f)"
                                        }}>
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <div className="transaction-name">{product.name}</div>
                                            <div className="transaction-time">{product.count} terjual</div>
                                        </div>
                                    </div>
                                    <div className="transaction-amount">{formatRupiah(product.revenue)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                        <div className="card-header">
                            <h2>Quick Actions</h2>
                        </div>
                        <div className="quick-actions">
                            <Link href="/dashboard/chat" className="quick-action-btn">
                                <Bot size={20} /> Tanya AI Advisor
                            </Link>
                            <Link href="/dashboard/scanner" className="quick-action-btn">
                                <Camera size={20} /> Scan Struk
                            </Link>
                            <Link href="/dashboard/analytics" className="quick-action-btn">
                                <BarChart3 size={20} /> Lihat Analytics
                            </Link>
                            <Link href="/dashboard/documents" className="quick-action-btn">
                                <FileText size={20} /> Generate Dokumen
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="card" style={{ marginTop: 24 }}>
                <div className="card-header">
                    <h2>Transaksi Terbaru</h2>
                </div>
                <div className="transaction-list">
                    {recentTransactions.map((tx) => (
                        <div key={tx.id} className="transaction-item">
                            <div className="transaction-info">
                                <div className="transaction-avatar">
                                    {tx.customerName.charAt(0)}
                                </div>
                                <div>
                                    <div className="transaction-name">{tx.customerName}</div>
                                    <div className="transaction-time">
                                        {new Date(tx.date).toLocaleDateString("id-ID")} · {formatTime(tx.date)} · {tx.itemCount} item
                                    </div>
                                </div>
                            </div>
                            <div className="transaction-amount">{formatRupiah(tx.total)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
