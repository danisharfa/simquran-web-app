'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlignJustify, StretchHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { STATUS_LABEL } from '../types';
import type { ChartBar } from '../aggregate-for-chart';

interface Props {
  title: string;
  description: string;
  data: ChartBar[];
}

interface ChartProps {
  data: ChartBar[];
  height: number;
  wide: boolean;
  onBarClick: (bar: ChartBar) => void;
}

function ProgressBarChart({ data, height, wide, onBarClick }: ChartProps) {
  function handleBarClick(entry: { payload?: ChartBar }) {
    if (entry.payload) onBarClick(entry.payload);
  }

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
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
        <Bar
          dataKey="selesai"
          name="Selesai"
          stackId="a"
          fill="var(--chart-1)"
          cursor="pointer"
          onClick={handleBarClick}
        />
        <Bar
          dataKey="sedangDijalani"
          name="Sedang Dijalani"
          stackId="a"
          fill="var(--chart-2)"
          cursor="pointer"
          onClick={handleBarClick}
        />
        <Bar
          dataKey="belumDimulai"
          name="Belum Dimulai"
          stackId="a"
          fill="var(--chart-3)"
          radius={[4, 4, 0, 0]}
          cursor="pointer"
          onClick={handleBarClick}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  if (!wide) return chart;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: Math.max(data.length * 90, 480) }}>{chart}</div>
    </div>
  );
}

export function ProgressChartCard({ title, description, data }: Props) {
  const [selected, setSelected] = useState<ChartBar | null>(null);
  const [wide, setWide] = useState(false);

  function handleClick(bar: ChartBar) {
    setSelected(bar);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>

          {data.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant={wide ? 'ghost' : 'secondary'}
                size="sm"
                onClick={() => setWide(false)}
              >
                <AlignJustify className="h-4 w-4" />
                Rapat
              </Button>
              <Button
                variant={wide ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setWide(true)}
              >
                <StretchHorizontal className="h-4 w-4" />
                Lebar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-muted-foreground text-sm">Belum ada data untuk periode ini.</p>
          ) : (
            <>
              <ProgressBarChart data={data} height={220} wide={wide} onBarClick={handleClick} />
              <p className="text-muted-foreground mt-2 text-sm">Klik batang untuk melihat daftar siswa</p>
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
          <div className="max-h-75 space-y-2 overflow-y-auto text-sm">
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
                  <span className="text-muted-foreground text-sm">
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
