'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { STATUS_LABEL } from '../types';
import type { ChartBar } from '../aggregate-for-chart';

interface Props {
  title: string;
  description: string;
  data: ChartBar[];
}

export function ProgressChartCard({ title, description, data }: Props) {
  const [selected, setSelected] = useState<ChartBar | null>(null);

  function handleClick(payload: unknown) {
    const active = (payload as { activePayload?: { payload: ChartBar }[] })?.activePayload?.[0]?.payload;
    if (active) setSelected(active);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-muted-foreground text-sm">Belum ada data untuk periode ini.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} onClick={handleClick}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      color: 'var(--popover-foreground)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Bar dataKey="selesai" name="Selesai" stackId="a" fill="var(--chart-1)" />
                  <Bar dataKey="sedangDijalani" name="Sedang Dijalani" stackId="a" fill="var(--chart-2)" />
                  <Bar dataKey="belumDimulai" name="Belum Dimulai" stackId="a" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-muted-foreground mt-2 text-xs">Klik batang untuk melihat daftar siswa</p>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Siswa</DialogTitle>
            <DialogDescription>{selected?.name}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] space-y-2 overflow-y-auto text-sm">
            {!selected || selected.detail.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">Belum ada siswa dengan progres di sini</p>
            ) : (
              selected.detail.map((s, i) => (
                <div key={i} className="flex flex-col gap-1 border-b pb-2">
                  <div className="flex justify-between">
                    <span>
                      {s.studentName}{' '}
                      <span className="text-muted-foreground">
                        ({STATUS_LABEL[s.status as keyof typeof STATUS_LABEL] ?? s.status})
                      </span>
                    </span>
                    <span className="font-medium">{s.percent}%</span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {s.completed} dari {s.total}
                  </span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
