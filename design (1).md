# Design System & UI Specification — LIMMS

**Produk:** Laboratory Inventory and Maintenance Management System (LIMMS)
**Versi dokumen:** 1.0
**Tanggal:** 26 November 2026
**Acuan:** `PRD.md` v1.0, `schema.md` v1.0, dan gambar referensi landing page (tema *Spaciaz*)
**Implementasi:** Next.js (App Router) + Tailwind CSS
**Status:** Draft desain. Peran, status, dan alur persetujuan mengikuti **usulan** di PRD/schema dan masih perlu dikonfirmasi.

---

## 1. Ringkasan Arah Visual

Referensi memakai gaya **editorial-modern yang hangat dan tegas**:

- Latar putih/krem hangat dengan **kartu besar berujung sangat membulat**.
- Satu warna aksen **lime-kuning** yang dipakai hemat (tombol, ikon panah, kartu sorotan, titik penanda).
- Satu warna gelap **hijau-zaitun hampir hitam** untuk kartu penekanan dan section statistik.
- Judul **besar, rapat, tebal-sedang** dengan sans-serif geometris.
- Tombol **pill** dengan **lingkaran panah lime** di dalamnya.
- Section statistik gelap dengan **angka raksasa** yang bertingkat dan digambungkan garis vertikal tipis.
- Susunan card tiga kolom dengan warna berbeda (gelap, lime, foto) sebagai satu "set".

Semua itu diterjemahkan ke konteks laboratorium kampus: **tenang, rapi, terpercaya, dan mudah dibaca**. Halaman landing meniru referensi dengan setia. Halaman aplikasi (dashboard, tabel, form) **diimprove**: bahasa visualnya sama, tetapi kepadatan, kontras, dan kejelasan status dinaikkan karena dipakai untuk bekerja, bukan sekadar dilihat.

### 1.1 Terjemahan elemen referensi → LIMMS

| Elemen referensi | Pemakaian di LIMMS |
|---|---|
| Hero dua kartu (foto bangunan + kartu krem berisi judul) | Hero landing: foto laboratorium + kartu krem berisi judul dan CTA |
| Lingkaran lime "40 years" | Lingkaran lime berisi jumlah aset tercatat (data nyata dari DB) |
| Pill gelap "Watch ▶" | Pill gelap "Tonton demo" (video demonstrasi adalah luaran proyek) |
| 3 kartu: gelap / lime / foto | 3 pilar: Inventaris, Peminjaman, Pemeliharaan |
| Baris pill kategori dengan thumbnail | Baris kategori aset (Komputer, Perangkat jaringan, Proyektor, dst.) |
| Section statistik gelap, angka besar | Ringkasan inventaris: total aset, sedang dipinjam, jadwal pekan ini, laporan terbuka |
| Grid ikon "What makes us different" | Grid 8 fitur utama (FR-01 s.d. FR-08) |
| Panel vertikal gelap "Discover luxury living" | Panel vertikal modul: Inventaris, Peminjaman, Pemeliharaan, Laporan |
| "Global executive leadership" (foto orang) | **Diganti** jadi kartu peran pengguna (tanpa foto orang) |
| "Recognitions we got" (daftar penghargaan) | **Diganti** jadi daftar aturan data yang dijaga sistem |
| "Happy users feedback" (testimoni) | **Dihapus**: tidak ada testimoni nyata, jangan dikarang |
| "Discover inspiration and trends" (blog) | **Dihapus**: di luar ruang lingkup PRD |
| Footer kartu gelap + tombol lime scroll-to-top | Dipertahankan |

---

## 2. Prinsip Desain

1. **Satu aksen, dipakai hemat.** Lime hanya untuk aksi utama, penanda aktif, dan satu kartu sorotan per layar. Jika semuanya lime, tidak ada yang menonjol.
2. **Kontras dua arah.** Gelap dan krem saling menyeimbangkan. Teks pada lime selalu gelap. **Jangan pernah menaruh teks lime di atas krem/putih.**
3. **Radius mengikuti hierarki.** Kartu besar 28px, kartu sedang 20px, kontrol 12px, pill penuh. Satu radius untuk semua adalah tanda desain template.
4. **Status tidak bergantung warna saja.** Setiap status memakai ikon + label teks, karena warna status (hijau/kuning/merah) berdekatan dengan lime aksen.
5. **Data nyata, bukan angka hias.** Semua angka di dashboard dan landing berasal dari query agregasi (schema §2 butir 7, §10), bukan angka karangan.
6. **Satu tindakan, satu nama.** Tombol "Catat peminjaman" menghasilkan toast "Peminjaman dicatat". Nama aksi konsisten di seluruh alur.
7. **Kegagalan dijelaskan, bukan dimaafkan.** Pesan error menyebut apa yang terjadi dan apa yang perlu dilakukan.
8. **Tidak ada fitur di luar PRD.** Tidak ada peta GPS, prediksi AI, atau integrasi IoT (PRD §5.2). Foto aset dan lampiran kerusakan **tidak** ada di skema inti, sehingga UI memakai ikon kategori sebagai pengganti gambar aset.

---

## 3. Design Tokens

### 3.1 Warna

**Palet inti (mengikuti referensi)**

| Token | Hex | Peran |
|---|---|---|
| `ink-900` | `#1C2010` | Kartu gelap, teks utama, section statistik, footer |
| `ink-700` | `#3A3F2C` | Teks sekunder pada putih, hover pada gelap |
| `ink-600` | `#5E6155` | Teks pendukung (≈6:1 di krem, cek ulang saat implementasi) |
| `ink-400` | `#9A9C8F` | Placeholder, ikon nonaktif (bukan untuk teks wajib baca) |
| `line-200` | `#E4E1D6` | Border, pemisah, garis tabel |
| `cream-100` | `#F4F1E8` | Kartu krem (hero kanan, panel form, hover baris) |
| `cream-50` | `#FAF8F3` | Latar halaman aplikasi |
| `white` | `#FFFFFF` | Latar landing, kartu tabel, input |
| `lime-400` | `#E0F35A` | Aksen utama: tombol, lingkaran panah, kartu sorotan |
| `lime-500` | `#CFE43A` | Hover/pressed pada lime |
| `lime-100` | `#F2F9C9` | Latar tipis item terpilih, baris notifikasi belum dibaca |

**Warna status (semantik)**: dipisahkan dari lime agar tidak tertukar.

| Token | Teks/ikon | Latar | Dipakai untuk |
|---|---|---|---|
| `success` | `#2E7D4F` | `#E3F3E8` | `good`, `available`, `completed`, `resolved`, `returned` |
| `warning` | `#9A6200` | `#FFF1CF` | `needs_attention`, `pending`, `in_progress`, `reviewed` |
| `danger` | `#B3261E` | `#FCE4E1` | `damaged`, `overdue`, `rejected`, `reported` |
| `info` | `#1F5FA8` | `#E1EDFA` | `borrowed`, `approved`, `scheduled` |
| `neutral` | `#5B5E52` | `#ECEAE0` | `inactive`, `cancelled`, `maintenance` |

