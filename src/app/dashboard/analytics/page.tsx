"use client";

import { useEffect, useState } from "react";
import {
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Lightbulb,
    BarChart,
    AlertTriangle,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart as ReBarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface AnalyticsData {
    salesTrend: { date: string; revenue: number }[];
    topProducts: { name: string; count: number; revenue: number }[];
    categoryBreakdown: { name: string; value: number }[];
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
}

const COLORS = ["#6366f1", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#38bdf8"];

function formatRupiah(num: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num);
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [period, setPeriod] = useState("30");
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<string[]>([]);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/analytics/detail?period=${period}`)
            .then((res) => res.json())
            .then((d) => {
                setData(d);
                setLoading(false);
                generateInsights(d);
            })
            .catch(() => setLoading(false));
    }, [period]);

    const generateInsights = (d: AnalyticsData) => {
        const ins: string[] = [];
        if (d.topProducts.length > 0) {
            ins.push(
                `📈 Produk terlaris: ${d.topProducts[0].name} dengan ${d.topProducts[0].count} unit terjual (${formatRupiah(d.topProducts[0].revenue)}).`
            );
        }
        if (d.totalOrders > 0) {
            ins.push(
                `💰 Rata-rata nilai transaksi: ${formatRupiah(d.avgOrderValue)} dari total ${d.totalOrders} pesanan.`
            );
        }
        if (d.salesTrend.length > 7) {
            const lastWeek = d.salesTrend.slice(-7).reduce((s, d) => s + d.revenue, 0);
            const prevWeek = d.salesTrend.slice(-14, -7).reduce((s, d) => s + d.revenue, 0);
            if (prevWeek > 0) {
                const change = ((lastWeek - prevWeek) / prevWeek) * 100;
                ins.push(
                    change >= 0
                        ? `📊 Penjualan minggu ini naik ${change.toFixed(1)}% dibanding minggu lalu.`
                        : `⚠️ Penjualan minggu ini turun ${Math.abs(change).toFixed(1)}% dibanding minggu lalu.`
                );
            }
        }
        if (d.categoryBreakdown.length > 0) {
            const top = d.categoryBreakdown.sort((a, b) => b.value - a.value)[0];
            const total = d.categoryBreakdown.reduce((s, c) => s + c.value, 0);
            const pct = ((top.value / total) * 100).toFixed(0);
            ins.push(
                `🏷️ Kategori ${top.name} mendominasi ${pct}% dari total penjualan.`
            );
        }
        setInsights(ins);
    };

    if (loading) {
        return (
            <div className="empty-state">
                <div className="loading-dots"><span></span><span></span><span></span></div>
                <p>Memuat analytics...</p>
            </div>
        );
    }

    if (!data) return <div className="empty-state"><p>Belum ada data</p></div>;

    return (
        <>
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1>📊 Analytics Dashboard</h1>
                    <p>Analisis mendalam performa bisnis Anda.</p>
                </div>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    style={{
                        padding: "8px 16px",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                        borderRadius: 8,
                        color: "var(--text-primary)",
                        fontSize: "0.85rem",
                    }}
                >
                    <option value="7">7 Hari</option>
                    <option value="14">14 Hari</option>
                    <option value="30">30 Hari</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="stat-cards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Total Revenue</span>
                        <div className="stat-card-icon revenue"><DollarSign size={20} /></div>
                    </div>
                    <div className="stat-card-value">{formatRupiah(data.totalRevenue)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Total Pesanan</span>
                        <div className="stat-card-icon orders"><ShoppingCart size={20} /></div>
                    </div>
                    <div className="stat-card-value">{data.totalOrders}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Rata-rata Order</span>
                        <div className="stat-card-icon avg"><TrendingUp size={20} /></div>
                    </div>
                    <div className="stat-card-value">{formatRupiah(data.avgOrderValue)}</div>
                </div>
            </div>

            <div className="analytics-grid">
                {/* Sales Trend */}
                <div className="card full-width">
                    <div className="card-header">
                        <h2>Tren Penjualan</h2>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.salesTrend}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                                <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f1f1f7" }}
                                    formatter={(value) => [formatRupiah(Number(value)), "Revenue"]}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="card">
                    <div className="card-header">
                        <h2>Top Produk</h2>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={data.topProducts.slice(0, 6)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis type="number" stroke="#6b7280" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={11} width={120} />
                                <Tooltip
                                    contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f1f1f7" }}
                                    formatter={(value) => [formatRupiah(Number(value)), "Revenue"]}
                                />
                                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
                            </ReBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="card">
                    <div className="card-header">
                        <h2>Kategori Penjualan</h2>
                    </div>
                    <div className="chart-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categoryBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.categoryBreakdown.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f1f1f7" }}
                                    formatter={(value) => [formatRupiah(Number(value)), "Revenue"]}
                                />
                                <Legend
                                    wrapperStyle={{ color: "#9ca3af", fontSize: 12 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Insights */}
                <div className="card full-width">
                    <div className="card-header">
                        <h2>💡 AI Insights</h2>
                    </div>
                    {insights.map((insight, i) => (
                        <div key={i} className="insight-item">
                            <div className={`insight-icon ${insight.includes("⚠️") ? "down" : insight.includes("📈") ? "up" : "info"}`}>
                                {insight.includes("⚠️") ? (
                                    <AlertTriangle size={16} />
                                ) : insight.includes("📈") ? (
                                    <BarChart size={16} />
                                ) : (
                                    <Lightbulb size={16} />
                                )}
                            </div>
                            <div className="insight-text">{insight}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
