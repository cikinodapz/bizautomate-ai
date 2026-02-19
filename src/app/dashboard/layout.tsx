"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
    Menu,
    X,
    LogOut,
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
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Close sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSidebarOpen(false);
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
        } catch {
            setLoggingOut(false);
        }
    };

    return (
        <div className="dashboard-wrapper">
            {/* Mobile header bar */}
            <header className="mobile-header">
                <button
                    className="mobile-menu-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
                <Link href="/" className="mobile-logo">
                    <Image src="/logo.png" alt="VeltrixAI" width={32} height={32} />
                    VeltrixAI
                </Link>
                <div style={{ width: 40 }} /> {/* spacer for centering */}
            </header>

            {/* Sidebar overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
                <div className="sidebar-top">
                    <Link href="/" className="sidebar-logo">
                        <Image src="/logo.png" alt="VeltrixAI" width={50} height={50} className="logo-icon" />
                        VeltrixAI
                    </Link>
                    <button
                        className="sidebar-close-btn"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close menu"
                    >
                        <X size={22} />
                    </button>
                </div>

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

                <div className="sidebar-bottom">
                    <button
                        className="sidebar-logout-btn"
                        onClick={handleLogout}
                        disabled={loggingOut}
                    >
                        <LogOut size={18} />
                        {loggingOut ? "Keluar..." : "Keluar"}
                    </button>
                </div>
            </aside>

            <main className="main-content">{children}</main>
        </div>
    );
}