### 3.2 Tipografi

Satu keluarga untuk seluruh produk, dimuat lewat `next/font/google`.

| Peran | Font | Catatan |
|---|---|---|
| Semua teks | **Plus Jakarta Sans** (alternatif: Manrope / Outfit) | Geometris, mirip karakter judul pada referensi |
| Angka tabel & kode aset | Font yang sama dengan `font-variant-numeric: tabular-nums` | Kolom angka sejajar tanpa perlu font mono |

**Skala tipe**

| Token | Ukuran / line-height | Weight | Tracking | Dipakai untuk |
|---|---|---|---|---|
| `display` | `clamp(44px, 6vw, 80px)` / 1.02 | 600 | -0.035em | Judul hero landing |
| `h1` | `clamp(32px, 4vw, 48px)` / 1.08 | 600 | -0.03em | Judul section landing, judul halaman penting |
| `h2` | 28px / 1.15 | 600 | -0.02em | Judul halaman aplikasi |
| `h3` | 20px / 1.25 | 600 | -0.01em | Judul kartu |
| `stat` | `clamp(56px, 8vw, 112px)` / 0.95 | 500 | -0.04em | Angka besar section statistik |
| `body` | 16px / 1.6 | 400 | 0 | Paragraf |
| `body-sm` | 14px / 1.5 | 400 | 0 | Tabel, form, teks pendukung |
| `caption` | 12.5px / 1.4 | 500 | 0.01em | Keterangan, badge |

Aturan: panjang baris paragraf maksimal 70 karakter. Gunakan **sentence case** untuk semua judul, tombol, dan label. Hindari huruf kapital semua dan hindari mengaksenkan satu kata di tengah judul dengan warna/italic.

### 3.3 Radius, spasi, bayangan, gerak

```css
:root {
  /* warna */
  --ink-900:#1C2010; --ink-700:#3A3F2C; --ink-600:#5E6155; --ink-400:#9A9C8F;
  --line-200:#E4E1D6; --cream-100:#F4F1E8; --cream-50:#FAF8F3; --white:#FFFFFF;
  --lime-400:#E0F35A; --lime-500:#CFE43A; --lime-100:#F2F9C9;

  /* radius berdasarkan hierarki */
  --r-xl:28px;   /* kartu besar: hero, pilar, panel gelap */
  --r-lg:20px;   /* kartu sedang: stat, tabel, form */
  --r-md:12px;   /* input, select, tombol kecil, dropdown */
  --r-pill:999px;

  /* spasi (kelipatan 4) */
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px; --s-5:24px;
  --s-6:32px; --s-7:48px; --s-8:72px; --s-9:112px;

  /* bayangan: hampir tidak dipakai, kedalaman lewat warna latar */
  --shadow-pop:0 12px 32px -12px rgba(28,32,16,.28); /* dropdown, modal saja */

  /* gerak */
  --ease:cubic-bezier(.2,.7,.2,1);
  --t-fast:140ms; --t-base:220ms;
}
@media (prefers-reduced-motion:reduce){ *{animation:none!important;transition:none!important} }
```

**Tailwind (`tailwind.config.ts`, ringkas)**

```ts
export default {
  theme: {
    extend: {
      colors: {
        ink: { 900:'#1C2010', 700:'#3A3F2C', 600:'#5E6155', 400:'#9A9C8F' },
        line: { 200:'#E4E1D6' },
        cream: { 50:'#FAF8F3', 100:'#F4F1E8' },
        lime: { 100:'#F2F9C9', 400:'#E0F35A', 500:'#CFE43A' },
      },
      borderRadius: { xl:'28px', lg:'20px', md:'12px' },
      fontFamily: { sans:['var(--font-jakarta)','system-ui','sans-serif'] },
    },
  },
}
```

### 3.4 Grid dan layout

- Container landing: lebar maks **1240px**, padding sisi 24px (mobile) / 40px (desktop).
- Aplikasi: sidebar **264px** (collapsed 80px) + konten fluid, padding konten 32px (desktop) / 16px (mobile).
- Grid 12 kolom, gap 24px. Kartu pilar landing memakai 3 kolom sama lebar.
- Perataan: **rata kiri** untuk hampir semua konten (mengikuti referensi). Rata tengah hanya untuk judul section tertentu di landing (fitur, peran).

---

## 4. Komponen

### 4.1 Tombol

| Varian | Tampilan | Pemakaian |
|---|---|---|
| **Primary (lime)** | Pill, latar `lime-400`, teks `ink-900`, weight 600 | Aksi utama satu per layar ("Catat peminjaman", "Daftarkan aset") |
| **Dark** | Pill, latar `ink-900`, teks putih, ikon lime | CTA di atas krem/putih, "Tonton demo" |
| **Arrow pill** (khas referensi) | Pill putih/krem, border `line-200`, teks `ink-900`, di kanan ada **lingkaran lime 28px berisi panah ↗** | Link "Lihat semua fitur", "Lihat aset" |
| **Secondary** | Pill transparan, border `ink-900` 1.5px | Aksi sekunder ("Batal", "Ekspor") |
| **Ghost** | Tanpa latar, teks `ink-700`, hover `cream-100` | Aksi tersier di tabel |
| **Danger** | Pill latar `#B3261E`, teks putih | Aksi merusak ("Tolak", "Nonaktifkan") |
| **Icon-only** | Lingkaran 40px, tooltip wajib + `aria-label` | Aksi baris tabel, lonceng notifikasi |

Tinggi: 44px (default), 36px (kecil, di tabel), 52px (hero). Fokus: ring 3px `lime-500` + offset 2px `ink-900`. Tombol disabled: opasitas 45% + `cursor-not-allowed`, dan **selalu** disertai penjelasan alasan di dekatnya.

### 4.2 Kartu

| Varian | Spesifikasi |
|---|---|
| **Kartu gelap** | Latar `ink-900`, radius 28, padding 28, judul putih, teks pendukung `#C9CCBD`, garis tipis atas, tautan bawah bergaris, lingkaran lime berpanah di sudut kanan bawah |
| **Kartu lime** | Latar `lime-400`, teks `ink-900`, ilustrasi/ikon besar di bagian bawah, satu per baris kartu |
| **Kartu foto** | Foto penuh + overlay gradien `ink-900` 70% dari bawah, teks putih di atas overlay |
| **Kartu krem** | Latar `cream-100`, radius 28/20, tanpa border |
| **Kartu data** (aplikasi) | Latar putih, border `line-200`, radius 20, tanpa bayangan |

