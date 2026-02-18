"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Bot,
    Camera,
    BarChart3,
    FileText,
    Package,
    Settings,
    Receipt,
    ScanLine,
} from "lucide-react";

const navItems = [
    {
        label: "UTAMA",
        items: [
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        ],
    },
    {
        label: "BISNIS",
        items: [
            { href: "/dashboard/products", icon: Package, label: "Produk" },
            { href: "/dashboard/transactions", icon: Receipt, label: "Transaksi" },
            { href: "/dashboard/scanner", icon: ScanLine, label: "Scan Struk", badge: "AI" },
        ],
    },
    {
        label: "LAPORAN & AI",
        items: [
            { href: "/dashboard/analytics", icon: BarChart3, label: "Analitik" },
            { href: "/dashboard/documents", icon: FileText, label: "Dokumen", badge: "AI" },
            { href: "/dashboard/chat", icon: Bot, label: "AI Chat", badge: "AI" },
        ],
    },
    {
        label: "LAINNYA",
        items: [
            { href: "/dashboard/settings", icon: Settings, label: "Pengaturan" },
        ],
    },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="dashboard-wrapper">
            <aside className="sidebar">
                <Link href="/" className="sidebar-logo">
                    <span className="logo-icon">⚡</span>
                    BizAutomate AI
                </Link>

                <nav className="sidebar-nav">
                    {navItems.map((section) => (
                        <div key={section.label}>
                            <div className="sidebar-section-label">{section.label}</div>
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                    {item.badge && <span className="badge">{item.badge}</span>}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>

            <main className="main-content">{children}</main>
        </div>
    );
}
