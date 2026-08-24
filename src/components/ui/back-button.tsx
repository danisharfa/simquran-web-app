import Link from 'next/link';
import { Button } from './button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
}

export function BackButton({ href }: BackButtonProps) {
  return (
    <Button variant="outline" size="icon" nativeButton={false} render={<Link href={href} />}>
      <ArrowLeft />
    </Button>
  );
}