Kartu interaktif: seluruh kartu bisa diklik, hover cukup menggeser lingkaran panah 4px serta menggelapkan latar sedikit. Jangan menambahkan lift/bayangan pada setiap kartu.

### 4.3 Navigasi

**Navbar landing** (mengikuti referensi): pill putih mengambang di atas hero, radius penuh, tinggi 56px. Kiri: logo LIMMS (ikon heksagon lime + wordmark). Tengah: Beranda, Fitur, Modul, Peran, Bantuan. Kanan: "Masuk" (teks) dan **"Mulai"** (tombol lime). Pada mobile menjadi tombol menu yang membuka sheet layar penuh.

**Sidebar aplikasi**: latar `ink-900`, radius 28 pada sisi dalam (mengambang dengan margin 12px), item aktif = pill `lime-400` teks gelap, item lain teks `#C9CCBD`. Tiap item punya ikon + label. Badge angka kecil untuk Notifikasi dan Laporan kerusakan terbuka.

**Topbar aplikasi**: breadcrumb kiri, kolom pencarian aset global di tengah (`Ctrl/⌘+K`), lonceng notifikasi (titik lime bila ada yang belum dibaca), avatar + nama + peran kanan.

### 4.4 Badge status

Pill kecil (tinggi 24px, padding 10px, radius penuh), titik/ikon 8px di kiri, label di kanan. Warna mengikuti §3.1. Pemetaan nilai skema → label tampilan ada di §7.

### 4.5 Tabel data

- Header sticky, latar `cream-100`, teks `ink-600` 13px weight 600 (sentence case).
- Baris 56px, pemisah `line-200`, hover `cream-50`, baris terpilih `lime-100`.
- Kolom pertama (kode/nama) tebal; kolom angka rata kanan dengan `tabular-nums`.
- Aksi baris di kolom paling kanan; hanya ikon dengan tooltip.
- Di bawah tabel: pagination server-side (schema §12) dan pemilih jumlah baris.
- Toolbar di atas tabel: pencarian, filter berupa **chip pill** (Kategori, Lokasi, Kondisi, Status), tombol "Reset filter", dan tombol aksi utama di kanan.
- Mobile (<768px): tabel berubah menjadi **daftar kartu** (satu kartu per baris, 3 field terpenting + badge).

### 4.6 Form

- Label di atas input, 14px weight 600. Teks bantu di bawah, 13px `ink-600`.
- Input: tinggi 48px, radius 12, border `line-200`, latar putih; fokus border `ink-900` + ring lime. Error: border `danger` + ikon + pesan di bawah.
- Select kategori/lokasi memakai combobox yang bisa dicari. Tanggal memakai date picker dengan format `dd MMM yyyy`.
- Panel form: kartu krem 28px, maksimal lebar 720px, tombol aksi menempel di bawah (sticky pada layar pendek).
- Validasi inline saat blur, ringkasan error di atas form saat submit gagal. Validasi **wajib diulang di server** (schema §12).

### 4.7 Modal, drawer, toast

- **Modal konfirmasi**: kartu putih radius 28, judul + 1 kalimat dampak, dua tombol (aksi bernama jelas + "Batal"). Contoh: "Tolak peminjaman LN-0042?"
- **Drawer kanan** (480px): detail cepat dan form pendek (laporan kerusakan, catat pengembalian).
- **Toast**: kiri-bawah, pill gelap, ikon status, auto-hilang 5 detik, dapat ditutup. Pesan memakai kata kerja yang sama dengan tombol pemicunya.

### 4.8 Empty, loading, error state

| State | Pola |
|---|---|
| Kosong | Ikon besar di lingkaran lime, judul 1 baris, 1 kalimat petunjuk, 1 tombol aksi. Contoh: "Belum ada aset. Daftarkan aset pertama agar bisa dipinjam." + [Daftarkan aset] |
| Hasil filter kosong | "Tidak ada aset yang cocok dengan filter." + [Reset filter] |
| Loading | Skeleton krem berdenyut pelan (bukan spinner penuh layar); tombol memakai spinner kecil dan teks tetap |
| Error halaman | Judul "Data tidak bisa dimuat", penyebab singkat, tombol "Coba lagi" |
| Tidak berhak | "Halaman ini hanya untuk laboran dan administrator." + [Kembali ke dashboard] |

### 4.9 Kartu statistik

Dua jenis:
- **Stat gelap besar** (landing, mengikuti referensi): angka `stat` putih, tanda `+`, label kecil di bawah, garis vertikal tipis dengan titik di ujung atas, posisi bertingkat naik-turun.
- **Stat kartu** (dashboard): kartu data 20px, label di atas, angka 40px weight 600, selisih/penjelasan kecil di bawah. **Satu** kartu (yang paling perlu perhatian, mis. "Peminjaman terlambat") boleh memakai latar lime atau gelap.

---

## 5. Peta Halaman dan Peran

Peran bersifat **usulan** (PRD §4, schema §5.1): `administrator`, `laboran`, `peminjam`. Otorisasi final tetap ditegakkan di server.

| Rute | Halaman | FR | Admin | Laboran | Peminjam |
|---|---|---|:-:|:-:|:-:|
| `/` | Landing publik | n/a | ✓ | ✓ | ✓ |
| `/masuk` | Login | n/a | ✓ | ✓ | ✓ |
| `/dashboard` | Dashboard inventaris | FR-09 | ✓ | ✓ | versi ringkas |
| `/aset` | Daftar aset | FR-01, 03 | ✓ | ✓ | lihat & cari |
| `/aset/baru`, `/aset/[id]/ubah` | Form aset | FR-01, 02, 03 | ✓ | ✓ | — |
| `/aset/[id]` | Detail aset + riwayat | FR-03 | ✓ | ✓ | lihat |
| `/referensi` | Kategori & lokasi | FR-02, 03 | ✓ | ✓ | — |
| `/peminjaman` | Daftar peminjaman | FR-04 | ✓ | ✓ | milik sendiri |
| `/peminjaman/baru` | Ajukan/catat peminjaman | FR-04 | ✓ | ✓ | ✓ |
| `/peminjaman/[id]` | Detail & status | FR-04, 05 | ✓ | ✓ | milik sendiri |
| `/pengembalian` | Antrean & riwayat pengembalian | FR-05 | ✓ | ✓ | — |
| `/pemeliharaan` | Jadwal (daftar + kalender) | FR-06 | ✓ | ✓ | — |
| `/kerusakan` | Laporan kerusakan | FR-07 | ✓ | ✓ | buat & lihat milik sendiri |
| `/notifikasi` | Pusat notifikasi | FR-08 | ✓ | ✓ | ✓ |
| `/laporan` | Laporan aset | FR-10 | ✓ | ✓ | — |
| `/pengguna` | Kelola pengguna | usulan | ✓ | — | — |

