import Link from "next/link";
import {
  Bot,
  Camera,
  BarChart3,
  FileText,
  ArrowRight,
  Sparkles,
  Zap,
  ChevronRight,
  Shield,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav animate-in">
        <Link href="/" className="landing-logo">
          <span className="logo-icon">⚡</span>
          BizAutomate AI
        </Link>
        <ul className="landing-nav-links">
          <li><a href="#features">Fitur</a></li>
          <li><a href="#how">Cara Kerja</a></li>
          <li><Link href="/dashboard" className="btn-primary">Mulai Sekarang <ArrowRight size={16} /></Link></li>
        </ul>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-glow-bg"></div>
        <div className="hero-content">
          <div className="hero-badge animate-in delay-100">
            <Sparkles size={14} />
            Powered by Google Gemini AI
          </div>
          <h1 className="hero-title animate-in delay-200">
            Automate Your Business with{" "}
            <span className="gradient-text">AI Power</span>
          </h1>
          <p className="hero-subtitle animate-in delay-300">
            Dari foto struk sampai analisis bisnis — semua dalam satu platform.
            Asisten bisnis AI yang memahami bahasa Indonesia dan data Anda.
          </p>
          <div className="hero-buttons animate-in delay-300">
            <Link href="/dashboard" className="btn-primary">
              <Zap size={18} />
              Coba Gratis Sekarang
            </Link>
            <a href="#features" className="btn-secondary">
              Pelajari Fitur
              <ChevronRight size={16} />
            </a>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="hero-preview animate-in delay-300">
            <div className="hero-preview-window">
              <div className="preview-toolbar">
                <span className="preview-dot red"></span>
                <span className="preview-dot yellow"></span>
                <span className="preview-dot green"></span>
                <span className="preview-title">BizAutomate AI — Dashboard</span>
              </div>
              <div className="preview-content">
                <div className="preview-sidebar">
                  <div className="preview-sidebar-item active"></div>
                  <div className="preview-sidebar-item"></div>
                  <div className="preview-sidebar-item"></div>
                  <div className="preview-sidebar-item"></div>
                  <div className="preview-sidebar-item"></div>
                </div>
                <div className="preview-main">
                  <div className="preview-stats-row">
                    <div className="preview-stat-card"></div>
                    <div className="preview-stat-card"></div>
                    <div className="preview-stat-card"></div>
                    <div className="preview-stat-card"></div>
                  </div>
                  <div className="preview-chart"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stats-item animate-in delay-100">
            <div className="stats-icon"><TrendingUp size={22} /></div>
            <div className="stats-value">4</div>
            <div className="stats-label">Fitur AI Terintegrasi</div>
          </div>
          <div className="stats-item animate-in delay-200">
            <div className="stats-icon"><Clock size={22} /></div>
            <div className="stats-value">10x</div>
            <div className="stats-label">Lebih Cepat dari Manual</div>
          </div>
          <div className="stats-item animate-in delay-200">
            <div className="stats-icon"><Shield size={22} /></div>
            <div className="stats-value">100%</div>
            <div className="stats-label">Data Lokal & Aman</div>
          </div>
          <div className="stats-item animate-in delay-300">
            <div className="stats-icon"><Users size={22} /></div>
            <div className="stats-value">UMKM</div>
            <div className="stats-label">Dirancang Khusus</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <h2 className="section-title animate-in">4 Pilar AI untuk Bisnis Anda</h2>
        <p className="section-subtitle animate-in delay-100">
          Setiap fitur dirancang untuk menghilangkan tugas repetitif dan memberikan
          insight yang actionable.
        </p>
        <div className="features-grid">
          <div className="feature-card animate-in delay-100">
            <div className="feature-icon chat"><Bot size={28} /></div>
            <h3>AI Business Chatbot</h3>
            <p>
              Tanya apa saja soal bisnis Anda dalam bahasa natural. AI menjawab
              berdasarkan data nyata — revenue, produk terlaris, tren penjualan,
              hingga rekomendasi strategi.
            </p>
          </div>
          <div className="feature-card animate-in delay-200">
            <div className="feature-icon scan"><Camera size={28} /></div>
            <h3>AI Receipt Scanner</h3>
            <p>
              Foto struk atau nota → AI langsung extract semua data secara otomatis
              menggunakan Gemini Vision. Tanpa ketik manual, data langsung masuk ke
              sistem.
            </p>
          </div>
          <div className="feature-card animate-in delay-300">
            <div className="feature-icon analytics"><BarChart3 size={28} /></div>
            <h3>AI Analytics Dashboard</h3>
            <p>
              Visualisasi data bisnis dengan chart interaktif. AI menganalisis tren,
              mendeteksi anomali, dan memberikan prediksi penjualan secara otomatis
              untuk keputusan yang lebih baik.
            </p>
          </div>
          <div className="feature-card animate-in delay-300">
            <div className="feature-icon docs"><FileText size={28} /></div>
            <h3>AI Document Generator</h3>
            <p>
              Generate invoice, laporan penjualan, dan ringkasan bisnis secara
              otomatis. Cukup satu klik, dokumen profesional siap download dalam format PDF.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="how-section">
        <h2 className="section-title animate-in">Cara Kerjanya Simpel</h2>
        <p className="section-subtitle animate-in delay-100">
          Tiga langkah mudah untuk transformasi digital bisnis Anda.
        </p>
        <div className="how-container">
          <div className="how-connector"></div>
          <div className="how-steps">
            <div className="how-step animate-in delay-100">
              <div className="how-step-header">
                <div className="how-step-number">1</div>
                <div className="how-step-icon"><Zap size={20} /></div>
              </div>
              <h3>Input Data</h3>
              <p>
                Tambahkan produk & transaksi manual, atau cukup foto struk
                dengan AI Scanner kami yang canggih.
              </p>
            </div>
            <div className="how-step animate-in delay-200 alternate">
              <div className="how-step-header">
                <div className="how-step-number">2</div>
                <div className="how-step-icon"><Bot size={20} /></div>
              </div>
              <h3>AI Analisis</h3>
              <p>
                AI otomatis menganalisis data Anda 24/7 — menemukan tren, insight, prediksi, dan
                memberikan rekomendasi strategi bisnis.
              </p>
            </div>
            <div className="how-step animate-in delay-300">
              <div className="how-step-header">
                <div className="how-step-number">3</div>
                <div className="how-step-icon"><TrendingUp size={20} /></div>
              </div>
              <h3>Take Action</h3>
              <p>
                Generate laporan instan, ambil keputusan berbasis data, dan tingkatkan
                profitabilitas bisnis Anda dengan percaya diri.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-box animate-in">
          <h2>Siap Mengotomasi Bisnis Anda?</h2>
          <p>
            Mulai sekarang dan rasakan bagaimana AI bisa menghemat waktu dan
            meningkatkan produktivitas bisnis Anda hingga 10x lipat.
          </p>
          <Link href="/dashboard" className="btn-primary">
            <Zap size={18} />
            Mulai Sekarang — Gratis 14 Hari
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          © 2026 BizAutomate AI · Powered by Google Gemini · Built for PARAS ICT XI
        </p>
      </footer>
    </div>
  );
}
