"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, Store, UserPlus, Sparkles } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, businessName }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registrasi gagal.");
                setLoading(false);
                return;
            }

            router.push("/dashboard");
        } catch {
            setError("Terjadi kesalahan. Coba lagi.");
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-glow" />
            <div className="auth-card">
                <div className="auth-header">
                    <Link href="/" className="auth-logo">
                        <Image src="/logo.png" alt="VeltrixAI" width={48} height={48} />
                    </Link>
                    <h1>Buat Akun Baru</h1>
                    <p>Mulai otomasi bisnis Anda dengan AI</p>
                </div>

                {error && (
                    <div className="auth-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label>
                            <User size={14} />
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            placeholder="Nama Anda"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="auth-field">
                        <label>
                            <Store size={14} />
                            Nama Bisnis
                        </label>
                        <input
                            type="text"
                            placeholder="Nama toko atau usaha Anda"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>
                            <Mail size={14} />
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>
                            <Lock size={14} />
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Minimal 6 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="spin" />
                                Membuat akun...
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Daftar
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Sudah punya akun?{" "}
                        <Link href="/login">Masuk</Link>
                    </p>
                </div>

                <div className="auth-badge">
                    <Sparkles size={12} />
                    Powered by Google Gemini AI
                </div>
            </div>
        </div>
    );
}
