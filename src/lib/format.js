const TZ = 'Asia/Makassar';

export function formatDate(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: TZ,
  }).format(d);
}

export function formatDateTime(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  }).format(d);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(Number(num || 0));
}

export function formatRelativeTime(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '-';
  const diffMs = d.getTime() - Date.now();
  const diffMins = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, 'minute');
  const diffHours = Math.round(diffMins / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, 'day');
}

export function toYmdInTz(dateInput) {
  if (!dateInput) return null;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
}

export function daysOverdue(expectedReturnDate) {
  const expectedYmd = toYmdInTz(expectedReturnDate);
  const todayYmd = toYmdInTz(new Date());
  if (!expectedYmd || !todayYmd) return 0;
  const diff = Math.floor(
    (Date.parse(`${todayYmd}T00:00:00Z`) - Date.parse(`${expectedYmd}T00:00:00Z`)) / 86400000
  );
  return diff > 0 ? diff : 0;
}

export function toLocalDateInputValue(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toLocalDateTimeInputValue(date = new Date()) {
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${toLocalDateInputValue(date)}T${h}:${min}`;
}
