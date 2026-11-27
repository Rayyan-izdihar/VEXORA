import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/limms';

const pool = new Pool({ connectionString });

async function main() {
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Applying db/schema.sql...');
    await client.query(schemaSql);

    const { rows: existingUsers } = await client.query('SELECT COUNT(*)::int AS cnt FROM users');
    if (existingUsers[0].cnt > 0) {
      console.log('Seed skipped: database already contains users.');
      return;
    }

    console.log('Seeding synthetic LIMMS data...');
    await client.query('BEGIN');

    const adminHash = await bcrypt.hash('admin123', 10);
    const laboranHash = await bcrypt.hash('laboran123', 10);
    const peminjamHash = await bcrypt.hash('mhs123', 10);

    const { rows: users } = await client.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES
         ('Rina Pratama', 'admin@limms.ac.id', $1, 'administrator', TRUE),
         ('Budi Santoso', 'laboran@limms.ac.id', $2, 'laboran', TRUE),
         ('Andi Wijaya', 'mahasiswa@limms.ac.id', $3, 'peminjam', TRUE),
         ('Siti Rahma', 'siti.rahma@limms.ac.id', $3, 'peminjam', TRUE)
       RETURNING id, email, role`,
      [adminHash, laboranHash, peminjamHash]
    );

    const laboranId = users.find((u) => u.role === 'laboran').id;
    const peminjamId = users.find((u) => u.email === 'mahasiswa@limms.ac.id').id;
    const peminjam2Id = users.find((u) => u.email === 'siti.rahma@limms.ac.id').id;

    const { rows: categories } = await client.query(
      `INSERT INTO categories (name, description)
       VALUES
         ('Komputer', 'PC desktop, workstation, dan laptop praktikum'),
         ('Perangkat Jaringan', 'Router, switch managed, access point, dan kabel tester'),
         ('Proyektor', 'Proyektor LCD/DLP dan perangkat presentasi ruang lab'),
         ('Alat Praktikum', 'Osiloskop, multimeter digital, mikrokontroler, dan sensor'),
         ('Perangkat Pendukung', 'UPS, webcam konferensi, tripod, dan speaker lab')
       RETURNING id, name`
    );

    const { rows: locations } = await client.query(
      `INSERT INTO locations (name, description)
       VALUES
         ('Lab Komputer 1', 'Gedung Teknik Lantai 2 — 40 unit workstation'),
         ('Lab Jaringan', 'Gedung Teknik Lantai 2 — Rak server dan perangkat jaringan'),
         ('Ruang Multimedia 2', 'Gedung Kuliah Bersama Lantai 1'),
         ('Gudang Inventaris', 'Ruang penyimpanan cadangan & perangkat belum terpasang')
       RETURNING id, name`
    );

    const cat = (name) => categories.find((c) => c.name === name).id;
    const loc = (name) => locations.find((l) => l.name === name).id;

    const { rows: assets } = await client.query(
      `INSERT INTO assets (asset_code, name, description, category_id, location_id, condition, status, acquisition_date, notes)
       VALUES
         ('LAB-0001', 'Komputer Dell OptiPlex 3030', 'Workstation praktikum pemrograman Intel i5, RAM 16GB', $1, $6, 'good', 'available', '2024-03-15', 'Unit meja A1'),
         ('LAB-0002', 'Proyektor Epson EB-X500', 'Proyektor XGA 3600 lumens HDMI', $3, $8, 'good', 'borrowed', '2024-05-10', 'Kelengkapan tas dan kabel HDMI'),
         ('LAB-0003', 'Switch Cisco Catalyst 2960', '24-port managed gigabit switch', $2, $7, 'good', 'available', '2023-11-20', 'Rak 2 slot B'),
         ('LAB-0004', 'Router MikroTik RB4011', 'Router gigabit 10-port SFP+', $2, $7, 'needs_attention', 'available', '2023-08-05', 'Port 9 sedikit longgar'),
         ('LAB-0005', 'Osiloskop Rigol DS1054Z', 'Osiloskop digital 4-channel 50MHz', $4, $7, 'good', 'borrowed', '2024-01-12', 'Termasuk 4 probe standar'),
         ('LAB-0006', 'Laptop Lenovo ThinkPad L14', 'Laptop praktikum mobile & IoT', $1, $6, 'good', 'available', '2025-02-01', 'Baterai sehat 94%'),
         ('LAB-0007', 'Multimeter Fluke 117', 'True-RMS digital multimeter', $4, $9, 'damaged', 'maintenance', '2022-09-14', 'Sekring arus 10A putus, menunggu penggantian'),
         ('LAB-0008', 'UPS APC Back-UPS 1100VA', 'Cadangan daya rak jaringan', $5, $7, 'good', 'available', '2024-07-22', 'Baterai diganti Mei 2026'),
         ('LAB-0009', 'Proyektor BenQ MH560', 'Proyektor Full HD 3800 lumens', $3, $8, 'needs_attention', 'available', '2023-06-18', 'Lampu mendekati 3000 jam'),
         ('LAB-0010', 'Kit Mikrokontroler ESP32 Set', 'Paket 10 board ESP32 + breadboard', $4, $6, 'good', 'available', '2025-09-01', 'Kotak komponen #3')
       RETURNING id, asset_code`,
      [
        cat('Komputer'),
        cat('Perangkat Jaringan'),
        cat('Proyektor'),
        cat('Alat Praktikum'),
        cat('Perangkat Pendukung'),
        loc('Lab Komputer 1'),
        loc('Lab Jaringan'),
        loc('Ruang Multimedia 2'),
        loc('Gudang Inventaris'),
      ]
    );

    const assetId = (code) => assets.find((a) => a.asset_code === code).id;

    const { rows: loans } = await client.query(
      `INSERT INTO loans (loan_code, borrower_id, created_by, loan_date, expected_return_date, status, purpose, notes)
       VALUES
         ('LN-2026-0001', $1, $3, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '2 days', 'borrowed', 'Presentasi tugas besar Basis Data', 'Diserahkan lengkap dengan tas'),
         ('LN-2026-0002', $2, $3, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '2 days', 'borrowed', 'Praktikum Elektronika Dasar', '4 probe terpasang'),
         ('LN-2026-0003', $1, $1, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '4 days', 'pending', 'Uji coba jaringan lokal kelompok 10', NULL)
       RETURNING id, loan_code`,
      [peminjamId, peminjam2Id, laboranId]
    );

    await client.query(
      `INSERT INTO loan_items (loan_id, asset_id, item_status, condition_before)
       VALUES
         ($1, $4, 'borrowed', 'good'),
         ($2, $5, 'borrowed', 'good'),
         ($3, $6, 'requested', 'good')`,
      [
        loans[0].id,
        loans[1].id,
        loans[2].id,
        assetId('LAB-0002'),
        assetId('LAB-0005'),
        assetId('LAB-0003'),
      ]
    );

    const { rows: maint } = await client.query(
      `INSERT INTO maintenance_schedules (asset_id, title, description, scheduled_at, status, assigned_to, reminder_days, notes)
       VALUES
         ($1, 'Penggantian sekring & kalibrasi', 'Ganti fuse 10A dan cek akurasi tegangan DC', NOW() + INTERVAL '1 day', 'in_progress', $4, 1, 'Suku cadang sudah tersedia'),
         ($2, 'Pembersihan filter proyektor', 'Bersihkan filter debu dan cek jam lampu proyektor', NOW() + INTERVAL '3 days', 'scheduled', $4, 1, NULL),
         ($3, 'Pengecekan port 9 switch/router', 'Periksa modul port 9 yang longgar', NOW() + INTERVAL '5 days', 'scheduled', $4, 3, NULL)
       RETURNING id, title, scheduled_at`,
      [assetId('LAB-0007'), assetId('LAB-0009'), assetId('LAB-0004'), laboranId]
    );

    await client.query(
      `INSERT INTO damage_reports (asset_id, reported_by, description, status, resolution_notes)
       VALUES
         ($1, $3, 'Multimeter tidak membaca arus pada skala 10A setelah praktikum.', 'in_progress', 'Sedang dilakukan penggantian sekring internal.'),
         ($2, $4, 'Tampilan proyektor agak redup di pojok kanan atas saat dinyalakan lama.', 'reported', NULL)`,
      [assetId('LAB-0007'), assetId('LAB-0009'), laboranId, peminjamId]
    );

    await client.query(
      `INSERT INTO notifications (user_id, maintenance_schedule_id, title, message, scheduled_for, sent_at)
       VALUES
         ($1, $2, 'Pengingat pemeliharaan: Pembersihan filter proyektor', 'Jadwal pemeliharaan Proyektor BenQ MH560 jatuh dalam 3 hari.', NOW(), NOW()),
         ($1, $3, 'Pemeliharaan sedang berlangsung', 'Multimeter Fluke 117 sedang dalam status pemeliharaan.', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours')`,
      [laboranId, maint[1].id, maint[0].id]
    );

    await client.query('COMMIT');
    console.log('Seed completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
