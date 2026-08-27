import type { ReactNode } from 'react';
import { BackButton } from '@/components/ui/back-button';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  backHref?: string;
}

export function PageHeader({ title, description, action, backHref }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {backHref && <BackButton href={backHref} />}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      </div>

      {action}
    </div>
  );
}