---

## 6. Spesifikasi Halaman

### 6.1 Landing page (`/`): mengikuti referensi

Urutan section mengikuti urutan pada gambar referensi.

#### Section 1: Hero (dua kartu)

```
┌───────────────────────────────────────────────────────────────┐
│  (LIMMS)  Beranda Fitur Modul Peran Bantuan   Masuk [Mulai]  │  ← navbar pill, mengambang
├───────────────────────────┬───────────────────────────────────┤
│                           │                                   │
│                           │  Aset laboratorium                │
│      FOTO LABORATORIUM    │  tercatat, terlacak,              │
│      (komputer, rak       │  dan terawat.                     │
│       perangkat)          │                                   │
│      radius 28            │  Satu sistem untuk inventaris,    │
│                           │  peminjaman, pengembalian,        │
│                           │  dan pemeliharaan.                │
│                           │  [Lihat semua fitur ↗]            │
│                           │                                   │
│                           │  (128) aset      [Tonton demo ▶]  │
│                           │       tercatat     pill gelap     │
└───────────────────────────┴───────────────────────────────────┘
  kiri: kartu foto 28px          kanan: kartu krem 28px
```

- Kiri (±50%): foto laboratorium, `object-cover`, atribut `alt` deskriptif. Gunakan foto lisensi bebas atau foto lab kampus sendiri.
- Kanan: kartu `cream-100`. Judul `display`, paragraf `body` `ink-600` maksimal 2 baris, tombol arrow pill.
- Baris bawah: lingkaran lime 96px berisi angka jumlah aset (data nyata) + label "aset tercatat"; kanan pill gelap "Tonton demo" dengan ikon play lime.
- Tinggi hero: `min(780px, 100svh - 32px)`. Mobile: kartu bertumpuk, foto di atas (tinggi 320px).
- Satu-satunya animasi saat load: judul muncul dengan fade pendek. Tidak ada animasi scroll di section lain.

#### Section 2: Tentang (pill label + judul + tiga pilar)

```
 (Tentang LIMMS)
                     Satu sistem untuk seluruh siklus
                     hidup aset laboratorium
 ┌────────────┐  ┌────────────┐  ┌────────────┐
 │ GELAP      │  │ LIME       │  │ FOTO       │
 │ Inventaris │  │ Peminjaman │  │ Pemeliharaan│
 │ teks…      │  │ teks…      │  │ teks…      │
 │ Lihat aset │  │ Lihat alur │  │ Lihat jadwal│
 │          ↗ │  │          ↗ │  │          ↗ │
 └────────────┘  └────────────┘  └────────────┘
```

Teks (contoh):
- **Inventaris** — "Daftarkan aset, kelompokkan per kategori, dan catat lokasi serta kondisinya."
- **Peminjaman** — "Catat peminjaman dan pengembalian. Aset yang sedang dipinjam tidak bisa dipinjam dua kali."
- **Pemeliharaan** — "Atur jadwal, catat kerusakan, dan terima pengingat sebelum jadwal tiba."

Pill label kecil di kiri atas ("Tentang LIMMS") dipakai **hanya di section ini**, seperti pada referensi. Kartu: tinggi seragam 360px, kartu tengah naik 0 (sejajar); nomor kartu `01/02/03` boleh dipakai karena ketiganya memang berurutan dalam siklus (daftar → pinjam → rawat).

#### Section 3: Baris kategori (pill)

Satu baris pill putih berborder, sebagian berisi **thumbnail ikon** (komputer, router, proyektor, alat praktikum, perangkat pendukung), sebagian teks. Isinya diambil dari tabel `categories`. Pada desktop baris dapat digeser horizontal (scroll-snap) dan tidak auto-scroll; terpotong di tepi layar seperti referensi untuk mengisyaratkan bisa digeser.

#### Section 4: Statistik (gelap)

```
┌───────────────────────────────────────────────────────────────┐
│ latar foto lab dengan overlay ink-900 85% + kabut gradasi      │
│                                                               │
│ |          |  52         |            |  18                   │
│ •          •  aset       •            •  jadwal                │
│ 48         |  dipinjam   |  2          |  pemeliharaan         │
│ aset       |             |  laporan    |  pekan ini            │
│ tercatat   |             |  terbuka    |                       │
└───────────────────────────────────────────────────────────────┘
```

Empat angka, **dihitung dari database** (agregasi `assets`, `loans`, `maintenance_schedules`, `damage_reports`). Posisi bertingkat naik-turun mengikuti referensi. Jika data kosong (deployment baru), tampilkan angka `0` apa adanya; jangan mengisi angka contoh. Selama pengembangan, beri label kecil "Data contoh (sintetis)" sesuai PRD §13.1.

#### Section 5: Fitur utama (grid ikon)

Judul rata kiri, di kanan grid **2 × 4** berisi 8 fitur modul: Registrasi aset, Kategorisasi, Lokasi & kondisi, Peminjaman & pengembalian, Penjadwalan pemeliharaan, Pelaporan kerusakan, Notifikasi pemeliharaan, Dashboard & laporan. Tiap item: ikon garis dalam lingkaran lime muda, judul 16px, 1 kalimat. Di sisi kiri, foto kecil dengan badge pill "Pantau kondisi aset" sebagai penyeimbang visual (mengikuti "What makes us different").

#### Section 6: Panel modul vertikal (gelap)

Latar gelap penuh, judul "Empat modul, satu alur kerja", dan **4 panel vertikal sempit** (tinggi 420px, radius 20) yang masing-masing berisi gambar + judul modul diputar vertikal. Saat hover/fokus/klik, panel melebar (flex-grow) dan menampilkan deskripsi + tombol arrow pill. Pada mobile menjadi akordeon vertikal. Ini satu-satunya komponen dengan transisi lebar di landing; panel harus bisa dioperasikan dengan keyboard (`Tab` + `Enter`).

#### Section 7: Peran pengguna (pengganti "Global executive leadership")

Judul tengah "Dibuat untuk tiga peran". Tiga kartu krem sejajar tanpa foto orang: ikon besar, nama peran, daftar 3 tanggung jawab. Beri keterangan kecil "Peran usulan, dikonfirmasi pada tahap analisis" selama belum final.

#### Section 8: Aturan yang dijaga (pengganti "Recognitions we got")

Kartu krem dengan daftar 2 kolom berisi aturan dari schema §7, ditulis dari sudut pandang pengguna, tiap baris dengan lingkaran lime berpanah:
- Kode aset selalu unik.
- Aset yang sedang dipinjam tidak bisa dipinjam lagi.
- Tanggal kembali tidak boleh sebelum tanggal pinjam.
- Pengembalian hanya untuk item yang benar-benar dipinjam.
- Status aset berubah sejalan dengan transaksinya.
- Notifikasi selalu mengacu ke jadwal yang valid.

