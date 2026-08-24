import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground">Halaman yang Anda cari tidak ditemukan.</p>
      <Button>
        <Link href="/">Kembali ke Halaman Utama</Link>
      </Button>
    </div>
  );
}
