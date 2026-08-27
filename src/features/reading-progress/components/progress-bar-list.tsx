'use client';

import { useMemo, useState } from 'react';
import { Progress as ProgressPrimitive } from '@base-ui/react/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { STATUS_LABEL, type ProgressItem, type ProgressStatus } from '../types';

const FILTERS: { value: 'ALL' | ProgressStatus; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'SEDANG_DIJALANI', label: 'Sedang' },
  { value: 'SELESAI', label: 'Selesai' },
];

const STATUS_COLOR: Record<ProgressStatus, string> = {
  SELESAI: 'bg-[var(--chart-1)]',
  SEDANG_DIJALANI: 'bg-[var(--chart-2)]',
  BELUM_DIMULAI: 'bg-muted-foreground/30',
};

interface Props {
  title: string;
  items: ProgressItem[];
  emptyMessage?: string;
}

export function ProgressBarList({ title, items, emptyMessage = 'Belum ada progres.' }: Props) {
  const [filter, setFilter] = useState<'ALL' | ProgressStatus>('ALL');

  const filtered = useMemo(
    () => (filter === 'ALL' ? items : items.filter((i) => i.status === filter)),
    [items, filter],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? 'default' : 'outline'}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        ) : (
          <div className="max-h-75 space-y-3 overflow-y-auto pr-1">
            {filtered.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {item.completed}/{item.total} &middot; {STATUS_LABEL[item.status]}
                  </span>
                </div>
                <ProgressPrimitive.Root value={Math.min(100, item.percent)}>
                  <ProgressTrack className="h-2">
                    <ProgressIndicator className={STATUS_COLOR[item.status]} />
                  </ProgressTrack>
                </ProgressPrimitive.Root>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
