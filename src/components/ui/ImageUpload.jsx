/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, ExternalLink } from 'lucide-react';

export function UploadedImage({ src, alt, className = '' }) {
  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
}

export function ImageUpload({
  label,
  value = '',
  onChange,
  helper,
  accept = 'image/jpeg,image/png,image/webp',
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5 MB.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mengunggah gambar.');
        setUploading(false);
        return;
      }
      onChange(data.url);
    } catch {
      setError('Gagal mengunggah gambar. Periksa koneksi lalu coba lagi.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-semibold text-ink-900">{label}</span>}

      {value ? (
        <div className="rounded-[16px] border border-line-200 bg-white p-3 space-y-3">
          <div className="relative rounded-[12px] overflow-hidden bg-cream-100 max-h-56 flex items-center justify-center">
            <UploadedImage
              src={value}
              alt={label || 'Pratinjau foto'}
              className="w-full max-h-56 object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700 hover:text-ink-900 underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka ukuran penuh
            </a>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="h-8 px-3 rounded-full border border-line-200 text-xs font-semibold text-ink-700 hover:bg-cream-100"
              >
                Ganti foto
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={uploading}
                className="h-8 px-3 rounded-full border border-line-200 text-xs font-semibold text-status-danger-fg hover:bg-status-danger-bg inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus foto
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-[16px] border border-dashed border-line-200 bg-white hover:bg-cream-50 px-4 py-6 flex flex-col items-center justify-center gap-2 text-center transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-ink-700 animate-spin" />
          ) : (
            <ImagePlus className="w-6 h-6 text-ink-700" />
          )}
          <span className="text-sm font-semibold text-ink-900">
            {uploading ? 'Mengunggah foto...' : 'Pilih foto dari perangkat'}
          </span>
          <span className="text-xs text-ink-600">JPG, PNG, atau WebP · Maksimal 5 MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-[13px] text-status-danger-fg font-medium">{error}</p>
      )}
      {!error && helper && <p className="text-[13px] text-ink-600">{helper}</p>}
    </div>
  );
}
