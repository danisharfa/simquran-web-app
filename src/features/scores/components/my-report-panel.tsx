'use client';

import { useEffect, useState } from 'react';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportView } from './report-view';
import { ExportReportPdfButton } from './export-report-pdf-button';
import { getMyReportPeriods, type ReportPeriodData } from '../actions/get-my-report-periods';
import { getMyReportData, type MyReportData } from '../actions/get-my-report-data';

export function MyReportPanel() {
  const [filters, setFilters] = useState<ReportPeriodData | null>(null);
  const [period, setPeriod] = useState('');
  const [data, setData] = useState<MyReportData | null>(null);

  useEffect(() => {
    getMyReportPeriods().then((result) => {
      setFilters(result);
      setPeriod(result.defaultPeriod);
    });
  }, []);

  useEffect(() => {
    if (!period || !filters) return;

    const selected = filters.periods.find((p) => p.value === period);
    if (!selected) return;

    let cancelled = false;

    getMyReportData(selected.groupId).then((result) => {
      if (!cancelled) setData(result);
    });

    return () => {
      cancelled = true;
    };
  }, [period, filters]);

  if (!filters) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (filters.periods.length === 0) {
    return <p className="text-muted-foreground text-sm">Anda belum tergabung dalam kelompok, rapor belum tersedia.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Field className="w-56">
          <FieldLabel>Tahun Ajaran</FieldLabel>
          <Select value={period} onValueChange={(v) => setPeriod(v ?? '')}>
            <SelectTrigger>
              <SelectValue>
                {filters.periods.find((p) => p.value === period)?.label ?? 'Pilih periode'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filters.periods.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {data && <ExportReportPdfButton data={data.pdfData} />}
      </div>

      {!data ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : (
        <ReportView
          studentName={data.context.studentName}
          nis={data.context.nis}
          groupName={data.context.groupName}
          report={data.report}
          tahfidzScores={data.tahfidzScores}
          tahsinScores={data.tahsinScores}
        />
      )}
    </div>
  );
}
