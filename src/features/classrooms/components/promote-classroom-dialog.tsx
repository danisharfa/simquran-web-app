'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowUpCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { promoteClassroom } from '../actions/promote-classroom';
import type { StudentOption } from '../queries/list-classroom-students';

const SEMESTER_OPTIONS = [
  { value: 'GANJIL', label: 'Ganjil' },
  { value: 'GENAP', label: 'Genap' },
] as const;

interface Props {
  classroomId: string;
  isGraduating: boolean;
  students: StudentOption[];
  defaultAcademicYear?: string;
  defaultSemester?: 'GANJIL' | 'GENAP';
}

export function PromoteClassroomDialog({
  classroomId,
  isGraduating,
  students,
  defaultAcademicYear = '',
  defaultSemester = 'GANJIL',
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [academicYear, setAcademicYear] = useState(defaultAcademicYear);
  const [semester, setSemester] = useState<'GANJIL' | 'GENAP'>(defaultSemester);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setSelectedIds([]);
    setAcademicYear(defaultAcademicYear);
    setSemester(defaultSemester);
  }

  function toggleStudent(studentId: string, checked: boolean) {
    setSelectedIds((prev) =>
      checked ? [...prev, studentId] : prev.filter((id) => id !== studentId),
    );
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? students.map((s) => s.userId) : []);
  }

  async function handleSubmit() {
    setIsSubmitting(true);

    try {
      const result = await promoteClassroom(classroomId, selectedIds, academicYear, semester);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      reset();
      setOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <ArrowUpCircle />
            {isGraduating ? 'Luluskan Siswa' : 'Naik Semester'}
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="size-5" />
            {isGraduating ? 'Luluskan Siswa' : 'Naik Semester'}
          </DialogTitle>
          <DialogDescription>
            {isGraduating
              ? 'Pilih siswa yang akan diluluskan dari kelas ini. Data lama akan diarsipkan.'
              : 'Pilih siswa yang naik ke kelas berikutnya. Siswa yang tidak dipilih tetap di kelas ini.'}
          </DialogDescription>
        </DialogHeader>

        {!isGraduating && (
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="target-academic-year">Tahun Ajaran Tujuan</FieldLabel>
              <Input
                id="target-academic-year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="Contoh: 2026/2027"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="target-semester">Semester Tujuan</FieldLabel>
              <Select value={semester} onValueChange={(v) => setSemester(v as 'GANJIL' | 'GENAP')}>
                <SelectTrigger id="target-semester">
                  <SelectValue>
                    {SEMESTER_OPTIONS.find((opt) => opt.value === semester)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SEMESTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        )}

        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada siswa di kelas ini.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 rounded-md border p-2 text-sm font-medium">
              <Checkbox
                checked={selectedIds.length === students.length}
                onCheckedChange={(checked) => toggleAll(!!checked)}
              />
              <span>Pilih Semua</span>
            </label>

            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
              {students.map((student) => (
                <label
                  key={student.userId}
                  htmlFor={`promote-student-${student.userId}`}
                  className="flex items-center gap-3 rounded-md border p-2 text-sm"
                >
                  <Checkbox
                    id={`promote-student-${student.userId}`}
                    checked={selectedIds.includes(student.userId)}
                    onCheckedChange={(checked) => toggleStudent(student.userId, !!checked)}
                  />
                  <span className="flex flex-1 items-center justify-between gap-2">
                    <span>{student.name}</span>
                    <span className="text-muted-foreground">{student.nis}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            disabled={selectedIds.length === 0 || isSubmitting}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={selectedIds.length === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Memproses...
              </>
            ) : isGraduating ? (
              'Luluskan Siswa Terpilih'
            ) : (
              'Naikkan Siswa Terpilih'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
