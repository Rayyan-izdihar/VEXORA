-- LIMMS PostgreSQL Schema (without ORM)
-- Referensi: schema (1).md v1.0

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_users_role CHECK (role IN ('administrator', 'laboran', 'peminjam'))
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    condition VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    acquisition_date DATE,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_assets_condition CHECK (condition IN ('good', 'needs_attention', 'damaged')),
    CONSTRAINT chk_assets_status CHECK (status IN ('available', 'borrowed', 'maintenance', 'inactive'))
);

CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_code VARCHAR(60) NOT NULL UNIQUE,
    borrower_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    loan_date DATE NOT NULL,
    expected_return_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    purpose TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_loan_dates CHECK (expected_return_date >= loan_date),
    CONSTRAINT chk_loans_status CHECK (status IN ('pending', 'approved', 'rejected', 'borrowed', 'completed', 'overdue', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS loan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    item_status VARCHAR(30) NOT NULL,
    condition_before VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_loan_asset UNIQUE (loan_id, asset_id),
    CONSTRAINT chk_loan_items_status CHECK (item_status IN ('requested', 'approved', 'borrowed', 'returned', 'rejected', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS return_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_item_id UUID NOT NULL UNIQUE REFERENCES loan_items(id) ON DELETE RESTRICT,
    received_by UUID REFERENCES users(id) ON DELETE SET NULL,
    return_date TIMESTAMPTZ NOT NULL,
    condition_after VARCHAR(30) NOT NULL,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_return_condition_after CHECK (condition_after IN ('good', 'needs_attention', 'damaged'))
);

CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    title VARCHAR(160) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    reminder_days INT NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_maintenance_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS damage_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT NOT NULL,
    image_url TEXT,
    status VARCHAR(30) NOT NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_damage_status CHECK (status IN ('reported', 'reviewed', 'in_progress', 'resolved'))
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    maintenance_schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE SET NULL,
    loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
    damage_report_id UUID REFERENCES damage_reports(id) ON DELETE SET NULL,
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(255),
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (schema §6)
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets (category_id);
CREATE INDEX IF NOT EXISTS idx_assets_location ON assets (location_id);
CREATE INDEX IF NOT EXISTS idx_assets_condition_status ON assets (condition, status);
CREATE INDEX IF NOT EXISTS idx_loans_borrower ON loans (borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans (status);
CREATE INDEX IF NOT EXISTS idx_loans_dates ON loans (status, loan_date, expected_return_date);
CREATE INDEX IF NOT EXISTS idx_loan_items_asset ON loan_items (asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_asset_date ON maintenance_schedules (asset_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_status_date ON maintenance_schedules (status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_damage_reports_asset_date ON damage_reports (asset_id, reported_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_loan ON notifications (loan_id);

-- Idempotent column upgrades for existing databases
ALTER TABLE assets ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE damage_reports ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE return_records ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link_url VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS loan_id UUID REFERENCES loans(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS damage_report_id UUID REFERENCES damage_reports(id) ON DELETE SET NULL;