#### Section 9: CTA + footer

Kartu gelap radius 28 dengan foto lab di latar. Judul "Siap merapikan inventaris lab?", tombol lime "Masuk ke LIMMS". Di bawahnya footer: logo, kolom tautan (Produk, Dokumentasi, Bantuan), identitas kelompok dan mata kuliah. Tombol bulat lime berpanah ↑ melayang di kanan bawah, muncul setelah scroll 600px.

---

### 6.2 Login (`/masuk`)

```
┌─────────────────────────────┬──────────────────────────────┐
│  (LIMMS)                    │                              │
│                             │   Kartu gelap radius 28      │
│  Masuk ke LIMMS             │   foto lab + overlay         │
│  Kelola aset laboratorium   │   "Dari peminjaman sampai    │
│  dari satu tempat.          │    pemeliharaan, semua       │
│                             │    tercatat."                │
│  Email   [____________]     │                              │
│  Kata sandi [________👁]    │   (lingkaran lime ↗)         │
│  [ Masuk ]  lime, penuh     │                              │
│                             │                              │
└─────────────────────────────┴──────────────────────────────┘
```

- Form di kiri di atas krem; panel dekoratif kanan disembunyikan di bawah 1024px.
- Error: "Email atau kata sandi tidak cocok. Periksa lagi, lalu coba masuk kembali." (tanpa membocorkan mana yang salah).
- Akun nonaktif (`is_active = false`): "Akun ini dinonaktifkan. Hubungi administrator."
- Tidak ada "daftar mandiri" kecuali kelompok memutuskan demikian (belum ditetapkan di PRD).

---

### 6.3 App shell

```
┌─────────┬──────────────────────────────────────────────────────┐
│ sidebar │ topbar: breadcrumb   [ 🔍 Cari aset  ⌘K ]  🔔  (A) Nama │
│ gelap   ├──────────────────────────────────────────────────────┤
│ Dashboard│                                                      │
│ Aset    │   Judul halaman (h2)                 [Aksi utama]    │
│ Pinjam  │   Kalimat singkat fungsi halaman                      │
│ Kembali │                                                      │
│ Rawat   │   konten                                              │
│ Rusak   │                                                      │
│ Laporan │                                                      │
│ ─────── │                                                      │
│ Pengguna│                                                      │
└─────────┴──────────────────────────────────────────────────────┘
```

Menu mengikuti peran: peminjam hanya melihat Dashboard, Aset, Peminjaman, Laporan kerusakan, Notifikasi. Item yang tidak berhak **disembunyikan**, bukan ditampilkan nonaktif.

---

### 6.4 Dashboard (`/dashboard`) — FR-09

Improve dari section statistik referensi: gaya sama, tetapi ringkas dan bisa ditindaklanjuti.

```
 Selamat siang, {nama}                              [+ Catat peminjaman]
 Ringkasan laboratorium hari ini

 ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────┐
 │ Total   │ │ Tersedia│ │ Dipinjam│ │ TERLAMBAT    │  ← kartu ke-4 gelap/lime
 │  128    │ │  96     │ │  21     │ │  3  [Tinjau ↗]│    jika > 0
 └─────────┘ └─────────┘ └─────────┘ └──────────────┘

 ┌───────────────────────────────┐ ┌──────────────────────────┐
 │ Kondisi aset                  │ │ Pemeliharaan 7 hari ke    │
 │ ▇▇▇▇▇▇▇▇▇▇ baik        104    │ │ depan                     │
 │ ▇▇ perlu perhatian      16    │ │ Sen 30  Proyektor R.2  ●  │
 │ ▇ rusak                  8    │ │ Rab 2   Switch Lab 1   ●  │
 ├───────────────────────────────┤ │ …            [Lihat semua]│
 │ Aset per kategori             │ └──────────────────────────┘
 │ bar horizontal                │ ┌──────────────────────────┐
 └───────────────────────────────┘ │ Laporan kerusakan terbuka │
 ┌───────────────────────────────┐ │ 2 laporan     [Tinjau ↗]  │
 │ Peminjaman aktif (tabel 5 baris)│ └──────────────────────────┘
 └───────────────────────────────┘
```

- Sumber data: query agregasi (schema §10). Tidak ada tabel dashboard terpisah.
- Grafik sederhana (bar horizontal dan donut) memakai warna `ink-900`, `lime-400`, `warning`, `danger`; tiap segmen punya label teks dan angka, bukan hanya warna.
- **Peminjam**: dashboard ringkas berisi "Peminjaman saya" (aktif, jatuh tempo terdekat), tombol "Ajukan peminjaman", dan notifikasi terbaru.
- **Laboran**: tambahan blok "Perlu tindakan" (peminjaman menunggu persetujuan bila alur persetujuan dipakai, pengembalian hari ini, jadwal pemeliharaan hari ini).

---

### 6.5 Daftar aset (`/aset`) — FR-01, FR-02, FR-03

```
 Aset                                          [+ Daftarkan aset]
 Semua aset laboratorium dan kondisinya

 [🔍 Cari kode atau nama]  (Kategori ▾) (Lokasi ▾) (Kondisi ▾) (Status ▾)
 Chip kategori cepat: (Semua) (Komputer) (Jaringan) (Proyektor) …

 Kode      Nama aset           Kategori   Lokasi   Kondisi     Status       ⋯
 LAB-0001  Komputer Dell 3030  Komputer   Lab 1    ● Baik      ● Tersedia   ⋯
 LAB-0002  Proyektor Epson     Proyektor  R. 2     ◐ Perlu…    ● Dipinjam   ⋯
```

- Kolom: kode, nama, kategori, lokasi, kondisi, status, aksi. Kolom tanggal perolehan opsional.
- Ikon kategori ditampilkan di lingkaran 36px krem di sebelah nama (pengganti foto aset).
- Filter dan pencarian dijalankan di server dengan pagination (schema §12). Filter tersimpan di URL (`?kategori=…&kondisi=…`) agar bisa dibagikan.
- Peminjam melihat daftar yang sama tetapi tanpa aksi ubah dan dengan tombol "Pinjam" pada aset berstatus `available`.
- Ekspor tidak ada di sini; ekspor ada di halaman Laporan.

### 6.6 Form aset (`/aset/baru`, `/aset/[id]/ubah`) — FR-01

Panel krem 720px, dua kolom pada desktop:

