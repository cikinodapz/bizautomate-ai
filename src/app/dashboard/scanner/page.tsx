"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Camera,
    Upload,
    Check,
    Loader2,
    FileWarning,
    Save,
    History,
    X,
    ChevronRight,
    Maximize,
    Zap,
    Image as ImageIcon,
    Plus,
    LayoutDashboard
} from "lucide-react";

interface ExtractedItem {
    name: string;
    qty: number;
    price: number;
}

interface ScanResult {
    id?: string;
    storeName: string | null;
    date: string | null;
    items: ExtractedItem[];
    total: number | null;
    imageUrl?: string | null;
    createdAt?: string;
}

function formatRupiah(num: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num);
}

export default function ScannerPage() {
    // Media & UI States
    const [image, setImage] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    // Camera States
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // History States
    const [history, setHistory] = useState<ScanResult[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        try {
            const res = await fetch("/api/scanner");
            const data = await res.json();
            if (data.success) {
                setHistory(data.history);
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
            setResult(null);
            setSaved(false);
            setError(null);
            setActiveHistoryId(null);
        };
        reader.readAsDataURL(file);
    };

    const startCamera = async () => {
        setCameraActive(true);
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/jpeg");
                setImage(dataUrl);
                stopCamera();
                setResult(null);
                setSaved(false);
                setActiveHistoryId(null);
            }
        }
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
                body: JSON.stringify({ ...result, image }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSaved(true);
                fetchHistory(); // Refresh history
            } else {
                setError(data.error || "Gagal menyimpan data ke database");
            }
        } catch {
            setError("Gagal menyimpan data");
        }
        setSaving(false);
    };

    const loadFromHistory = (item: ScanResult) => {
        setResult(item);
        setImage(item.imageUrl || null);
        setSaved(true);
        setError(null);
        setActiveHistoryId(item.id || null);
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h1>📸 AI Receipt Scanner</h1>
                    <span className="badge-ai"><Zap size={12} /> Gemini Vision</span>
                </div>
                <p>
                    Ubah struk fisik menjadi data digital secara instan.
                    Ambil foto atau unggah gambar untuk analisis otomatis berbasis AI.
                </p>
            </div>

            <div className="scanner-container">
                <div className="scanner-main">
                    <div className="scanner-upload-grid">
                        {/* Left Column: Input */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {!cameraActive && !image ? (
                                <div
                                    className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOver(false);
                                        const file = e.dataTransfer.files[0];
                                        if (file) handleFile(file);
                                    }}
                                >
                                    <div className="upload-options">
                                        <button className="upload-option" onClick={() => fileInputRef.current?.click()}>
                                            <div className="upload-icon-box blue">
                                                <Upload size={24} />
                                            </div>
                                            <div className="upload-text">
                                                <h4>Upload Gambar</h4>
                                                <p>Drag & drop atau klik telusuri</p>
                                            </div>
                                        </button>

                                        <div className="upload-divider">
                                            <span>atau</span>
                                        </div>

                                        <button className="upload-option" onClick={startCamera}>
                                            <div className="upload-icon-box purple">
                                                <Camera size={24} />
                                            </div>
                                            <div className="upload-text">
                                                <h4>Ambil Foto</h4>
                                                <p>Gunakan kamera perangkat</p>
                                            </div>
                                        </button>
                                    </div>
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
                            ) : cameraActive ? (
                                <div className="camera-view">
                                    <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
                                    <div className="camera-overlay" />
                                    <div className="camera-controls">
                                        <button className="btn-icon" onClick={stopCamera}>
                                            <X size={20} />
                                        </button>
                                        <button className="btn-capture" onClick={capturePhoto}>
                                            <div className="btn-capture-inner" />
                                        </button>
                                        <div style={{ width: 44 }} /> {/* Spacer */}
                                    </div>
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                </div>
                            ) : null}

                            {image && (
                                <div className="preview-container">
                                    <div className="preview-header">
                                        <h4>Preview Struk</h4>
                                        <button className="btn-close" onClick={() => { setImage(null); setResult(null); }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="scanner-preview-container">
                                        <img src={image} alt="Receipt preview" className="scanner-preview-image" />
                                        {scanning && <div className="scanner-laser" />}
                                    </div>
                                    <div style={{ marginTop: 20 }}>
                                        {!activeHistoryId && (
                                            <button
                                                className="btn-primary"
                                                onClick={scanReceipt}
                                                disabled={scanning}
                                                style={{ width: '100%', height: 48, fontSize: '1rem' }}
                                            >
                                                {scanning ? (
                                                    <><Loader2 size={20} className="spin" /> Menganalisis Struk...</>
                                                ) : (
                                                    <><Maximize size={20} /> Jalankan AI Scanning</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="error-alert">
                                    <FileWarning size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Tip Card */}
                            {!image && !cameraActive && (
                                <div style={{
                                    padding: 20,
                                    background: 'rgba(99,102,241,0.03)',
                                    border: '1px solid rgba(99,102,241,0.1)',
                                    borderRadius: 16,
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.6
                                }}>
                                    <h5 style={{ color: 'var(--accent-primary)', marginBottom: 8, fontWeight: 600 }}>💡 Tips untuk hasil terbaik:</h5>
                                    <ul style={{ paddingLeft: 16 }}>
                                        <li>Pastikan struk rata dan tidak terlipat.</li>
                                        <li>Ambil foto di ruangan dengan pencahayaan cukup.</li>
                                        <li>Posisikan kamera tepat di atas struk.</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Middle Column: Results */}
                        <div className="extraction-column">
                            <div className="card-header" style={{ padding: '20px 32px', borderBottom: '1px solid var(--border-primary)' }}>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <LayoutDashboard size={18} style={{ color: 'var(--accent-primary)' }} />
                                    Hasil Ekstraksi
                                </h2>
                            </div>

                            <div className="extraction-content">
                                {!result ? (
                                    <div className="empty-state">
                                        <div className="empty-icon-box">
                                            <ImageIcon size={32} />
                                        </div>
                                        <h3>Belum Ada Data</h3>
                                        <p className="subtext">Scan struk di sebelah kiri untuk melihat rincian belanja Anda di sini.</p>
                                    </div>
                                ) : (
                                    <div className="animate-fade-in">
                                        <div className="result-store-card">
                                            <div className="store-info-grid">
                                                <div>
                                                    <label>Nama Toko</label>
                                                    <p>{result.storeName || "Unknown"}</p>
                                                </div>
                                                <div>
                                                    <label>Tanggal Transaksi</label>
                                                    <p>{result.date ? new Date(result.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="scanner-table-container">
                                            <table className="scanner-table">
                                                <thead>
                                                    <tr>
                                                        <th>Nama Item</th>
                                                        <th className="text-center">Qty</th>
                                                        <th className="text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.items.map((item, i) => (
                                                        <tr key={i}>
                                                            <td style={{ fontWeight: 500 }}>{item.name}</td>
                                                            <td className="text-center">{item.qty}</td>
                                                            <td className="text-right" style={{ fontWeight: 600 }}>{formatRupiah(item.qty * item.price)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="result-footer">
                                            <div className="total-label">Total Pembayaran</div>
                                            <div className="total-value">{formatRupiah(result.total || 0)}</div>
                                        </div>

                                        <div style={{ marginTop: 24 }}>
                                            {saved ? (
                                                <div className="success-tag">
                                                    <Check size={20} /> Data Berhasil Disimpan
                                                </div>
                                            ) : (
                                                <button
                                                    className="btn-primary"
                                                    onClick={saveReceipt}
                                                    disabled={saving}
                                                    style={{ width: "100%", height: 48, fontSize: '1rem' }}
                                                >
                                                    {saving ? (
                                                        <><Loader2 size={20} className="spin" /> Menyimpan...</>
                                                    ) : (
                                                        <><Save size={20} /> Simpan ke Transaksi</>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: History */}
                <aside className="scanner-sidebar">
                    <div className="sidebar-header">
                        <h3><History size={18} style={{ color: 'var(--accent-primary)' }} /> Riwayat Scan</h3>
                    </div>
                    <div className="history-list">
                        {historyLoading && history.length === 0 ? (
                            <div className="history-loading">
                                <Loader2 size={28} className="spin" />
                                <p>Memuat riwayat...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="history-loading">
                                <p>Tidak ada riwayat</p>
                            </div>
                        ) : (
                            history.map((item) => (
                                <button
                                    key={item.id}
                                    className={`history-item ${activeHistoryId === item.id ? 'active' : ''}`}
                                    onClick={() => loadFromHistory(item)}
                                >
                                    <div className="history-icon">
                                        <Plus size={18} />
                                    </div>
                                    <div className="history-info">
                                        <div className="history-title">{item.storeName || "Unknown"}</div>
                                        <div className="history-meta">
                                            {item.date ? new Date(item.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }) : "N/A"}
                                            <span className="dot">•</span>
                                            {formatRupiah(item.total || 0)}
                                        </div>
                                    </div>
                                    <ChevronRight size={14} style={{ opacity: 0.4 }} />
                                </button>
                            ))
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
