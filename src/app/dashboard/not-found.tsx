// app/dashboard/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted-foreground">Halaman yang Anda cari tidak ditemukan.</p>
      <Button>
        <Link href="/dashboard">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
}
