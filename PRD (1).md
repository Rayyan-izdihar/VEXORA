# Product Requirements Document (PRD)

## Laboratory Inventory and Maintenance Management System (LIMMS)

**Versi:** 1.0\
**Tanggal:** 26 November 2026\
**Jenis produk:** Aplikasi sistem informasi berbasis web\
**Framework implementasi yang direncanakan:** Next.js\
**Acuan utama:** Dokumen *Kasus Proyek RPL B 2026*, Kasus Kelompok 10,
halaman 11--12.

------------------------------------------------------------------------

## 1. Ringkasan Produk

Laboratory Inventory and Maintenance Management System (LIMMS) adalah
aplikasi berbasis web untuk membantu pengelolaan inventaris, peminjaman,
pengembalian, dan pemeliharaan aset laboratorium perguruan tinggi.

Laboratorium memiliki berbagai aset, seperti komputer, perangkat
jaringan, proyektor, perangkat praktikum, dan peralatan pendukung
lainnya. Pengelolaan inventaris secara manual berpotensi menyulitkan
pelacakan aset, pemeliharaan, dan pengawasan kondisi peralatan.

LIMMS dikembangkan untuk menyediakan pengelolaan data aset yang
terstruktur, mendukung proses peminjaman dan pengembalian, mencatat
kondisi serta lokasi aset, mengelola jadwal pemeliharaan, mencatat
kerusakan, memberikan notifikasi jadwal pemeliharaan, dan menyajikan
dashboard serta laporan aset.

PRD ini membatasi ruang lingkup produk pada kebutuhan Kasus Kelompok 10.
Detail teknis atau kebutuhan yang tidak ditetapkan di modul ditandai
sebagai usulan atau keputusan yang masih perlu dikonfirmasi.

## 2. Latar Belakang dan Permasalahan

Berdasarkan modul, laboratorium perguruan tinggi memiliki beragam aset
dan peralatan. Pengelolaan inventaris secara manual berpotensi
menyebabkan:

-   Kesulitan melacak aset.
-   Kesulitan mengelola pemeliharaan aset.
-   Kesulitan mengawasi kondisi peralatan.

Selain itu, proses inventaris, peminjaman, pengembalian, dan
pemeliharaan perlu dikelola melalui pencatatan yang terstruktur.

## 3. Tujuan Produk

Tujuan utama LIMMS adalah mengembangkan aplikasi untuk mengelola:

1.  Inventaris aset laboratorium.
2.  Peminjaman peralatan.
3.  Pengembalian peralatan.
4.  Pemeliharaan aset laboratorium.

Tujuan operasional produk:

-   Menyediakan pencatatan aset laboratorium.
-   Mengelompokkan barang dan peralatan berdasarkan kategori.
-   Mencatat lokasi dan kondisi aset.
-   Mengelola transaksi peminjaman dan pengembalian.
-   Mengelola jadwal pemeliharaan.
-   Menyediakan pencatatan laporan kerusakan.
-   Memberikan notifikasi jadwal pemeliharaan.
-   Menyajikan dashboard inventaris dan laporan aset.

## 4. Pengguna dan Pemangku Kepentingan

Modul Kasus Kelompok 10 tidak menetapkan daftar aktor atau peran
pengguna secara rinci. Untuk kebutuhan perancangan awal, peran berikut
merupakan **usulan** dan perlu dikonfirmasi oleh kelompok/dosen:

  -----------------------------------------------------------------------
  Peran usulan                        Tanggung jawab yang diusulkan
  ----------------------------------- -----------------------------------
  Administrator                       Mengelola akses pengguna dan data
                                      referensi sistem.

  Laboran/Petugas Laboratorium        Mengelola data aset, transaksi
                                      peminjaman dan pengembalian,
                                      kondisi aset, serta pemeliharaan.

  Peminjam (misalnya mahasiswa atau   Mengajukan peminjaman dan melihat
  dosen)                              status pengajuan atau riwayat
                                      peminjaman.
  -----------------------------------------------------------------------

Pembagian peran final dan hak akses setiap peran harus ditetapkan pada
tahap analisis kebutuhan dan perancangan sistem.

## 5. Ruang Lingkup Produk

### 5.1 Dalam Ruang Lingkup (In Scope)

Ruang lingkup inti yang ditetapkan dalam modul:

1.  Registrasi aset laboratorium.
2.  Kategorisasi barang dan peralatan.
3.  Pencatatan lokasi dan kondisi aset.
4.  Peminjaman dan pengembalian peralatan.
5.  Penjadwalan pemeliharaan.
6.  Pelaporan kerusakan.
7.  Notifikasi jadwal pemeliharaan.
8.  Dashboard inventaris dan laporan aset.

### 5.2 Di Luar Ruang Lingkup (Out of Scope)

