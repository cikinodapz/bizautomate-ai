"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Check, Loader2, FileWarning, Save } from "lucide-react";

interface ExtractedItem {
    name: string;
    qty: number;
    price: number;
}

interface ScanResult {
    storeName: string | null;
    date: string | null;
    items: ExtractedItem[];
    total: number | null;
}

function formatRupiah(num: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num);
}

export default function ScannerPage() {
    const [image, setImage] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
            setResult(null);
            setSaved(false);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const scanReceipt = async () => {
        if (!image) return;
        setScanning(true);
        setError(null);
        try {
            const res = await fetch("/api/scanner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image }),
            });
            const data = await res.json();
            if (data.success) {
                setResult(data.data);
            } else {
                setError(data.error || "Gagal memproses struk");
            }
        } catch {
            setError("Terjadi kesalahan saat memproses");
        }
        setScanning(false);
    };

    const saveReceipt = async () => {
        if (!result) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch("/api/scanner", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSaved(true);
            } else {
                setError(data.error || "Gagal menyimpan data ke database");
            }
        } catch {
            setError("Gagal menyimpan data");
        }
        setSaving(false);
    };

    return (
        <>
            <div className="page-header">
                <h1>📸 AI Receipt Scanner</h1>
                <p>
                    Upload foto struk atau nota — Gemini Vision AI akan membaca dan extract
                    semua data secara otomatis.
                </p>
            </div>

            <div className="scanner-layout">
                {/* Left: Upload */}
                <div>
                    <div
                        className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            const file = e.dataTransfer.files[0];
                            if (file) handleFile(file);
                        }}
                    >
                        <Camera size={48} />
                        <h3>Upload Foto Struk</h3>
                        <p>Klik atau drag & drop gambar struk/nota di sini</p>
                        <p style={{ fontSize: "0.75rem", marginTop: 4 }}>
                            Format: JPG, PNG, WEBP
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFile(file);
                            }}
                        />
                    </div>

                    {image && (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={image} alt="Receipt preview" className="preview-image" />
                            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                                <button
                                    className="btn-primary"
                                    onClick={scanReceipt}
                                    disabled={scanning}
                                    style={{ flex: 1 }}
                                >
                                    {scanning ? (
                                        <>
                                            <Loader2 size={18} className="spin" /> Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={18} /> Scan dengan AI
                                        </>
                                    )}
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        setImage(null);
                                        setResult(null);
                                        setSaved(false);
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Results */}
                <div className="extracted-data">
                    <div className="card-header">
                        <h2>Hasil Ekstraksi</h2>
                    </div>

                    {!result && !error && (
                        <div className="empty-state">
                            <FileWarning size={48} />
                            <p>Upload dan scan struk untuk melihat hasil</p>
                        </div>
                    )}

                    {error && (
                        <div
                            style={{
                                padding: 16,
                                background: "rgba(248,113,113,0.1)",
                                border: "1px solid rgba(248,113,113,0.3)",
                                borderRadius: 12,
                                color: "#f87171",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {result && (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 16,
                                    padding: "12px 16px",
                                    background: "var(--bg-input)",
                                    borderRadius: 8,
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                        Toko
                                    </div>
                                    <div style={{ fontWeight: 600 }}>
                                        {result.storeName || "Tidak terdeteksi"}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                        Tanggal
                                    </div>
                                    <div style={{ fontWeight: 600 }}>
                                        {result.date
                                            ? new Date(result.date).toLocaleDateString("id-ID")
                                            : "Tidak terdeteksi"}
                                    </div>
                                </div>
                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Harga</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.items.map((item, i) => (
                                        <tr key={i}>
                                            <td>{item.name}</td>
                                            <td>{item.qty}</td>
                                            <td>{formatRupiah(item.price)}</td>
                                            <td>{formatRupiah(item.qty * item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="extracted-total">
                                <span>Total</span>
                                <span style={{ color: "var(--success)" }}>
                                    {formatRupiah(result.total || 0)}
                                </span>
                            </div>

                            <div style={{ marginTop: 24 }}>
                                {saved ? (
                                    <button className="btn-primary" disabled style={{ width: "100%", opacity: 0.7 }}>
                                        <Check size={18} /> Data Tersimpan!
                                    </button>
                                ) : (
                                    <button
                                        className="btn-primary"
                                        onClick={saveReceipt}
                                        disabled={saving}
                                        style={{ width: "100%" }}
                                    >
                                        {saving ? (
                                            <><Loader2 size={18} /> Menyimpan...</>
                                        ) : (
                                            <><Save size={18} /> Simpan ke Database</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
