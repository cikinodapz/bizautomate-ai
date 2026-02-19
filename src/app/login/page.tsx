"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, LogIn, Sparkles } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login gagal.");
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
                    <h1>Selamat Datang Kembali</h1>
                    <p>Masuk ke akun VeltrixAI Anda</p>
                </div>

                {error && (
                    <div className="auth-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
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
                            autoFocus
                        />
                    </div>

                    <div className="auth-field">
                        <label>
                            <Lock size={14} />
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
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
                                Memproses...
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Masuk
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Belum punya akun?{" "}
                        <Link href="/register">Daftar Sekarang</Link>
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
