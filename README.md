# LIMMS (VEXORA) — Laboratory Inventory and Maintenance Management System

**LIMMS** (*Laboratory Inventory and Maintenance Management System*) adalah aplikasi web pengelolaan inventaris, peminjaman/booking, pengembalian, pemeliharaan berkala, pelaporan kerusakan, dan pelaporan operasional aset laboratorium perguruan tinggi (**Sistem Informasi, Universitas Hasanuddin · 2026**).

Sistem ini dirancang agar pencatatan aset fisik laboratorium tetap konsisten, terlacak dari awal pengajuan hingga pengembalian, terhindar dari jadwal peminjaman yang bentrok, serta memudahkan laboran dan administrator memantau kondisi perangkat secara real-time.

---

## Fitur Utama

### 1. Landing Page & Autentikasi
- **Halaman Publik (`/`)**: Menampilkan statistik langsung dari database (total aset tercatat, aset sedang dipinjam, laporan kerusakan terbuka, jadwal pemeliharaan pekan ini), daftar kategori, panel modul interaktif, penjelasan peran, dan panduan singkat alur demo.
- **Autentikasi Sesi (`/masuk`, `/daftar`)**: Login menggunakan email & kata sandi ter-hash (`bcrypt`) dengan cookie sesi ter-sign (`HMAC-SHA256`, `HttpOnly`), serta halaman daftar akun publik (otomatis berperan `Peminjam`).
- **Profil Akun (`/profil`)**: Semua peran dapat memperbarui nama lengkap dan mengubah kata sandi akun masing-masing.

### 2. Dashboard Berbasis Peran (`/dashboard`)
- **Dashboard Staf (Administrator & Laboran)**: Ringkasan total aset, unit tersedia, sedang dipinjam, peminjaman terlambat, grafik distribusi kondisi aset & aset per kategori, daftar peminjaman aktif/menunggu, kotak **Perlu tindakan**, dan jadwal pemeliharaan 7 hari ke depan.
- **Dashboard Peminjam**: Ringkasan jumlah peminjaman aktif, pengajuan menunggu persetujuan, notifikasi belum dibaca, serta daftar peminjaman dan notifikasi terbaru milik pengguna.

### 3. Inventaris Aset & Data Referensi (`/aset`, `/referensi`)
- **Daftar & Pencarian Aset (`/aset`)**: Pencarian kode/nama aset, filter kategori, lokasi, kondisi, dan status operasional, pagination, serta tampilan responsif (tabel desktop dan kartu mobile).
- **Registrasi, Ubah & Detail Aset (`/aset/baru`, `/aset/[id]`, `/aset/[id]/ubah`)**: Kode aset unik, foto kondisi aset (JPG/PNG/WebP maks 5 MB), riwayat peminjaman, jadwal pemeliharaan, laporan kerusakan terkait, tombol tindakan cepat, serta aksi **Nonaktifkan/Aktifkan** dan **Hapus aset** (dengan proteksi otomatis apabila aset sudah memiliki riwayat transaksi).
- **Kategori & Lokasi (`/referensi`)**: Pengelolaan data referensi pengelompokan dan lokasi ruangan aset, lengkap dengan jumlah aset terkait dan proteksi hapus bila masih digunakan.

### 4. Booking & Peminjaman Multi-Aset (`/peminjaman`, `/peminjaman/baru`, `/peminjaman/[id]`)
- **Booking dengan Cek Bentrok Tanggal**: Pengguna memilih rentang tanggal (`loan_date` – `expected_return_date`) terlebih dahulu; sistem menandai jadwal yang bentrok dan mencegah pemesanan tumpang tindih baik di sisi UI maupun transaksi database (`FOR UPDATE`).
- **Alur Status Terstruktur**: Stepper visual dari `Menunggu` → `Disetujui` → `Dipinjam` → `Selesai` (termasuk status `Ditolak`, `Dibatalkan`, dan deteksi otomatis `Terlambat`).
- **Catat Pinjam Langsung & Pencarian**: Staf dapat mencatat peminjaman langsung diserahkan (*direct borrow*) atas nama peminjam, serta mencari transaksi berdasarkan kode pinjam, nama peminjam, atau keperluan.

### 5. Pengembalian Per Item (`/pengembalian`)
- **Pengembalian Per Unit Aset**: Laboran/administrator mencatat pengembalian tiap item beserta kondisi setelah kembali (`Baik`, `Perlu perhatian`, `Rusak`), catatan kelengkapan, dan **foto bukti kondisi pengembalian**.
- **Sinkronisasi Otomatis**: Jika aset kembali dengan kondisi `Rusak`, status aset otomatis berubah ke `Pemeliharaan` disertai pintasan untuk membuat laporan kerusakan; transaksi peminjaman otomatis ditandai `Selesai` saat seluruh item telah dikembalikan.

### 6. Pemeliharaan & Pelaporan Kerusakan (`/pemeliharaan`, `/kerusakan`)
- **Jadwal Pemeliharaan (`/pemeliharaan`)**: Tampilan **Daftar** dan **Kalender** bulanan (lengkap dengan navigasi antarbulan), penugasan penanggung jawab, pilihan pengingat (Hari H, H-1, H-3), dan transisi status (`Terjadwal` → `Berlangsung` → `Selesai` / `Dibatalkan`) yang menyinkronkan status aset.
- **Pelaporan Kerusakan (`/kerusakan`)**: Semua peran dapat melaporkan kerusakan peralatan lengkap dengan **foto bukti kerusakan**; tersedia pencarian, filter status laporan, dan panel tindak lanjut staf untuk memperbarui status penanganan sekaligus kondisi fisik aset.

