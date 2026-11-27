import {
  Package,
  ArrowLeftRight,
  Layers,
  MapPin,
  CalendarClock,
  AlertTriangle,
  Bell,
  BarChart3,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';

export const LANDING_FEATURES = [
  { icon: Package, title: 'Registrasi aset', desc: 'Catat aset laboratorium lengkap dengan kode unik dan tanggal perolehan.' },
  { icon: Layers, title: 'Kategorisasi barang', desc: 'Kelompokkan komputer, jaringan, proyektor, dan alat praktikum.' },
  { icon: MapPin, title: 'Lokasi & kondisi', desc: 'Pantau lokasi ruangan serta kondisi fisik setiap perangkat.' },
  { icon: ArrowLeftRight, title: 'Peminjaman & kembali', desc: 'Kelola pengajuan, persetujuan, dan pengembalian per item.' },
  { icon: CalendarClock, title: 'Jadwal pemeliharaan', desc: 'Atur jadwal perawatan rutin lengkap dengan tampilan kalender.' },
  { icon: AlertTriangle, title: 'Pelaporan kerusakan', desc: 'Catat kendala peralatan dan pantau status penanganannya.' },
  { icon: Bell, title: 'Notifikasi jadwal', desc: 'Terima pengingat jadwal pemeliharaan langsung di aplikasi.' },
  { icon: BarChart3, title: 'Dashboard & laporan', desc: 'Ringkasan inventaris real-time dan ekspor laporan siap cetak.' },
];

export const LANDING_ROLES = [
  {
    icon: ShieldCheck,
    name: 'Administrator',
    items: [
      'Mengelola akun pengguna dan peran akses',
      'Mengelola data referensi kategori dan lokasi',
      'Meninjau dashboard serta mengekspor laporan aset',
    ],
  },
  {
    icon: UserCog,
    name: 'Laboran / Petugas Lab',
    items: [
      'Mendaftarkan aset dan memperbarui kondisi fisik',
      'Menyetujui peminjaman dan mencatat pengembalian',
      'Mengelola jadwal pemeliharaan dan laporan kerusakan',
    ],
  },
  {
    icon: Users,
    name: 'Peminjam',
    items: [
      'Melihat daftar dan ketersediaan peralatan lab',
      'Mengajukan peminjaman serta memantau statusnya',
      'Melaporkan kerusakan peralatan yang ditemukan',
    ],
  },
];

export const LANDING_RULES = [
  'Kode aset selalu unik di seluruh sistem.',
  'Aset yang sedang dipinjam tidak bisa dipinjam lagi.',
  'Tanggal kembali tidak boleh sebelum tanggal pinjam.',
  'Pengembalian hanya untuk item yang benar-benar dipinjam.',
  'Status aset berubah sejalan dengan transaksinya.',
  'Notifikasi selalu mengacu ke jadwal pemeliharaan yang valid.',
];