Hal-hal berikut tidak ditetapkan sebagai kebutuhan Kasus Kelompok 10
dalam modul dan tidak menjadi komitmen pengembangan pada PRD ini:

-   Pengadaan dan pembelian barang.
-   Pengelolaan anggaran atau akuntansi.
-   Integrasi dengan sistem akademik kampus.
-   Pelacakan lokasi aset secara GPS.
-   Prediksi kerusakan berbasis kecerdasan buatan.
-   Aplikasi mobile native.
-   Integrasi perangkat IoT atau sensor laboratorium.

Fitur di luar ruang lingkup dapat dipertimbangkan hanya jika ada
persetujuan perubahan kebutuhan.

## 6. Kebutuhan Fungsional Produk

Kebutuhan berikut merupakan penjabaran langsung dari delapan fitur utama
pada modul.

  -----------------------------------------------------------------------
  ID                      Fitur                   Deskripsi kebutuhan
  ----------------------- ----------------------- -----------------------
  FR-01                   Registrasi aset         Sistem menyediakan
                          laboratorium            fungsi untuk mencatat
                                                  atau mendaftarkan aset
                                                  laboratorium.

  FR-02                   Kategorisasi barang dan Sistem menyediakan
                          peralatan               fungsi pengelompokan
                                                  barang dan peralatan
                                                  berdasarkan kategori.

  FR-03                   Pencatatan lokasi dan   Sistem memungkinkan
                          kondisi aset            pencatatan lokasi dan
                                                  kondisi setiap aset.

  FR-04                   Peminjaman peralatan    Sistem mendukung
                                                  pencatatan proses
                                                  peminjaman peralatan
                                                  laboratorium.

  FR-05                   Pengembalian peralatan  Sistem mendukung
                                                  pencatatan proses
                                                  pengembalian peralatan
                                                  laboratorium.

  FR-06                   Penjadwalan             Sistem menyediakan
                          pemeliharaan            fungsi untuk mengatur
                                                  jadwal pemeliharaan
                                                  aset.

  FR-07                   Pelaporan kerusakan     Sistem menyediakan
                                                  fungsi pencatatan atau
                                                  penyampaian laporan
                                                  kerusakan peralatan.

  FR-08                   Notifikasi pemeliharaan Sistem menyediakan
                                                  notifikasi terkait
                                                  jadwal pemeliharaan
                                                  aset.

  FR-09                   Dashboard inventaris    Sistem menyajikan
                                                  informasi inventaris
                                                  aset melalui dashboard.

  FR-10                   Laporan aset            Sistem menyediakan
                                                  laporan terkait aset
                                                  laboratorium.
  -----------------------------------------------------------------------

**Catatan:** FR-04 dan FR-05 memisahkan fitur peminjaman dan
pengembalian yang pada modul ditulis sebagai satu butir fitur.

## 7. Aturan dan Alur Bisnis Awal

Bagian ini merupakan gambaran awal untuk membantu pemodelan proses.
Rincian aturan, validasi, persetujuan, dan status transaksi belum
ditentukan secara eksplisit dalam modul sehingga perlu dikonfirmasi pada
tahap analisis lanjutan.

### 7.1 Pengelolaan Aset

1.  Data aset dicatat melalui fitur registrasi aset.
2.  Aset dikelompokkan berdasarkan kategori.
3.  Lokasi dan kondisi aset dicatat dalam sistem.
4.  Informasi aset digunakan dalam pengelolaan inventaris dan laporan.

### 7.2 Peminjaman dan Pengembalian

1.  Proses peminjaman peralatan dicatat di dalam sistem.
2.  Proses pengembalian peralatan dicatat di dalam sistem.
3.  Informasi transaksi menjadi bagian dari pengelolaan status
    peminjaman.

Detail seperti mekanisme persetujuan, batas waktu pinjam, denda
keterlambatan, dan daftar status transaksi belum ditetapkan oleh modul.

### 7.3 Pemeliharaan dan Kerusakan

1.  Jadwal pemeliharaan aset dicatat di dalam sistem.
2.  Sistem menyediakan notifikasi jadwal pemeliharaan.
3.  Kerusakan peralatan dapat dicatat melalui fitur pelaporan kerusakan.
4.  Informasi pemeliharaan menjadi bagian dari laporan aset.

## 8. Tantangan Rekayasa Perangkat Lunak

