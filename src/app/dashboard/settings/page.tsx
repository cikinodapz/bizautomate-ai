"use client";

import { Save, Loader2, CheckCircle, Store, Info, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/business")
            .then((r) => r.json())
            .then((data) => {
                if (data.business) {
                    setName(data.business.name || "");
                    setAddress(data.business.address || "");
                }
            })
            .catch(() => setError("Gagal memuat data bisnis"))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            const res = await fetch("/api/business", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, address }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Gagal menyimpan");
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menyimpan");
        } finally {
            setSaving(false);
        }
    };

    const techStack = [
        { name: "Next.js 14", desc: "React Framework" },
        { name: "Google Gemini", desc: "AI Engine" },
        { name: "TypeScript", desc: "Type Safety" },
        { name: "PostgreSQL", desc: "Database" },
        { name: "Prisma", desc: "ORM" },
        { name: "Recharts", desc: "Visualisasi" },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>⚙️ Pengaturan</h1>
                <p>Kelola profil bisnis dan informasi aplikasi Anda.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

                {/* Business Profile - Left */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 16,
                    border: '1px solid var(--border-primary)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid var(--border-primary)',
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'rgba(255,255,255,0.02)'
                    }}>
                        <Store size={20} style={{ color: 'var(--accent-primary)' }} />
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Profil Bisnis</h2>
                    </div>

                    <div style={{ padding: '24px' }}>
                        {loading ? (
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: 10, color: 'var(--text-muted)', padding: '40px 0'
                            }}>
                                <Loader2 size={20} className="spin" /> Memuat...
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label style={{
                                        fontSize: "0.8rem", fontWeight: 600,
                                        color: "var(--text-muted)", display: "block",
                                        marginBottom: 8, textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Nama Bisnis
                                    </label>
                                    <input
                                        className="search-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Masukkan nama bisnis"
                                        style={{
                                            width: '100%', padding: '12px 16px',
                                            fontSize: '0.95rem', borderRadius: 10
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        fontSize: "0.8rem", fontWeight: 600,
                                        color: "var(--text-muted)", display: "block",
                                        marginBottom: 8, textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Alamat
                                    </label>
                                    <input
                                        className="search-input"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Masukkan alamat bisnis"
                                        style={{
                                            width: '100%', padding: '12px 16px',
                                            fontSize: '0.95rem', borderRadius: 10
                                        }}
                                    />
                                </div>

                                {error && (
                                    <div style={{
                                        padding: '10px 14px', background: 'rgba(239,68,68,0.08)',
                                        border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10,
                                        color: '#f87171', fontSize: '0.85rem',
                                        display: 'flex', alignItems: 'center', gap: 8
                                    }}>
                                        ⚠️ {error}
                                    </div>
                                )}

                                <button
                                    className="btn-primary"
                                    style={{
                                        width: "fit-content", display: 'flex',
                                        alignItems: 'center', gap: 8,
                                        padding: '10px 24px', borderRadius: 10,
                                        marginTop: 4
                                    }}
                                    onClick={handleSave}
                                    disabled={saving || !name.trim()}
                                >
                                    {saving ? (
                                        <><Loader2 size={16} className="spin" /> Menyimpan...</>
                                    ) : saved ? (
                                        <><CheckCircle size={16} /> Tersimpan!</>
                                    ) : (
                                        <><Save size={16} /> Simpan Perubahan</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* About - Right */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 16,
                    border: '1px solid var(--border-primary)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid var(--border-primary)',
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'rgba(255,255,255,0.02)'
                    }}>
                        <Info size={20} style={{ color: 'var(--accent-primary)' }} />
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Tentang Aplikasi</h2>
                    </div>

                    <div style={{ padding: '24px' }}>
                        {/* App Identity */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            marginBottom: 20, padding: '16px 20px',
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.06) 100%)',
                            border: '1px solid rgba(99,102,241,0.15)'
                        }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'linear-gradient(135deg, var(--accent-primary), #a78bfa)',
                                fontSize: '1.3rem', flexShrink: 0
                            }}>
                                ⚡
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: 1.3 }}>
                                    BizAutomate AI
                                </p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Versi 2.0</p>
                            </div>
                        </div>

                        <p style={{
                            color: 'var(--text-secondary)', fontSize: '0.88rem',
                            lineHeight: 1.7, marginBottom: 20
                        }}>
                            Platform otomasi bisnis berbasis AI untuk UMKM Indonesia.
                            Ditenagai oleh Google Gemini untuk pengalaman yang cerdas dan efisien.
                        </p>

                        {/* Tech Stack Grid */}
                        <div>
                            <p style={{
                                fontWeight: 600, fontSize: '0.75rem',
                                textTransform: 'uppercase', letterSpacing: '1px',
                                color: 'var(--text-muted)', marginBottom: 12,
                                display: 'flex', alignItems: 'center', gap: 6
                            }}>
                                <Sparkles size={12} /> Teknologi
                            </p>
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr',
                                gap: 8
                            }}>
                                {techStack.map((tech) => (
                                    <div key={tech.name} style={{
                                        padding: '10px 14px', borderRadius: 10,
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-primary)',
                                        transition: 'border-color 0.2s'
                                    }}>
                                        <p style={{
                                            fontSize: '0.85rem', fontWeight: 600,
                                            color: 'var(--text-primary)', lineHeight: 1.3
                                        }}>
                                            {tech.name}
                                        </p>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)', marginTop: 2
                                        }}>
                                            {tech.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
