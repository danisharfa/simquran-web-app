'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Target } from 'lucide-react';

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
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WeeklyTargetFields, type WeeklyTargetFieldValues } from './weekly-target-fields';
import { createWeeklyTarget } from '../actions/create-weekly-target';
import type { GroupWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import type { ReferenceOption, SurahJuzMapping } from '@/features/quran-reference/queries/list-reference-options';

const INITIAL_VALUES: WeeklyTargetFieldValues = {
  type: 'TAHFIDZ',
  startDate: undefined,
  endDate: undefined,
  description: '',
  status: 'TIDAK_TERCAPAI',
  progressPercent: 0,
  surahStartId: null,
  surahEndId: null,
  startAyat: null,
  endAyat: null,
  juzStartId: null,
  juzEndId: null,
  wafaId: null,
  startPage: null,
  endPage: null,
};

interface Props {
  groups: GroupWithStudents[];
  surahOptions: ReferenceOption[];
  juzOptions: ReferenceOption[];
  surahJuzMap: SurahJuzMapping[];
  wafaOptions: ReferenceOption[];
}

export function WeeklyTargetCreateDialog({ groups, surahOptions, juzOptions, surahJuzMap, wafaOptions }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [groupId, setGroupId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [values, setValues] = useState<WeeklyTargetFieldValues>(INITIAL_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedGroup = groups.find((g) => g.id === groupId);

  function reset() {
    setGroupId('');
    setSelectedIds([]);
    setValues(INITIAL_VALUES);
  }

  function handleChange<K extends keyof WeeklyTargetFieldValues>(key: K, value: WeeklyTargetFieldValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleStudent(studentId: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, studentId] : prev.filter((id) => id !== studentId)));
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? (selectedGroup?.students.map((s) => s.userId) ?? []) : []);
  }

  async function handleSubmit() {
    if (!groupId || selectedIds.length === 0 || !values.startDate || !values.endDate) {
      toast.error('Lengkapi kelompok, siswa, dan rentang tanggal terlebih dahulu');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createWeeklyTarget({
        ...values,
        groupId,
        studentIds: selectedIds,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      });

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
          <Button>
            <Target />
            Tambah Target
          </Button>
        }
      />

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="size-5" />
            Tambah Target Setoran
          </DialogTitle>
          <DialogDescription>Tetapkan target hafalan/bacaan mingguan untuk siswa bimbingan Anda.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field>
            <FieldLabel>Kelompok</FieldLabel>
            <Select
              value={groupId}
              onValueChange={(v) => {
                setGroupId(v ?? '');
                setSelectedIds([]);
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  {selectedGroup ? `${selectedGroup.name} · ${selectedGroup.classroomName}` : 'Pilih kelompok'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} · {group.classroomName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {selectedGroup && (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 rounded-md border p-2 text-sm font-medium">
                <Checkbox
                  checked={selectedIds.length === selectedGroup.students.length && selectedIds.length > 0}
                  onCheckedChange={(checked) => toggleAll(!!checked)}
                />
                <span>Untuk Semua Siswa di Kelompok Ini</span>
              </label>

              <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
                {selectedGroup.students.map((student) => (
                  <label
                    key={student.userId}
                    htmlFor={`target-student-${student.userId}`}
                    className="flex items-center gap-3 rounded-md border p-2 text-sm"
                  >
                    <Checkbox
                      id={`target-student-${student.userId}`}
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

          <WeeklyTargetFields
            surahOptions={surahOptions}
            juzOptions={juzOptions}
            surahJuzMap={surahJuzMap}
            wafaOptions={wafaOptions}
            values={values}
            onChange={handleChange}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Spinner />
                Menyimpan...
              </>
            ) : (
              'Simpan Target'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