Sesuai modul, pengembangan LIMMS memperhatikan tantangan berikut:

  -----------------------------------------------------------------------
  Tantangan                           Penjelasan kebutuhan rekayasa
  ----------------------------------- -----------------------------------
  Pemodelan siklus hidup aset         Memodelkan perubahan dan perjalanan
                                      aset selama dikelola di
                                      laboratorium.

  Pengelolaan status peminjaman       Menentukan dan mengelola status
                                      proses peminjaman serta
                                      pengembalian.

  Perancangan basis data              Merancang struktur data yang
                                      mendukung aset, kategori, lokasi,
                                      kondisi, transaksi, dan
                                      pemeliharaan.

  Implementasi notifikasi             Merancang mekanisme pemberitahuan
                                      jadwal pemeliharaan.

  Pengujian transaksi dan konsistensi Memastikan transaksi tercatat
  data                                dengan benar dan data terkait tetap
                                      konsisten.
  -----------------------------------------------------------------------

## 9. Kebutuhan Non-Fungsional

Modul tidak merinci kebutuhan non-fungsional. Daftar berikut adalah
**usulan awal** untuk dibahas dan disepakati, bukan persyaratan
eksplisit dari modul.

  -----------------------------------------------------------------------
  ID                      Aspek                   Kebutuhan usulan
  ----------------------- ----------------------- -----------------------
  NFR-01                  Usability               Antarmuka mudah
                                                  dipahami oleh pengguna
                                                  sistem.

  NFR-02                  Security                Akses ke fungsi sistem
                                                  dibatasi sesuai hak
                                                  akses pengguna yang
                                                  ditetapkan.

  NFR-03                  Reliability             Sistem menjaga
                                                  konsistensi data pada
                                                  proses pencatatan dan
                                                  transaksi.

  NFR-04                  Performance             Halaman dan proses
                                                  utama memberikan
                                                  respons dalam waktu
                                                  yang wajar pada
                                                  lingkungan penggunaan
                                                  proyek.

  NFR-05                  Maintainability         Kode dan struktur
                                                  aplikasi disusun agar
                                                  mudah dipelihara dan
                                                  dikembangkan.

  NFR-06                  Compatibility           Aplikasi web dapat
                                                  digunakan melalui
                                                  browser modern pada
                                                  perangkat yang
                                                  didukung.
  -----------------------------------------------------------------------

Target angka untuk performa, ketersediaan, keamanan, dan kompatibilitas
perlu ditentukan setelah kebutuhan pengguna dan lingkungan implementasi
diketahui.

## 10. Data Utama yang Dikelola

Entitas berikut merupakan **identifikasi awal** berdasarkan fitur dalam
modul, bukan ERD final.

  Data/entitas awal     Tujuan
  --------------------- ---------------------------------------------------
  Aset                  Menyimpan informasi setiap aset laboratorium.
  Kategori aset         Mengelompokkan barang dan peralatan.
  Lokasi                Menyimpan informasi lokasi aset.
  Kondisi aset          Mencatat kondisi aset.
  Peminjaman            Mencatat transaksi peminjaman peralatan.
  Pengembalian          Mencatat transaksi pengembalian peralatan.
  Jadwal pemeliharaan   Menyimpan jadwal pemeliharaan aset.
  Laporan kerusakan     Mencatat kerusakan peralatan.
  Notifikasi            Mendukung pemberitahuan jadwal pemeliharaan.
  Laporan aset          Menyajikan informasi inventaris dan pemeliharaan.

Atribut, relasi, kardinalitas, dan aturan integritas data ditentukan
pada tahap perancangan basis data dan ERD.

## 11. Indikator Keberhasilan Produk

Indikator berikut digunakan untuk mengevaluasi apakah kebutuhan inti
telah diimplementasikan. Indikator ini tidak menetapkan target
kuantitatif yang tidak tercantum dalam modul.

-   Pengguna dapat mencatat aset laboratorium.
-   Aset dapat dikelompokkan berdasarkan kategori.
-   Lokasi dan kondisi aset dapat dicatat.
-   Peminjaman dan pengembalian peralatan dapat dicatat.
-   Jadwal pemeliharaan dapat dikelola.
-   Laporan kerusakan dapat dicatat.
-   Notifikasi jadwal pemeliharaan dapat ditampilkan.
-   Dashboard inventaris dan laporan aset dapat diakses.
-   Pengujian menunjukkan transaksi berjalan benar dan konsistensi data
    terjaga.

## 12. Kriteria Penerimaan Tingkat Produk

Produk dapat dinyatakan memenuhi ruang lingkup utama apabila:

1.  Seluruh delapan fitur utama pada modul telah tersedia dan dapat
    didemonstrasikan.
2.  Data aset dapat dicatat, dikategorikan, serta dilengkapi informasi
    lokasi dan kondisi.
3.  Proses peminjaman dan pengembalian dapat dicatat.
4.  Jadwal pemeliharaan dan laporan kerusakan dapat dikelola.
5.  Notifikasi jadwal pemeliharaan tersedia.
6.  Dashboard inventaris dan laporan aset menampilkan data yang
    tersimpan pada sistem.
