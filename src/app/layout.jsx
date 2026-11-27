import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'LIMMS — Sistem Inventaris & Pemeliharaan Laboratorium',
  description:
    'Laboratory Inventory and Maintenance Management System untuk pencatatan aset, peminjaman, pengembalian, pemeliharaan, dan laporan laboratorium.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream-50 text-ink-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