| Field | Komponen | Aturan |
|---|---|---|
| Kode aset | Input | Wajib, unik. Error: "Kode LAB-0001 sudah dipakai aset lain." |
| Nama aset | Input | Wajib |
| Kategori | Combobox | Wajib, ada tautan "Tambah kategori baru" |
| Lokasi | Combobox | Opsional |
| Kondisi | Segmented control (Baik / Perlu perhatian / Rusak) | Wajib |
| Status | Select (Tersedia / Dipinjam / Pemeliharaan / Nonaktif) | Wajib. Saat membuat aset baru, bawaan "Tersedia". Status "Dipinjam" diubah oleh transaksi, bukan manual (usulan) |
| Tanggal perolehan | Date picker | Opsional |
| Deskripsi, Catatan | Textarea | Opsional |

Tombol: **[Simpan aset]** (lime) dan [Batal]. Toast: "Aset disimpan".

### 6.7 Detail aset (`/aset/[id]`)

Kiri (2/3): kartu identitas besar (kode, nama, kategori, lokasi, kondisi, status, tanggal perolehan, catatan) dengan kartu ringkasan gelap berisi badge status besar. Kanan (1/3): "Tindakan cepat" (Pinjamkan, Jadwalkan pemeliharaan, Laporkan kerusakan, Ubah). Bawah: tab **Riwayat peminjaman · Pemeliharaan · Laporan kerusakan**, masing-masing berupa tabel kecil dari `loan_items`, `maintenance_schedules`, dan `damage_reports`.

### 6.8 Kategori & lokasi (`/referensi`) — FR-02, FR-03

Dua tab "Kategori" dan "Lokasi", masing-masing tabel sederhana (nama, deskripsi, jumlah aset, aksi). Tambah/ubah lewat drawer. Hapus data yang masih dipakai aset diblokir (schema §7 butir 11):
"Kategori Komputer masih dipakai 42 aset. Pindahkan asetnya dulu sebelum menghapus."

---

### 6.9 Peminjaman (`/peminjaman`, `/peminjaman/baru`, `/peminjaman/[id]`) — FR-04

**Daftar:** tabel dengan kolom kode pinjam, peminjam, jumlah aset, tanggal pinjam, rencana kembali, status. Tab status: Semua · Menunggu · Berjalan · Terlambat · Selesai. Baris terlambat diberi penanda `danger` + hari keterlambatan ("Terlambat 3 hari").

**Form peminjaman baru:**

```
 Catat peminjaman                                   
 ┌────────────────────────────────────┐ ┌────────────────────────┐
 │ 1. Peminjam      [combobox pengguna]│ │ Ringkasan              │
 │ 2. Pilih aset    [🔍 cari aset ]     │ │ 2 aset dipilih         │
 │    ☑ LAB-0002 Proyektor  ● Tersedia  │ │ Pinjam   26 Nov 2026   │
 │    ☐ LAB-0009 Laptop     ✕ Dipinjam  │ │ Kembali  28 Nov 2026   │
 │ 3. Tanggal pinjam / rencana kembali │ │                        │
 │ 4. Keperluan  [textarea]            │ │ [Catat peminjaman]     │
 └────────────────────────────────────┘ └────────────────────────┘
```

- Satu transaksi dapat memuat banyak aset (`loan_items`; ini asumsi schema, perlu dikonfirmasi).
- Aset yang tidak berstatus `available` tampil redup dan **tidak bisa dipilih**, dengan alasan ("Sedang dipinjam", "Dalam pemeliharaan").
- Validasi tanggal: rencana kembali tidak boleh sebelum tanggal pinjam ("Tanggal kembali harus sama dengan atau setelah tanggal pinjam").
- **Konflik konkurensi** (schema §7 butir 6): bila server menolak karena aset baru saja diambil pengguna lain, tampilkan banner di atas form: "Proyektor Epson baru saja dipinjam orang lain. Pilih aset lain atau coba lagi nanti." dan keluarkan aset itu dari pilihan. UI tidak boleh menganggap pengecekan di klien cukup.
- Peminjam biasa: tombol bernama **"Ajukan peminjaman"** (status `pending`) bila persetujuan dipakai; laboran: **"Catat peminjaman"**.

**Detail peminjaman:** header dengan kode, badge status, dan garis waktu horizontal (stepper): *Diajukan → Disetujui → Dipinjam → Dikembalikan*. Langkah yang tidak dipakai (bila tanpa persetujuan) disembunyikan. Daftar item dengan badge `item_status`. Aksi sesuai status: Setujui/Tolak (laboran), Batalkan (peminjam, saat `pending`), Catat pengembalian (laboran, saat `borrowed`).

### 6.10 Pengembalian (`/pengembalian`) — FR-05

- Tab **Menunggu dikembalikan** (item `borrowed`, urut rencana kembali terdekat) dan **Riwayat**.
- Tombol **"Catat pengembalian"** membuka drawer:

| Field | Komponen |
|---|---|
| Aset & peminjam | Teks (readonly) |
| Waktu pengembalian | Datetime (bawaan: sekarang) |
| Kondisi saat kembali (`condition_after`) | Segmented: Baik / Perlu perhatian / Rusak |
| Catatan | Textarea |

- Jika kondisi **Rusak** atau **Perlu perhatian**, tampilkan kotak lime muda di bawah: "Aset kembali dengan kondisi bermasalah. [Buat laporan kerusakan]" (membuka form laporan terisi otomatis dengan aset tersebut).
- Setelah disimpan: toast "Pengembalian dicatat", status aset kembali ke `available` (atau `maintenance` bila kebijakan menetapkan demikian). Seluruhnya dalam satu transaksi di server.
- Bila item sudah pernah dikembalikan: "Item ini sudah dicatat dikembalikan pada 24 Nov 2026."
- Pengembalian sebagian: tiap item memiliki tombol sendiri, sehingga UI sudah mendukung pengembalian per item (kebijakan final perlu dikonfirmasi).

---

### 6.11 Pemeliharaan (`/pemeliharaan`) — FR-06, FR-08

Dua tampilan lewat toggle pill **Daftar | Kalender**.

**Daftar:** kolom aset, judul pekerjaan, waktu terjadwal, penanggung jawab, status; filter status dan rentang tanggal. Item yang terlewat jadwal tetapi belum selesai ditandai `danger` ("Terlambat 2 hari").

**Kalender (bulanan):** grid 7 kolom, sel berisi chip kecil per jadwal berwarna menurut status. Hari ini diberi lingkaran lime. Klik chip membuka drawer detail.

**Form jadwal (drawer):** aset (combobox), judul/jenis pekerjaan, deskripsi, waktu terjadwal, penanggung jawab (pilih laboran), dan opsi pengingat. Karena aturan waktu notifikasi belum ditetapkan, field "Ingatkan" memakai pilihan usulan: *Pada hari H · 1 hari sebelumnya · 3 hari sebelumnya*.

**Alur status:** `Terjadwal → Berlangsung → Selesai` (atau `Dibatalkan`) lewat tombol bernama di drawer: "Mulai pemeliharaan", "Tandai selesai" (mengisi `completed_at` dan catatan hasil). Usulan: saat `Berlangsung` aset ditandai status "Pemeliharaan" dan tidak bisa dipinjam.