7.  Pengujian transaksi dan konsistensi data telah dilakukan dan
    didokumentasikan.

Rincian skenario uji dan hasil aktual dicatat pada dokumen test case dan
test report.

## 13. Batasan dan Asumsi

### 13.1 Batasan

-   Produk dikembangkan sebagai aplikasi berbasis web.
-   Ruang lingkup mengikuti Kasus Kelompok 10 pada modul RPL 2026.
-   Data pribadi dan data sensitif, apabila digunakan, harus berupa data
    sintetis atau data yang telah dianonimkan sesuai ketentuan umum
    tugas.
-   Implementasi menggunakan Next.js sesuai arahan proyek kelompok.

### 13.2 Asumsi yang Perlu Dikonfirmasi

-   Daftar peran pengguna dan hak akses final.
-   Identitas dan atribut wajib setiap aset.
-   Format kategori, lokasi, dan kondisi aset.
-   Alur persetujuan serta status peminjaman dan pengembalian.
-   Informasi yang wajib dicatat pada laporan kerusakan.
-   Aturan penjadwalan dan waktu pengiriman notifikasi.
-   Format dan isi laporan aset.
-   Kebutuhan non-fungsional terukur.

## 14. Risiko Awal

  -----------------------------------------------------------------------
  Risiko                  Dampak potensial        Penanganan awal
  ----------------------- ----------------------- -----------------------
  Data aset tidak lengkap Informasi inventaris    Menentukan atribut data
                          tidak akurat            aset dan validasi
                                                  input.

  Status peminjaman tidak Informasi ketersediaan  Menentukan alur
  konsisten               peralatan keliru        transaksi dan menguji
                                                  perubahan status.

  Jadwal pemeliharaan     Pemeliharaan aset       Menguji mekanisme
  terlewat                terlambat               notifikasi dan
                                                  pencatatan jadwal.

  Data transaksi tidak    Laporan tidak sesuai    Melakukan validasi dan
  konsisten               dengan transaksi        pengujian transaksi
                                                  basis data.

  Ruang lingkup           Pengerjaan tidak        Menjadikan delapan
  berkembang              selesai sesuai waktu    fitur modul sebagai
                                                  prioritas utama.
  -----------------------------------------------------------------------

## 15. Teknologi dan Implementasi

Teknologi yang telah ditentukan berdasarkan arahan proyek:

-   **Next.js:** framework pengembangan aplikasi web.

Teknologi pendukung seperti basis data, ORM, autentikasi, pustaka
antarmuka, dan layanan notifikasi belum ditetapkan oleh modul.
Pemilihannya dilakukan pada tahap perancangan arsitektur perangkat lunak
(SAD) dengan mempertimbangkan kebutuhan dan kemampuan tim.

## 16. Luaran Proyek

### 16.1 Luaran Khusus Kasus 10

Aplikasi inventaris yang memiliki fitur:

-   Peminjaman peralatan.
-   Pengembalian peralatan.
-   Pelacakan kondisi aset.
-   Laporan pemeliharaan.

### 16.2 Luaran Umum Mata Kuliah

Mengacu pada ketentuan umum modul, kelompok menyiapkan:

1.  Proposal proyek.
2.  Software Requirements Specification (SRS).
3.  Software Architecture Document (SAD).
4.  Diagram UML.
5.  Entity Relationship Diagram (ERD).
6.  Prototype UI/UX.
7.  Source code aplikasi.
8.  Database dan dokumentasi skema.
9.  Test case dan test report.
10. Laporan akhir proyek.
11. Video demonstrasi aplikasi.
12. Presentasi hasil proyek.

Proyek dikerjakan paling lambat **10 Desember 2026**. Kelompok maksimal
terdiri dari empat mahasiswa. Aplikasi harus dapat didemonstrasikan dan
dokumentasi teknis disiapkan dalam format DOCX. Berkas akhir dikompresi
dalam format RAR atau ZIP untuk dikumpulkan melalui SIKOLA.

## 17. Referensi

1.  Jailani, A. (2026). *Kasus Proyek RPL B 2026*, Mata Kuliah Rekayasa
    Perangkat Lunak, Sistem Informasi, Universitas Hasanuddin. Kasus
    Kelompok 10, halaman 11--12; ketentuan umum dan luaran akhir,
    halaman 1--2.

------------------------------------------------------------------------

**Status dokumen:** Draft PRD awal.\
**Catatan:** Dokumen ini menjadi dasar untuk penyusunan SRS, UML, ERD,
prototype UI/UX, dan implementasi. Bagian yang diberi label usulan atau
perlu dikonfirmasi harus disepakati terlebih dahulu oleh kelompok
sebelum ditetapkan sebagai kebutuhan final.
