# 🚀 VeltrixAI — Platform Otomasi Bisnis Berbasis AI

<div align="center">

**Kelola produk, catat transaksi, scan struk otomatis, hingga generate laporan bisnis — semua ditenagai AI dalam satu platform.**

Powered by **Google Gemini AI** · Built with **Next.js 14** · Database **PostgreSQL + Prisma**

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Proyek](#-struktur-proyek)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup](#-instalasi--setup)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [API Endpoints](#-api-endpoints)

---

## 💡 Tentang Proyek

**VeltrixAI** adalah platform otomasi bisnis berbasis AI yang dirancang khusus untuk **UMKM Indonesia**. Aplikasi ini mengintegrasikan kecerdasan buatan Google Gemini untuk membantu pelaku usaha mengelola bisnis mereka secara lebih efisien — mulai dari pencatatan transaksi, analisis penjualan, hingga pembuatan dokumen bisnis profesional secara otomatis.

### Mengapa VeltrixAI?

| Masalah | Solusi VeltrixAI |
|---------|-----------------|
| Pencatatan manual yang rawan kesalahan | ✅ Input data otomatis via scan struk AI |
| Sulit menganalisis tren penjualan | ✅ Dashboard analitik dengan visualisasi interaktif |
| Membuat laporan bisnis memakan waktu | ✅ Generate dokumen DOCX instan dengan satu klik |
| Tidak ada wawasan bisnis real-time | ✅ AI Chat yang menjawab berdasarkan data bisnis nyata |

---

## ✨ Fitur Utama

### 1. 📊 Dashboard
- Ringkasan statistik bisnis (revenue, transaksi, produk, pengeluaran)
- Grafik tren penjualan harian
- Produk terlaris & insight AI
- Quick actions ke semua fitur

### 2. 🤖 AI Chat Bisnis
- Tanya jawab dalam bahasa natural tentang bisnis Anda
- AI menjawab berdasarkan data nyata dari database
- Konteks data: pendapatan, produk, transaksi, tren penjualan
- Multi-session dengan riwayat percakapan

### 3. 📸 Scan Struk AI (Gemini Vision)
- Upload foto struk / nota belanja
- AI secara otomatis mengekstrak semua data (toko, tanggal, item, total)
- Simpan hasil scan langsung ke database
- Riwayat scan tersimpan

### 4. 📈 Analitik AI
- Visualisasi data dengan chart interaktif (Recharts)
- Tren pendapatan harian
- Distribusi kategori produk
- Produk terlaris
- AI-generated insight & rekomendasi otomatis

### 5. 📄 Generator Dokumen AI
- **Invoice** — Faktur penjualan dari transaksi terbaru
- **Laporan Penjualan** — Laporan lengkap dengan analisis AI
- **Ringkasan Bisnis** — Executive summary performa keseluruhan
- Opsi kustomisasi per tipe dokumen
- Output format **DOCX** (Microsoft Word)
- Riwayat dokumen yang pernah digenerate (dengan filter & re-download)

### 6. 🛍️ Manajemen Produk
- CRUD produk (tambah, edit, hapus)
- Kategori & pencarian produk
- Monitoring stok
- Paginasi data

### 7. 💳 Manajemen Transaksi
- Catat transaksi penjualan
- Detail item per transaksi
- Filter berdasarkan tanggal & pencarian
- Paginasi data

### 8. ⚙️ Pengaturan
- Konfigurasi profil bisnis (nama, alamat, logo)
- Data bisnis digunakan di seluruh platform

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Bahasa** | TypeScript |
| **UI** | React 18, Lucide Icons |
| **Styling** | Vanilla CSS (Custom Design System) |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7 |
| **AI** | Google Gemini AI (via AI SDK) |
| **Charts** | Recharts |
| **Dokumen** | Docxtemplater + PizZip |
| **Markdown** | react-markdown |

---

## 📁 Struktur Proyek

```
bizautomate-ai/
├── prisma/
│   ├── schema.prisma          # Definisi model database
│   └── seed.ts                # Data seed awal
├── public/
│   └── logo.png               # Logo aplikasi
├── scripts/                   # Script utility
├── src/
│   ├── app/
│   │   ├── api/               # API Routes
│   │   │   ├── analytics/     # Endpoint analitik
│   │   │   ├── business/      # Endpoint profil bisnis
│   │   │   ├── chat/          # Endpoint AI chat & history
│   │   │   ├── documents/     # Endpoint generate dokumen
│   │   │   ├── products/      # Endpoint CRUD produk
│   │   │   ├── scanner/       # Endpoint scan struk
│   │   │   ├── seed/          # Endpoint seed data
│   │   │   └── transactions/  # Endpoint transaksi
│   │   ├── dashboard/         # Halaman dashboard
│   │   │   ├── analytics/     # Halaman analitik
│   │   │   ├── chat/          # Halaman AI chat
│   │   │   ├── documents/     # Halaman generator dokumen
│   │   │   ├── products/      # Halaman manajemen produk
│   │   │   ├── scanner/       # Halaman scan struk
│   │   │   ├── settings/      # Halaman pengaturan
│   │   │   ├── transactions/  # Halaman transaksi
│   │   │   ├── layout.tsx     # Layout dashboard + sidebar
│   │   │   └── page.tsx       # Halaman utama dashboard
│   │   ├── globals.css        # Styling global
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── generated/prisma/      # Prisma generated client
│   └── lib/
│       └── db.ts              # Database connection
├── templates/                 # Template DOCX
│   ├── invoice_template.docx
│   ├── sales_report_template.docx
│   └── business_summary_template.docx
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

---

## 📦 Prasyarat

Sebelum memulai, pastikan Anda sudah menginstal:

- **Node.js** v18 atau lebih baru — [Download](https://nodejs.org/)
- **PostgreSQL** v14 atau lebih baru — [Download](https://www.postgresql.org/download/)
- **Git** — [Download](https://git-scm.com/)
- **Google Gemini API Key** — Ikuti panduan di bawah 👇

### 🔑 Cara Mendapatkan Google Gemini API Key

1. **Buka Google AI Studio**
   - Kunjungi [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - Login menggunakan akun Google Anda

2. **Buat API Key**
   - Klik tombol **"Create API Key"**
   - Pilih project Google Cloud yang sudah ada, atau buat project baru dengan klik **"Create API key in new project"**
   - Tunggu beberapa detik hingga API key digenerate

3. **Salin API Key**
   - Setelah berhasil, API key akan ditampilkan (format: `AIzaSy...`)
   - Klik tombol **Copy** untuk menyalin
   - **⚠️ Simpan baik-baik!** API key hanya ditampilkan sekali

4. **Pasang di Proyek**
   - Buka file `.env` di root proyek
   - Paste API key ke variabel `GOOGLE_GENERATIVE_AI_API_KEY`:
     ```env
     GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy_your_api_key_here
     ```

> **💡 Tips:**
> - API Gemini memiliki **tier gratis** dengan kuota yang cukup untuk development dan demo
> - Untuk penggunaan production, aktifkan billing di [Google Cloud Console](https://console.cloud.google.com/)
> - Jangan share API key Anda secara publik (jangan commit ke Git!)

---

## 🔧 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/cikinodapz/bizautomate-ai.git
cd bizautomate-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root proyek (atau edit yang sudah ada):

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/bizautomate"
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

> **Catatan:** Ganti `USERNAME`, `PASSWORD`, dan `your_gemini_api_key_here` dengan kredensial masing-masing.

### 4. Setup Database

Buat database PostgreSQL terlebih dahulu:

```sql
CREATE DATABASE bizautomate;
```

Lalu jalankan migrasi Prisma:

```bash
npx prisma migrate dev
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Seed Data (Opsional)

Untuk mengisi database dengan data contoh, buka browser dan akses:

```
http://localhost:3000/api/seed
```

Atau jalankan seed script:

```bash
npx tsx prisma/seed.ts
```

---

## 🚀 Menjalankan Aplikasi

### Development Mode

```bash
npm run dev
```

Aplikasi akan berjalan di **http://localhost:3000**

### Production Build

```bash
npm run build
npm start
```

---

## ⚙️ Konfigurasi Environment

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://postgres:password@localhost:5432/bizautomate` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | API Key Google Gemini | `AIzaSy...` |

---

## 📖 Panduan Penggunaan

### Langkah Awal

1. **Buka aplikasi** di `http://localhost:3000`
2. **Klik "Mulai Sekarang"** di landing page untuk masuk ke dashboard
3. **Atur profil bisnis** di menu **Pengaturan** (nama bisnis, alamat, logo)
4. **Seed data** (opsional) via `/api/seed` untuk data contoh

### Mengelola Produk

1. Buka menu **Produk** di sidebar
2. Klik **+ Tambah Produk** untuk menambah produk baru
3. Isi nama, kategori, harga, dan stok
4. Produk bisa diedit atau dihapus kapan saja

### Mencatat Transaksi

1. Buka menu **Transaksi** di sidebar
2. Klik **+ Tambah Transaksi**
3. Pilih produk, atur jumlah, dan isi nama pelanggan
4. Pilih metode pembayaran dan simpan

### Scan Struk AI

1. Buka menu **Scanner** di sidebar
2. Upload foto struk atau gunakan kamera
3. AI akan mengekstrak data secara otomatis
4. Review hasilnya, lalu klik **Simpan ke Database**

### AI Chat

1. Buka menu **AI Chat** di sidebar
2. Ketik pertanyaan tentang bisnis Anda, contoh:
   - *"Berapa total pendapatan minggu ini?"*
   - *"Produk apa yang paling laris?"*
   - *"Apa rekomendasi untuk meningkatkan penjualan?"*
3. AI menjawab berdasarkan data bisnis nyata Anda

### Generate Dokumen

1. Buka menu **Dokumen** di sidebar
2. Pilih tipe dokumen: **Invoice**, **Laporan Penjualan**, atau **Ringkasan Bisnis**
3. Sesuaikan opsi kustomisasi (opsional)
4. Klik **Generate & Download**
5. File DOCX otomatis terdownload
6. Riwayat dokumen tersimpan dan bisa di-filter / di-download ulang

### Analitik

1. Buka menu **Analitik** di sidebar
2. Lihat grafik tren pendapatan, distribusi kategori, dan produk terlaris
3. Baca insight & rekomendasi yang digenerate AI secara otomatis

---

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/business` | Ambil data profil bisnis |
| `PUT` | `/api/business` | Update profil bisnis |
| `GET` | `/api/products` | Ambil daftar produk |
| `POST` | `/api/products` | Tambah produk baru |
| `PUT` | `/api/products` | Update produk |
| `DELETE` | `/api/products` | Hapus produk |
| `GET` | `/api/transactions` | Ambil daftar transaksi |
| `POST` | `/api/transactions` | Buat transaksi baru |
| `GET` | `/api/scanner` | Ambil riwayat scan |
| `POST` | `/api/scanner` | Scan struk baru (Gemini Vision) |
| `PUT` | `/api/scanner` | Simpan hasil scan ke database |
| `POST` | `/api/chat` | Kirim pesan ke AI chat |
| `GET` | `/api/chat/history` | Ambil daftar sesi chat |
| `GET` | `/api/chat/history/[id]` | Ambil detail sesi chat |
| `DELETE` | `/api/chat/history/[id]` | Hapus sesi chat |
| `GET` | `/api/analytics` | Ambil data analitik |
| `POST` | `/api/documents` | Generate dokumen (DOCX) |
| `GET` | `/api/seed` | Seed data contoh |

---

## 🗄️ Model Database

```
┌──────────────┐    ┌─────────────────┐    ┌──────────┐
│   Business   │───▶│   Transaction   │───▶│  Items   │
│              │    │                 │    │          │
│ • name       │    │ • date          │    │ • qty    │
│ • address    │    │ • customerName  │    │ • price  │
│ • logoUrl    │    │ • total         │    │ • subtot │
└──────┬───────┘    └─────────────────┘    └──────────┘
       │
       ├───▶ Product (name, category, price, stock)
       ├───▶ ScannedReceipt (storeName, date, total, items)
       ├───▶ ChatSession → ChatMessage (role, content)
       └───▶ ChatMessage
```

---

## 👨‍💻 Tim Pengembang

Dibuat untuk **PARAS ICT XI** oleh tim pengembang VeltrixAI.

---

<div align="center">

**⭐ Star this repo jika bermanfaat!**

Powered by **Google Gemini AI** 🤖

</div>
