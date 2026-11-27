/**
 * Single source of truth for schema -> UI status mappings.
 * Referensi: design (1).md §7
 */

export const ASSET_CONDITIONS = {
  good: { label: 'Baik', variant: 'success', icon: 'check' },
  needs_attention: { label: 'Perlu perhatian', variant: 'warning', icon: 'alert-circle' },
  damaged: { label: 'Rusak', variant: 'danger', icon: 'x-circle' },
};

export const ASSET_STATUSES = {
  available: { label: 'Tersedia', variant: 'success', icon: 'circle-dot' },
  borrowed: { label: 'Dipinjam', variant: 'info', icon: 'arrow-left-right' },
  maintenance: { label: 'Pemeliharaan', variant: 'neutral', icon: 'wrench' },
  inactive: { label: 'Nonaktif', variant: 'neutral', icon: 'pause-circle' },
};

export const LOAN_STATUSES = {
  pending: { label: 'Menunggu', variant: 'warning', icon: 'clock' },
  approved: { label: 'Disetujui', variant: 'info', icon: 'check' },
  rejected: { label: 'Ditolak', variant: 'danger', icon: 'x-circle' },
  borrowed: { label: 'Dipinjam', variant: 'info', icon: 'arrow-left-right' },
  completed: { label: 'Selesai', variant: 'success', icon: 'check-circle' },
  overdue: { label: 'Terlambat', variant: 'danger', icon: 'alert-triangle' },
  cancelled: { label: 'Dibatalkan', variant: 'neutral', icon: 'ban' },
};

export const LOAN_ITEM_STATUSES = {
  requested: { label: 'Diminta', variant: 'warning', icon: 'clock' },
  approved: { label: 'Disetujui', variant: 'info', icon: 'check' },
  borrowed: { label: 'Dipinjam', variant: 'info', icon: 'arrow-left-right' },
  returned: { label: 'Dikembalikan', variant: 'success', icon: 'check-circle' },
  rejected: { label: 'Ditolak', variant: 'danger', icon: 'x-circle' },
  cancelled: { label: 'Dibatalkan', variant: 'neutral', icon: 'ban' },
};

export const MAINTENANCE_STATUSES = {
  scheduled: { label: 'Terjadwal', variant: 'info', icon: 'calendar' },
  in_progress: { label: 'Berlangsung', variant: 'warning', icon: 'loader' },
  completed: { label: 'Selesai', variant: 'success', icon: 'check-circle' },
  cancelled: { label: 'Dibatalkan', variant: 'neutral', icon: 'ban' },
};

export const DAMAGE_STATUSES = {
  reported: { label: 'Dilaporkan', variant: 'danger', icon: 'alert-circle' },
  reviewed: { label: 'Ditinjau', variant: 'warning', icon: 'eye' },
  in_progress: { label: 'Ditangani', variant: 'warning', icon: 'wrench' },
  resolved: { label: 'Selesai', variant: 'success', icon: 'check-circle' },
};

export const USER_ROLES = {
  administrator: { label: 'Administrator', variant: 'dark' },
  laboran: { label: 'Laboran', variant: 'info' },
  peminjam: { label: 'Peminjam', variant: 'neutral' },
};

export function getStatusMeta(map, value) {
  return map[value] || { label: value || '-', variant: 'neutral', icon: 'circle' };
}
