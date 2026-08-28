'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { bulkCreateUsers, type BulkCreateUserResult } from '../actions/bulk-create-users';
import { createUserSchema } from '../create-user.schema';
import { parseCsv } from '../lib/parse-csv';
import { ROLE_LABEL } from '../user-options';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { FileUp, Download, Upload, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const CREATABLE_ROLES = ['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT'] as const;

type RoleValue = (typeof CREATABLE_ROLES)[number];

interface ParsedRow {
  name: string;
  username: string;
  role: string;
  valid: boolean;
  error?: string;
}

interface BulkImportUsersDialogProps {
  allowedRoles?: RoleValue[];
}

function buildTemplateCsv(allowedRoles?: RoleValue[]) {
  const exampleRole = allowedRoles?.[0] ?? 'STUDENT';
  return `name,username,role\nContoh Nama Siswa,12345678,${exampleRole}\n`;
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function BulkImportUsersDialog({ allowedRoles }: BulkImportUsersDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<BulkCreateUserResult[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleSet = new Set<string>(allowedRoles ?? CREATABLE_ROLES);

  const resetState = () => {
    setFileName(null);
    setRows([]);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = async (file: File) => {
    setResults(null);
    setFileName(file.name);

    const text = await file.text();
    const records = parseCsv(text);

    const parsedRows: ParsedRow[] = records.map((record) => {
      const name = record.name ?? '';
      const username = record.username ?? '';
      const role = (record.role ?? '').trim().toUpperCase();

      if (role && !roleSet.has(role)) {
        return { name, username, role, valid: false, error: 'Role tidak diizinkan' };
      }

      const parsed = createUserSchema.safeParse({ name, username, role });

      if (!parsed.success) {
        return {
          name,
          username,
          role,
          valid: false,
          error: parsed.error.issues[0]?.message ?? 'Data tidak valid',
        };
      }

      return { name, username, role, valid: true };
    });

    setRows(parsedRows);
  };

  const validRows = rows.filter((r) => r.valid);
  const invalidCount = rows.length - validRows.length;

  const handleImport = async () => {
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    try {
      const result = await bulkCreateUsers(
        validRows.map((r) => ({ name: r.name, username: r.username, role: r.role }))
      );
      setResults(result);

      const successCount = result.filter((r) => r.success).length;
      const failCount = result.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} pengguna berhasil ditambahkan`);
        router.refresh();
      }
      if (failCount > 0) {
        toast.error(`${failCount} pengguna gagal ditambahkan`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetState();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline">
            <FileUp />
            Import CSV
          </Button>
        }
      />

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="size-5" />
            Import Pengguna dari CSV
          </DialogTitle>
          <DialogDescription>
            Unggah file CSV dengan kolom <code>name</code>, <code>username</code>, <code>role</code>.
            Email dan password akan dibuat otomatis dari username, sama seperti tambah pengguna manual.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => downloadCsv(buildTemplateCsv(allowedRoles), 'template-pengguna.csv')}
            >
              <Download />
              Unduh Template
            </Button>

            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload />
              Pilih File CSV
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
          </div>

          {rows.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{validRows.length} valid</Badge>
                {invalidCount > 0 && <Badge variant="outline">{invalidCount} error</Badge>}
              </div>

              <div className="max-h-72 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, index) => {
                      const resultForRow = results?.find((r) => r.username === row.username);
                      return (
                        <TableRow key={`${row.username}-${index}`}>
                          <TableCell>{row.name || '-'}</TableCell>
                          <TableCell>{row.username || '-'}</TableCell>
                          <TableCell>
                            {ROLE_LABEL[row.role as keyof typeof ROLE_LABEL] ?? (row.role || '-')}
                          </TableCell>
                          <TableCell>
                            {resultForRow ? (
                              resultForRow.success ? (
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                  <CheckCircle2 className="size-3.5" />
                                  Berhasil
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-destructive">
                                  <XCircle className="size-3.5" />
                                  {resultForRow.error}
                                </span>
                              )
                            ) : row.valid ? (
                              <span className="text-xs text-muted-foreground">Siap diimpor</span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-destructive">
                                <XCircle className="size-3.5" />
                                {row.error}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Tutup
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={validRows.length === 0 || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Mengimpor...
              </>
            ) : (
              <>
                <Upload />
                Impor {validRows.length > 0 ? `${validRows.length} Pengguna` : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