### 7. Notifikasi In-App Otomatis (`/notifikasi`)
- Pemberitahuan otomatis tercatat di database untuk:
  - Pengajuan peminjaman baru (ke Administrator & Laboran).
  - Persetujuan, penolakan, penyerahan, dan pembatalan peminjaman (ke Peminjam / Staf).
  - Pengembalian aset beserta kondisi akhirnya (ke Peminjam).
  - Pengingat otomatis jatuh tempo pengembalian hari ini & peminjaman terlambat (ke Peminjam & Staf).
  - Laporan kerusakan baru (ke Staf) dan pembaruan status penanganan kerusakan (ke Pelapor).
  - Penjadwalan pemeliharaan berkala (ke Penanggung Jawab).
- Dilengkapi filter semua/belum dibaca, badge jumlah belum dibaca di sidebar, serta tautan langsung menuju transaksi/laporan/jadwal terkait.

### 8. Laporan Operasional (`/laporan`)
- Empat tab laporan: **Inventaris**, **Pemeliharaan**, **Kerusakan**, dan **Peminjaman**.
- Mendukung **filter rentang tanggal**, **kategori aset**, dan **status** yang diterapkan pada ringkasan statistik, tabel pratinjau, mode **Cetak / PDF**, dan **Ekspor CSV**.

### 9. Manajemen Pengguna (`/pengguna`) — Khusus Administrator
- Tambah akun baru, pencarian nama/email, filter peran dan status akun, ubah peran, aktif/nonaktifkan akun (tanpa menghapus riwayat transaksi), serta fitur **Reset kata sandi** oleh administrator.

---

## Peran Pengguna & Hak Akses

| Modul / Aksi | Administrator | Laboran | Peminjam |
| :--- | :---: | :---: | :---: |
| Dashboard ringkasan | Penuh | Penuh | Pribadi |
| Lihat daftar & detail aset | Ya | Ya | Ya |
| Tambah, ubah, nonaktifkan, hapus aset | Ya | Ya | — |
| Kelola Kategori & Lokasi | Ya | Ya | — |
| Ajukan / booking peminjaman | Ya | Ya | Ya |
| Setujui, tolak, serahkan & catat pengembalian | Ya | Ya | — |
| Kelola jadwal pemeliharaan | Ya | Ya | — |
| Buat laporan kerusakan (dengan foto) | Ya | Ya | Ya |
| Tindak lanjuti laporan kerusakan | Ya | Ya | — |
| Lihat notifikasi & ubah profil | Ya | Ya | Ya |
| Laporan operasional, cetak PDF & ekspor CSV | Ya | Ya | — |
| Kelola pengguna & reset kata sandi | Ya | — | — |

---

## Teknologi yang Digunakan

- **Framework**: Next.js 16 (App Router & Turbopack)
- **UI Library**: React 19, Tailwind CSS v4, Lucide React
- **Database**: PostgreSQL dengan driver `pg` (SQL terstruktur & transaksi eksplisit tanpa ORM)
- **Keamanan**: `bcryptjs` (hashing kata sandi) dan cookie sesi `HMAC-SHA256`

---

## Struktur Proyek Ringkas

```text
├── db/
│   ├── schema.sql          # Skema tabel, constraint, indeks, dan migrasi kolom
│   └── seed.mjs            # Script inisialisasi skema & data contoh sintetis
├── public/images/          # Gambar statis landing page & halaman masuk/daftar
├── src/
│   ├── app/
│   │   ├── (publik)/       # Landing page (/), masuk (/masuk), daftar (/daftar)
│   │   ├── (aplikasi)/     # Halaman aplikasi terautentikasi
│   │   └── api/            # REST API routes (assets, loans, returns, maintenance, damage-reports, notifications, uploads, users, auth)
│   ├── components/
│   │   ├── app/            # Komponen fitur aplikasi (form, tabel, filter, aksi)
│   │   ├── landing/        # Komponen landing page
│   │   └── ui/             # Primitif UI (Button, Card, Drawer, Modal, Combobox, ImageUpload, dll.)
│   └── lib/                # Koneksi DB & auto-migrasi, autentikasi, helper format, status, notifikasi
└── uploads/                # Direktori penyimpanan lokal foto upload (diabaikan git)
```

---

## Cara Menjalankan Secara Lokal

### Prasyarat
- Node.js 20+
- PostgreSQL 14+

### Langkah Instalasi

1. **Instal dependensi**
   ```bash
   npm install
   ```

2. **Konfigurasi variabel lingkungan**
   Buat file `.env.local` di root proyek:
   ```env
   DATABASE_URL=postgresql://postgres:password_anda@localhost:5432/limms
   AUTH_SECRET=ganti-dengan-secret-acak-yang-aman
   ```

3. **Buat database PostgreSQL dan jalankan skema + seed data**
   ```bash
   createdb limms
   node db/seed.mjs
   ```
   *(Script `db/seed.mjs` otomatis menerapkan `db/schema.sql` dan mengisi data awal jika tabel `users` masih kosong.)*

4. **Jalankan server pengembangan**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

5. **Perintah lainnya**
   ```bash
   npm run lint    # Menjalankan ESLint
   npm run build   # Build produksi Next.js
   npm run start   # Menjalankan hasil build produksi
   ```

---

## Daftar Akun Demo

Data contoh hasil `node db/seed.mjs` menyediakan akun berikut untuk mencoba setiap peran:

| Peran | Nama | Email | Kata Sandi |
| :--- | :--- | :--- | :--- |
| **Administrator** | Rina Pratama | `admin@limms.ac.id` | `admin123` |
| **Laboran** | Budi Santoso | `laboran@limms.ac.id` | `laboran123` |
| **Peminjam** | Andi Wijaya | `mahasiswa@limms.ac.id` | `mhs123` |
| **Peminjam** | Siti Rahma | `siti.rahma@limms.ac.id` | `mhs123` |
