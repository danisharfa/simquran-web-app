'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { updateReportTemplate } from '../actions/update-report-template';
import type { ReportTemplateType } from '@/lib/generated/prisma/enums';

interface Props {
  type: ReportTemplateType;
  title: string;
  placeholders: string;
  template: string;
  readOnly?: boolean;
}

export function ReportTemplateForm({ type, title, placeholders, template, readOnly = false }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(template);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    setIsSubmitting(true);
    try {
      const result = await updateReportTemplate(type, { template: value });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Placeholder yang tersedia: {placeholders}</CardDescription>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldLabel>Template</FieldLabel>
          <Input value={value} disabled={readOnly} onChange={(e) => setValue(e.target.value)} maxLength={191} />
        </Field>
      </CardContent>
      {!readOnly && (
        <CardFooter>
          <Button onClick={handleSave} disabled={value === template || isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner />
                Menyimpan...
              </>
            ) : (
              'Simpan'
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
