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
} from "lucide-react";

const navItems = [
    {
        label: "OVERVIEW",
        items: [
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        ],
    },
    {
        label: "AI TOOLS",
        items: [
            { href: "/dashboard/chat", icon: Bot, label: "AI Chat", badge: "AI" },
            { href: "/dashboard/scanner", icon: Camera, label: "Receipt Scanner", badge: "Vision" },
            { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
            { href: "/dashboard/documents", icon: FileText, label: "Documents" },
        ],
    },
    {
        label: "MANAGEMENT",
        items: [
            { href: "/dashboard/products", icon: Package, label: "Produk" },
            { href: "/dashboard/transactions", icon: FileText, label: "Transaksi" },
            { href: "/dashboard/settings", icon: Settings, label: "Settings" },
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