### 6.12 Laporan kerusakan (`/kerusakan`) — FR-07

- Daftar kartu atau tabel dengan kolom aset, deskripsi singkat, pelapor, waktu lapor, status (Dilaporkan · Ditinjau · Ditangani · Selesai).
- **Form "Laporkan kerusakan"** (drawer): aset (combobox, terisi otomatis bila dibuka dari detail aset), deskripsi kerusakan (wajib, minimal 10 karakter, tampil penghitung), tombol [Kirim laporan].
- Tidak ada unggah foto (belum diwajibkan, schema §5.9); sediakan ruang di desain (area putus-putus nonaktif) hanya jika kelompok memutuskan menambah.
- Laboran: tombol ganti status dan kolom "Catatan penyelesaian" + `resolved_at`.
- Setelah laporan dibuat, usulan: kondisi aset otomatis `damaged` atau `needs_attention` sesuai keputusan laboran (perlu dikonfirmasi).

### 6.13 Notifikasi (`/notifikasi`) — FR-08

- **Lonceng di topbar:** dropdown 360px berisi 5 notifikasi terbaru, tombol "Tandai semua dibaca", dan tautan "Lihat semua".
- **Halaman penuh:** daftar vertikal; baris belum dibaca (`read_at` kosong) berlatar `lime-100` dengan titik gelap di kiri. Isi: judul tebal, pesan satu baris, waktu relatif ("2 jam lalu"), tautan "Lihat jadwal" ke pemeliharaan terkait.
- Filter: Semua · Belum dibaca.
- Kanal in-app saja (kanal email belum ditetapkan, schema §5.10).
- Empty state: "Belum ada notifikasi. Pengingat pemeliharaan akan muncul di sini."

### 6.14 Laporan aset (`/laporan`) — FR-10

```
 Laporan aset                              [Ekspor ▾]  (Cetak)
 Filter: (Kategori ▾) (Lokasi ▾) (Kondisi ▾) (Status ▾) (Rentang tanggal)

 ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
 │ Total aset│ │ Kondisi  │ │ Pemeliha-│ │ Kerusakan│
 │ 128       │ │ baik 81% │ │ raan 12  │ │ 9        │
 └──────────┘ └──────────┘ └──────────┘ └──────────┘

 Tab: Inventaris | Pemeliharaan | Kerusakan | Peminjaman
 [tabel sesuai tab, sticky header, total di footer tabel]
```

- Isi laporan dibentuk dari query data operasional (schema §10); format dan isi final belum ditetapkan, sehingga layout dibuat modular per tab.
- Ekspor (usulan): **PDF** dan **CSV**. Mode cetak memakai gaya putih, tanpa sidebar, tanpa warna latar gelap.
- Setiap tab mengikuti aturan tabel di §4.5.

### 6.15 Pengguna (`/pengguna`) — hanya administrator

Tabel nama, email, peran, status akun, dibuat pada. Aksi: Tambah pengguna (drawer), Ubah peran, Nonaktifkan/Aktifkan (modal konfirmasi: "Nonaktifkan akun Rina? Rina tidak bisa masuk lagi, riwayat tetap tersimpan."). Kata sandi tidak pernah ditampilkan; reset lewat tautan atau kata sandi sementara (mekanisme belum ditetapkan).

---

## 7. Pemetaan Status (schema → tampilan)

Nilai di basis data tetap bahasa Inggris; label tampilan memakai bahasa Indonesia. Satu sumber kebenaran: file `lib/status.ts`.

| Entitas | Nilai | Label | Warna | Ikon |
|---|---|---|---|---|
| `assets.condition` | `good` | Baik | success | ✓ |
| | `needs_attention` | Perlu perhatian | warning | ! |
| | `damaged` | Rusak | danger | ✕ |
| `assets.status` | `available` | Tersedia | success | ● |
| | `borrowed` | Dipinjam | info | ⇄ |
| | `maintenance` | Pemeliharaan | neutral | 🔧 |
| | `inactive` | Nonaktif | neutral | ⏸ |
| `loans.status` | `pending` | Menunggu | warning | ◔ |
| | `approved` | Disetujui | info | ✓ |
| | `rejected` | Ditolak | danger | ✕ |
| | `borrowed` | Dipinjam | info | ⇄ |
| | `completed` | Selesai | success | ✓ |
| | `overdue` | Terlambat | danger | ⚠ |
| | `cancelled` | Dibatalkan | neutral | ⊘ |
| `loan_items.item_status` | `requested` / `approved` / `borrowed` / `returned` / `rejected` / `cancelled` | Diminta / Disetujui / Dipinjam / Dikembalikan / Ditolak / Dibatalkan | warning / info / info / success / danger / neutral | |
| `maintenance_schedules.status` | `scheduled` | Terjadwal | info | 📅 |
| | `in_progress` | Berlangsung | warning | ◐ |
| | `completed` | Selesai | success | ✓ |
| | `cancelled` | Dibatalkan | neutral | ⊘ |
| `damage_reports.status` | `reported` | Dilaporkan | danger | ! |
| | `reviewed` | Ditinjau | warning | 👁 |
| | `in_progress` | Ditangani | warning | ◐ |
| | `resolved` | Selesai | success | ✓ |

Catatan: status `overdue` dapat disimpan atau diturunkan (hitung dari `expected_return_date` < hari ini dan belum selesai). Desain menganggap keduanya tampil sama; pilihan implementasi dibahas di tahap arsitektur. Ikon pada tabel di atas hanya usulan; gunakan satu set ikon garis (mis. Lucide) secara konsisten.

---

## 8. Microcopy

| Konteks | Teks |
|---|---|
| Tombol utama | Daftarkan aset · Catat peminjaman · Catat pengembalian · Jadwalkan pemeliharaan · Laporkan kerusakan · Simpan perubahan |
| Toast sukses | Aset disimpan · Peminjaman dicatat · Pengembalian dicatat · Jadwal dibuat · Laporan terkirim |
| Konfirmasi merusak | "Hapus kategori Proyektor?" — "Kategori ini tidak dipakai aset mana pun. Tindakan ini tidak bisa dibatalkan." |
| Error validasi | "Isi nama aset." · "Kode LAB-0001 sudah dipakai." · "Tanggal kembali harus setelah tanggal pinjam." |
| Error konflik | "Proyektor Epson baru saja dipinjam orang lain. Pilih aset lain." |
| Error server | "Perubahan belum tersimpan. Coba lagi. Jika terus gagal, hubungi administrator." |
| Tidak ada akses | "Anda tidak punya akses ke halaman ini." |

Gunakan bahasa Indonesia baku yang ramah, kalimat aktif, tanpa seruan berlebihan, dan jangan memakai kata "gagal" tanpa penjelasan.

