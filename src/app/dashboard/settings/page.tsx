"use client";

import { Key, Save } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [saved, setSaved] = useState(false);

    return (
        <>
            <div className="page-header">
                <h1>⚙️ Settings</h1>
                <p>Konfigurasi bisnis dan API key Anda.</p>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <h2>Profil Bisnis</h2>
                </div>
                <div style={{ display: "grid", gap: 16, maxWidth: 500 }}>
                    <div>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Nama Bisnis</label>
                        <input className="chat-input" defaultValue="Warung Kopi Nusantara" />
                    </div>
                    <div>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Alamat</label>
                        <input className="chat-input" defaultValue="Jl. Merdeka No. 45, Denpasar, Bali" />
                    </div>
                    <button className="btn-primary" style={{ width: "fit-content" }} onClick={() => setSaved(true)}>
                        <Save size={18} /> {saved ? "Tersimpan ✓" : "Simpan"}
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <h2>🔑 API Configuration</h2>
                </div>
                <div style={{ display: "grid", gap: 16, maxWidth: 500 }}>
                    <div>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Google Gemini API Key</label>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input className="chat-input" type="password" placeholder="AIza..." defaultValue="configured-in-env" />
                            <button className="btn-secondary"><Key size={16} /></button>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                            Dapatkan API key dari{" "}
                            <a href="https://aistudio.google.com/apikey" target="_blank" style={{ color: "var(--accent-primary-hover)" }}>
                                Google AI Studio
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>ℹ️ Tentang</h2>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.8 }}>
                    <p><strong>BizAutomate AI</strong> v2.0</p>
                    <p>AI-powered business automation dashboard built with:</p>
                    <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                        <li>Next.js 14 + React 18 + TypeScript</li>
                        <li>Google Gemini AI (Vision + Text)</li>
                        <li>Vercel AI SDK</li>
                        <li>Prisma + SQLite</li>
                        <li>Recharts</li>
                    </ul>
                    <p style={{ marginTop: 12 }}>Built for PARAS ICT XI — Web Programming Competition 2026</p>
                </div>
            </div>
        </>
    );
}