---

## 9. Responsif

| Breakpoint | Perilaku |
|---|---|
| ≥1280px | Layout penuh: sidebar 264px, hero dua kartu sejajar, statistik bertingkat |
| 1024–1279px | Sidebar menjadi 80px (ikon), grid 3 kolom tetap |
| 768–1023px | Sidebar menjadi drawer, hero tetap dua kolom tetapi kartu lebih pendek, grid fitur 2 kolom |
| <768px | Hero bertumpuk (foto di atas), pilar 1 kolom, panel modul menjadi akordeon, statistik 2 × 2 tanpa tingkat, tabel jadi daftar kartu, aksi utama menjadi tombol melayang di bawah (FAB pill lime) |

Aplikasi mobile native berada di luar ruang lingkup (PRD §5.2); web responsif sudah cukup. Target sentuh minimal 44 × 44px.

---

## 10. Aksesibilitas dan Kualitas

- Kontras teks minimal WCAG AA (4.5:1 untuk teks normal). Pasangan yang diperiksa: `ink-900` di atas `lime-400`, putih di atas `ink-900`, `ink-600` di atas `cream-100`.
- Fokus terlihat pada semua elemen interaktif (ring lime + offset gelap).
- Status selalu punya label teks; grafik punya label angka dan tabel alternatif (`<table>` tersembunyi visual atau tombol "Lihat sebagai tabel").
- Semua gambar bermakna punya `alt`; foto dekoratif memakai `alt=""`.
- Komponen kompleks (combobox, drawer, modal, akordeon panel) mengikuti pola WAI-ARIA: fokus berpindah ke dalam saat dibuka, kembali ke pemicu saat ditutup, `Esc` menutup.
- Hormati `prefers-reduced-motion` (lihat §3.3).
- Format tanggal `26 Nov 2026`, zona waktu aplikasi konsisten (WITA untuk Makassar, ditampilkan sesuai konfigurasi), angka memakai pemisah Indonesia (`1.280`).
- Dukungan peramban modern terbaru (NFR-06).

---

## 11. Catatan Implementasi Next.js

**Struktur folder yang disarankan**

```
app/
  (publik)/page.tsx            # landing
  (publik)/masuk/page.tsx
  (aplikasi)/layout.tsx        # sidebar + topbar, cek sesi
  (aplikasi)/dashboard/page.tsx
  (aplikasi)/aset/…
  (aplikasi)/peminjaman/…
  (aplikasi)/pengembalian/page.tsx
  (aplikasi)/pemeliharaan/page.tsx
  (aplikasi)/kerusakan/page.tsx
  (aplikasi)/notifikasi/page.tsx
  (aplikasi)/laporan/page.tsx
  (aplikasi)/pengguna/page.tsx
components/
  ui/        # Button, ArrowPill, Card, Badge, Input, Combobox, Drawer, Modal, Toast, Table, EmptyState
  landing/   # Hero, PillarCards, CategoryPills, StatBand, FeatureGrid, ModulePanels, RoleCards
  app/       # Sidebar, Topbar, StatCard, MaintenanceCalendar, LoanStepper
lib/
  status.ts        # pemetaan nilai skema → label/warna/ikon (§7)
  auth.ts          # sesi & otorisasi peran (server)
  db/…             # akses database server-side saja
```

**Aturan kerja (selaras `schema.md` §12)**

- Komponen halaman berupa **Server Component**; hanya komponen interaktif (drawer, combobox, kalender) yang `"use client"`.
- Akses database hanya di server; jangan mengirim `password_hash` ke klien.
- Peminjaman dan pengembalian dijalankan melalui **Server Action/route handler** dalam satu transaksi database; UI menangani hasil `success | conflict | validation_error`.
- Pagination dan filter dijalankan di query server; state filter disimpan di URL query.
- Dasbor/laporan memakai query agregasi, bukan angka yang disimpan ganda.
- Gunakan `next/image` untuk foto landing dengan ukuran eksplisit dan `priority` pada gambar hero.
- Font dimuat dengan `next/font/google` (`Plus Jakarta Sans`, variabel `--font-jakarta`).
- Setiap rute aplikasi memiliki `loading.tsx` (skeleton) dan `error.tsx` sesuai §4.8.

---

## 12. Pemetaan Kebutuhan → Halaman

| Kebutuhan | Halaman utama |
|---|---|
| FR-01 Registrasi aset | `/aset`, `/aset/baru`, `/aset/[id]/ubah` |
| FR-02 Kategorisasi | `/referensi` (Kategori), filter di `/aset` |
| FR-03 Lokasi dan kondisi | `/referensi` (Lokasi), `/aset/[id]` |
| FR-04 Peminjaman | `/peminjaman`, `/peminjaman/baru`, `/peminjaman/[id]` |
| FR-05 Pengembalian | `/pengembalian`, drawer "Catat pengembalian" |
| FR-06 Penjadwalan pemeliharaan | `/pemeliharaan` (daftar + kalender) |
| FR-07 Pelaporan kerusakan | `/kerusakan` |
| FR-08 Notifikasi | Lonceng topbar, `/notifikasi` |
| FR-09 Dashboard | `/dashboard`, section statistik landing |
| FR-10 Laporan aset | `/laporan` |

---

## 13. Hal yang Perlu Dikonfirmasi (berdampak pada desain)

1. Daftar peran dan hak akses final, karena menentukan menu dan versi dashboard.
2. Apakah peminjaman memerlukan persetujuan. Jika tidak, hapus status `pending/approved/rejected` dari UI dan sederhanakan stepper.
3. Apakah satu transaksi boleh memuat banyak aset. Jika tidak, form peminjaman memakai satu pemilih aset.
4. Apakah pengembalian sebagian diperbolehkan, karena menentukan tombol per item atau per transaksi.
5. Kanal notifikasi (in-app saja atau juga email) dan aturan waktu pengingat.
6. Apakah foto aset dan lampiran kerusakan dibutuhkan. Jika ya, kartu aset dan form kerusakan perlu area unggah.
7. Format laporan dan ekspor (PDF/CSV) yang diinginkan dosen.
8. Apakah aset berstatus `maintenance` otomatis saat jadwal berlangsung.
9. Apakah registrasi pengguna mandiri diperlukan atau akun hanya dibuat administrator.
10. Sumber foto landing (foto laboratorium kampus sendiri atau gambar berlisensi bebas).

---

**Catatan:** Dokumen ini adalah dasar untuk prototype UI/UX (Figma) dan implementasi Next.js. Foto yang tampak pada gambar referensi (bangunan, orang) tidak boleh dipakai ulang; gunakan aset sendiri atau berlisensi bebas. Gaya visual meniru *struktur dan nuansa* referensi, bukan menyalin materi tema berbayar.
